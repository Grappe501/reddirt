import { prisma } from "@/lib/db";
import { sanitizeNeighborDisplayName } from "@/lib/analytics/visitor-signals";

export { sanitizeNeighborDisplayName };

export type NeighborJoin = {
  name: string | null;
  intakeId: string | null;
};

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

export function intakeHrefFor(intakeId: string | null | undefined): string | null {
  const id = (intakeId ?? "").trim();
  if (!/^[a-zA-Z0-9_-]{8,64}$/.test(id)) return null;
  return `/admin/site-analytics/intake/${id}`;
}

export async function loadNeighborJoinsBySubmissionId(ids: string[]): Promise<Record<string, NeighborJoin>> {
  if (ids.length === 0) return {};
  const rows = await prisma.submission.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      user: { select: { name: true } },
      workflowIntake: { select: { id: true } },
    },
  });
  const out: Record<string, NeighborJoin> = {};
  for (const row of rows) {
    out[row.id] = {
      name: sanitizeNeighborDisplayName(row.user?.name),
      intakeId: row.workflowIntake?.id ?? null,
    };
  }
  return out;
}
