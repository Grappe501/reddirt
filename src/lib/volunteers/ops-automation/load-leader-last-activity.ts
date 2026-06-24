import { prisma } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/env";

/** Latest field log timestamp per operator initials (uppercase). */
export async function loadLastFieldEntryAtByInitials(
  initialsList: string[],
): Promise<Record<string, Date | null>> {
  const codes = [...new Set(initialsList.map((i) => i.trim().toUpperCase()).filter(Boolean))];
  const result: Record<string, Date | null> = Object.fromEntries(codes.map((c) => [c, null]));
  if (!isDatabaseConfigured() || codes.length === 0) return result;

  try {
    const rows = await prisma.electionPlanFieldEntry.groupBy({
      by: ["operatorInitials"],
      where: { operatorInitials: { in: codes } },
      _max: { createdAt: true },
    });
    for (const row of rows) {
      result[row.operatorInitials] = row._max.createdAt ?? null;
    }
    return result;
  } catch {
    return result;
  }
}
