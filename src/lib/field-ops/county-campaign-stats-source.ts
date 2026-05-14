import type { PrismaClient } from "@prisma/client";

export type CountyCampaignStatsSourceRow = {
  county: string;
  countyId: string;
  registrationGoal?: number;
  volunteerTarget?: number;
  volunteerCount?: number;
  campaignVisits?: number;
  newRegistrationsSinceBaseline?: number;
  registrationBaselineDate?: string;
};

export async function loadCountyCampaignStatsSource(
  prisma: PrismaClient,
): Promise<{ rows: CountyCampaignStatsSourceRow[]; warning?: string }> {
  try {
    const rows = await prisma.countyCampaignStats.findMany({
      orderBy: { county: { sortOrder: "asc" } },
      include: {
        county: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    return {
      rows: rows.map((r) => ({
        county: r.county.displayName.replace(/\s+County$/i, "").trim(),
        countyId: r.county.id,
        registrationGoal: r.registrationGoal ?? undefined,
        volunteerTarget: r.volunteerTarget ?? undefined,
        volunteerCount: r.volunteerCount ?? undefined,
        campaignVisits: r.campaignVisits ?? undefined,
        newRegistrationsSinceBaseline: r.newRegistrationsSinceBaseline ?? undefined,
        registrationBaselineDate: r.registrationBaselineDate?.toISOString(),
      })),
    };
  } catch (e) {
    return {
      rows: [],
      warning: `CountyCampaignStats unavailable; using staged JSON fallback (${e instanceof Error ? e.message : "unknown error"}).`,
    };
  }
}

export function campaignStatsRowsByCounty(rows: CountyCampaignStatsSourceRow[]): Map<string, CountyCampaignStatsSourceRow> {
  return new Map(rows.map((r) => [r.county, r]));
}
