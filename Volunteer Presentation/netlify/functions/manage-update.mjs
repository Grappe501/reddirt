import { json, normalizeSignup, readSignups, requireAuth, STATUSES, writeSignups } from "./lib/shared.mjs";

export default async (request) => {
  if (request.method !== "PATCH" && request.method !== "POST") {
    return json(405, { ok: false, error: "method_not_allowed" });
  }
  const denied = requireAuth(request);
  if (denied) return denied;

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: "invalid_json" });
  }

  const id = String(body?.id || "").trim();
  if (!id) return json(400, { ok: false, error: "missing_id" });

  const data = await readSignups();
  const idx = data.items.findIndex((i) => i.id === id);
  if (idx < 0) return json(404, { ok: false, error: "not_found" });

  const current = data.items[idx];
  const next = normalizeSignup({
    ...current,
    status: body.status && STATUSES.includes(body.status) ? body.status : current.status,
    assignee: body.assignee !== undefined ? body.assignee : current.assignee,
    staffNotes: body.staffNotes !== undefined ? body.staffNotes : current.staffNotes,
    createdAt: current.createdAt,
    id: current.id,
  });

  data.items[idx] = next;
  await writeSignups(data);
  return json(200, { ok: true, item: next });
};
