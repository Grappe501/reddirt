import { prisma } from "@/lib/db";
import { sanitizeNeighborDisplayName } from "@/lib/analytics/visitor-signals";

export { sanitizeNeighborDisplayName };

export function collectSubmissionIds(rows: Array<{ name?: string | null; payload?: unknown }>): string[] {
  const ids = new Set<string>();
  for (const row of rows) {
    if (String(row.name ?? "").trim() !== "form_complete") continue;
    const payload = row.payload && typeof row.payload === "object" && !Array.isArray(row.payload) ? row.payload : {};
    const id = String((payload as Record<string, unknown>).submissionId ?? "").trim();
    if (/^[a-zA-Z0-9_-]{8,64}$/.test(id)) ids.add(id);
  }
  return [...ids];
}

export async function loadNeighborNamesBySubmissionId(ids: string[]): Promise<Record<string, string>> {
  if (ids.length === 0) return {};
  const rows = await prisma.submission.findMany({
    where: { id: { in: ids } },
    select: { id: true, user: { select: { name: true } } },
  });
  const out: Record<string, string> = {};
  for (const row of rows) {
    const name = sanitizeNeighborDisplayName(row.user?.name);
    if (name) out[row.id] = name;
  }
  return out;
}
