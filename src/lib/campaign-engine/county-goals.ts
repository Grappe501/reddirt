/**
 * GOALS-VERIFY-1: read-only access to **county registration goals** on `CountyCampaignStats`.
 *
 * **Source of truth** for the numeric target is `CountyCampaignStats.registrationGoal` (admin/seed).
 * `CountyVoterMetrics.countyGoal` is a per-snapshot copy produced by
 * `recomputeAllCountyVoterMetricsForSnapshot` — use `getLatestCountyVoterMetrics` when you need
 * progress on the latest complete voter file snapshot.
 *
 * @see docs/county-registration-goals-verification.md
 */

import { prisma } from "@/lib/db";

export const GOALS_VERIFY1_PACKET = "GOALS-VERIFY-1" as const;

const countyListSelect = {
  id: true,
  slug: true,
  displayName: true,
  sortOrder: true,
} as const;

/**
 * All counties that have a `CountyCampaignStats` row, with county display fields (sort order).
 */
export async function listCountyRegistrationGoals() {
  return prisma.countyCampaignStats.findMany({
    orderBy: { county: { sortOrder: "asc" } },
    include: { county: { select: countyListSelect } },
  });
}

/**
 * One county’s `CountyCampaignStats` (includes `registrationGoal`) plus county labels.
 * Returns `null` if the county has no stats row (goals may be unset until created in admin/seed).
 */
export async function getCountyRegistrationGoalByCountyId(countyId: string) {
  return prisma.countyCampaignStats.findUnique({
    where: { countyId },
    include: { county: { select: countyListSelect } },
  });
}
