import { json, normalizeSignup, readSignups, requireAuth, writeSignups } from "./lib/shared.mjs";

/**
 * Optional: pull historical Netlify Forms submissions into the board store.
 * Requires NETLIFY_AUTH_TOKEN (personal access token) on the site.
 */
export default async (request) => {
  if (request.method !== "POST") return json(405, { ok: false, error: "method_not_allowed" });
  const denied = requireAuth(request);
  if (denied) return denied;

  const token = process.env.NETLIFY_AUTH_TOKEN?.trim();
  const siteId = process.env.KICKOFF_SITE_ID?.trim() || process.env.SITE_ID?.trim() || "d28aea89-02f8-4f63-b7a1-c9e9f538f7d6";
  if (!token) {
    return json(503, {
      ok: false,
      error: "missing_token",
      message: "Set NETLIFY_AUTH_TOKEN to sync from Netlify Forms.",
    });
  }

  const formsRes = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/forms`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!formsRes.ok) {
    return json(502, { ok: false, error: "forms_list_failed", status: formsRes.status });
  }
  const forms = await formsRes.json();
  const form = (Array.isArray(forms) ? forms : []).find((f) => f.name === "kickoff-signup");
  if (!form) {
    return json(404, { ok: false, error: "form_not_found" });
  }

  const subsRes = await fetch(`https://api.netlify.com/api/v1/forms/${form.id}/submissions?per_page=1000`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!subsRes.ok) {
    return json(502, { ok: false, error: "submissions_failed", status: subsRes.status });
  }
  const submissions = await subsRes.json();
  const data = await readSignups();
  const byEmailKey = new Set(data.items.map((i) => `${i.email}|${i.createdAt}`));
  let imported = 0;

  for (const sub of Array.isArray(submissions) ? submissions : []) {
    const d = sub.data || sub.numbered_fields || {};
    const createdAt = sub.created_at || sub.createdAt || new Date().toISOString();
    const email = String(d.email || "").toLowerCase();
    const key = `${email}|${createdAt}`;
    if (!email || byEmailKey.has(key)) continue;
    const item = normalizeSignup({
      id: sub.id || undefined,
      createdAt,
      source: "netlify-forms-sync",
      name: d.name,
      email: d.email,
      phone: d.phone,
      county: d.county,
      city: d.city,
      pathway: d.pathway,
      roles: d.roles,
      primaryTeam: d.primaryTeam,
      availability: d.availability,
      notes: d.notes,
      eventInterest: d.eventInterest,
      status: "new",
    });
    data.items.push(item);
    byEmailKey.add(key);
    imported += 1;
  }

  data.items.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  await writeSignups(data);
  return json(200, { ok: true, imported, total: data.items.length });
};
