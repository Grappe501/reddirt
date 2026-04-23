/**
 * DATA-2: read-only helpers for **targeting foundation** — county goals, voter-file rollups,
 * optional demographics. No scoring engine, no writes.
 *
 * @see docs/targeting-data-inventory.md
 * @see docs/goals-system-status.md
 */

import { prisma } from "@/lib/db";
import { getCountyRegistrationGoalByCountyId } from "@/lib/campaign-engine/county-goals";
import { getLatestCountyVoterMetrics } from "@/lib/voter-file/queries";

export const DATA2_PACKET = "DATA-2" as const;

/** Documentation-as-code: Prisma models relevant to vote-goal / registration planning (not exhaustive of all JSON surfaces). */
export type TargetingDataSourceRow = {
  prismaModel: string;
  purpose: string;
  voteGoalPlanningRoles: readonly string[];
};

export const TARGETING_DATA_SOURCES: readonly TargetingDataSourceRow[] = [
  {
    prismaModel: "County",
    purpose: "Canonical county dimension for public + voter FK",
    voteGoalPlanningRoles: ["geography"],
  },
  {
    prismaModel: "CountyCampaignStats",
    purpose: "Campaign-entered registration goal, volunteer targets, pipeline metadata",
    voteGoalPlanningRoles: ["registration_goal", "capacity_coarse"],
  },
  {
    prismaModel: "CountyVoterMetrics",
    purpose: "Per-snapshot county rollups; optional countyGoal/progressPercent from ETL",
    voteGoalPlanningRoles: ["registration", "geography"],
  },
  {
    prismaModel: "VoterFileSnapshot",
    purpose: "Voter file import versions for metrics",
    voteGoalPlanningRoles: ["registration"],
  },
  {
    prismaModel: "VoterRecord",
    purpose: "Roll rows; optional precinct string; no vote history in schema",
    voteGoalPlanningRoles: ["registration", "geography", "precinct_string_optional"],
  },
  {
    prismaModel: "VoterSnapshotChange",
    purpose: "Registration churn audit between snapshots",
    voteGoalPlanningRoles: ["registration"],
  },
  {
    prismaModel: "CountyPublicDemographics",
    purpose: "Optional census-style county context",
    voteGoalPlanningRoles: ["geography", "socioeconomic_context"],
  },
  {
    prismaModel: "FieldUnit / FieldAssignment",
    purpose: "Operational field geography and staffing (no County FK)",
    voteGoalPlanningRoles: ["capacity_overlay"],
  },
] as const;

export function listTargetingDataSources(): readonly TargetingDataSourceRow[] {
  return TARGETING_DATA_SOURCES;
}

/**
 * One row per county with **static** targeting inputs (no voter counts — avoid heavy aggregates).
 */
export async function listCountyTargetingInputSummaries() {
  return prisma.county.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      slug: true,
      displayName: true,
      fips: true,
      campaignStats: {
        select: {
          registrationGoal: true,
          volunteerTarget: true,
          volunteerCount: true,
          newRegistrationsSinceBaseline: true,
          registrationBaselineDate: true,
          dataPipelineSource: true,
          pipelineLastSyncAt: true,
          pipelineError: true,
        },
      },
      demographics: {
        select: {
          population: true,
          votingAgePopulation: true,
          medianHouseholdIncome: true,
          povertyRatePercent: true,
          bachelorsOrHigherPercent: true,
          source: true,
          asOfYear: true,
          reviewStatus: true,
        },
      },
    },
  });
}

export type CountyGoalAndMetrics = {
  countyId: string;
  campaignStats: Awaited<ReturnType<typeof getCountyRegistrationGoalByCountyId>>;
  latestVoterMetrics: Awaited<ReturnType<typeof getLatestCountyVoterMetrics>>;
  demographics: Awaited<ReturnType<typeof prisma.countyPublicDemographics.findUnique>>;
};

/**
 * **`CountyCampaignStats`** (via GOALS-VERIFY-1 helper) + latest complete **`CountyVoterMetrics`**
 * + **`CountyPublicDemographics`** for one county.
 */
export async function getCountyGoalAndMetrics(countyId: string): Promise<CountyGoalAndMetrics> {
  const [campaignStats, latestVoterMetrics, demographics] = await Promise.all([
    getCountyRegistrationGoalByCountyId(countyId),
    getLatestCountyVoterMetrics(countyId),
    prisma.countyPublicDemographics.findUnique({ where: { countyId } }),
  ]);
  return { countyId, campaignStats, latestVoterMetrics, demographics };
}
