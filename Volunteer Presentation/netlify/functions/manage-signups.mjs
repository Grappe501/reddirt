import { json, readSignups, requireAuth, STATUSES } from "./lib/shared.mjs";

export default async (request) => {
  if (request.method !== "GET") return json(405, { ok: false, error: "method_not_allowed" });
  const denied = requireAuth(request);
  if (denied) return denied;

  const data = await readSignups();
  const url = new URL(request.url);
  const status = url.searchParams.get("status") || "";
  const pathway = url.searchParams.get("pathway") || "";
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();

  let items = [...data.items];
  if (status && STATUSES.includes(status)) items = items.filter((i) => i.status === status);
  if (pathway) items = items.filter((i) => i.pathway === pathway);
  if (q) {
    items = items.filter((i) =>
      [i.name, i.email, i.phone, i.county, i.city, i.roles, i.primaryTeam, i.assignee, i.staffNotes, i.notes]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }

  const counts = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  for (const item of data.items) {
    counts[item.status] = (counts[item.status] || 0) + 1;
  }

  return json(200, {
    ok: true,
    total: data.items.length,
    counts,
    items,
  });
};
