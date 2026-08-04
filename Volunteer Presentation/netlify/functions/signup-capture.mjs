import { json, normalizeSignup, readSignups, writeSignups } from "./lib/shared.mjs";

/** Public capture from the kickoff signup form (honeypot + basic validation). */
export default async (request) => {
  if (request.method !== "POST") return json(405, { ok: false, error: "method_not_allowed" });

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: "invalid_json" });
  }

  if (body?.["bot-field"] || body?.website) {
    return json(200, { ok: true, accepted: true });
  }

  const name = String(body?.name || "").trim();
  const email = String(body?.email || "").trim();
  const phone = String(body?.phone || "").trim();
  const county = String(body?.county || "").trim();
  if (!name || !email || !phone || !county) {
    return json(400, { ok: false, error: "missing_fields" });
  }

  const signup = normalizeSignup({
    ...body,
    status: "new",
    source: "kickoff-form",
  });

  const data = await readSignups();
  const duplicate = data.items.find(
    (item) => item.email === signup.email && item.pathway === signup.pathway && item.primaryTeam === signup.primaryTeam,
  );
  if (duplicate) {
    return json(200, { ok: true, id: duplicate.id, duplicate: true });
  }

  data.items.unshift(signup);
  await writeSignups(data);
  return json(200, { ok: true, id: signup.id });
};
