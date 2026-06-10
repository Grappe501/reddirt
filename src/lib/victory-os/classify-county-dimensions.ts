import { ARKANSAS_COUNTY_REGISTRY } from "@/lib/county/arkansas-county-registry";
import { getCampaignRegionSlugForCounty } from "@/lib/campaign-engine/regions/arkansas-campaign-regions";
import { loadCountyKpis } from "@/lib/agents/county-intelligence/county-workbench-adapter";
import type { CountyWinTargetRow } from "@/lib/election-targets/win-target-types";
import {
  CRITICAL_ELECTORAL_COUNTIES,
  GROWTH_ELECTORAL_COUNTIES,
  LEADERSHIP_COUNTY_OVERRIDES,
} from "./leadership-county-overrides";
import type {
  ElectoralImportance,
  OpportunityLevel,
  OrganizationalReadiness,
  VictoryMapCountyProfile,
  VictoryMapClassificationStatus,
} from "./types";

export type DimensionProvenance = "leadership_override" | "heuristic_win_target" | "heuristic_kpi" | "mixed";

export type ClassifyCountyInput = {
  countyShort: string;
  countySlug: string;
  displayName: string;
  fips: string;
  regionSlug: string;
  winRow: CountyWinTargetRow | null;
  /** Percentile ranks 0–1 within statewide cohort when win row present */
  winContributionPct?: number;
  targetGainPct?: number;
};

function shortName(displayName: string): string {
  return displayName.replace(/\s+County$/i, "").trim();
}

function percentileRank(values: number[], value: number): number {
  if (values.length === 0) return 0.5;
  const sorted = [...values].sort((a, b) => a - b);
  const below = sorted.filter((v) => v < value).length;
  return below / sorted.length;
}

function classifyElectoralImportance(input: ClassifyCountyInput): {
  value: ElectoralImportance;
  provenance: DimensionProvenance;
} {
  const o = LEADERSHIP_COUNTY_OVERRIDES[input.countyShort];
  if (o?.electoralImportance) return { value: o.electoralImportance, provenance: "leadership_override" };
  if (CRITICAL_ELECTORAL_COUNTIES.has(input.countyShort)) {
    return { value: "critical", provenance: "heuristic_win_target" };
  }
  const wc = input.winContributionPct ?? 0;
  const gain = input.targetGainPct ?? 0;
  if (GROWTH_ELECTORAL_COUNTIES.has(input.countyShort) || input.winRow?.dashboardLabel === "growth_county") {
    return { value: "important", provenance: "heuristic_win_target" };
  }
  if (wc >= 0.87 || gain >= 0.82) return { value: "critical", provenance: "heuristic_win_target" };
  if (wc >= 0.45 || gain >= 0.55) return { value: "important", provenance: "heuristic_win_target" };
  if (wc >= 0.22) return { value: "helpful", provenance: "heuristic_win_target" };
  return { value: "maintenance", provenance: "heuristic_win_target" };
}

function classifyOpportunity(input: ClassifyCountyInput): { value: OpportunityLevel; provenance: DimensionProvenance } {
  const o = LEADERSHIP_COUNTY_OVERRIDES[input.countyShort];
  if (o?.opportunityLevel) return { value: o.opportunityLevel, provenance: "leadership_override" };
  const row = input.winRow;
  if (!row) return { value: "low", provenance: "heuristic_win_target" };
  const opp = row.countyOpportunityScore ?? 0;
  const head = row.turnoutHeadroomScore ?? 0;
  if (
    opp >= 0.3 ||
    head >= 0.55 ||
    row.dashboardLabel === "growth_county" ||
    row.dashboardLabel === "registration_opportunity" ||
    row.dashboardLabel === "turnout_headroom"
  ) {
    return { value: "high", provenance: "heuristic_win_target" };
  }
  if (opp >= 0.12 || head >= 0.45 || row.dashboardLabel === "base_hold") {
    return { value: "medium", provenance: "heuristic_win_target" };
  }
  return { value: "low", provenance: "heuristic_win_target" };
}

function classifyReadiness(countySlug: string): { value: OrganizationalReadiness; provenance: DimensionProvenance } {
  const o = LEADERSHIP_COUNTY_OVERRIDES[shortNameFromSlug(countySlug)];
  if (o?.organizationalReadiness) return { value: o.organizationalReadiness, provenance: "leadership_override" };
  const kpi = loadCountyKpis(countySlug);
  if (!kpi) return { value: "weak", provenance: "heuristic_kpi" };
  const score = kpi.countyReadinessScore;
  if (score >= 65) return { value: "strong", provenance: "heuristic_kpi" };
  if (score >= 35) return { value: "moderate", provenance: "heuristic_kpi" };
  return { value: "weak", provenance: "heuristic_kpi" };
}

function shortNameFromSlug(slug: string): string {
  const reg = ARKANSAS_COUNTY_REGISTRY.find((c) => c.slug === slug);
  return reg ? shortName(reg.displayName) : slug.replace(/-county$/, "").replace(/-/g, " ");
}

export function buildVictoryMapCountyProfile(input: ClassifyCountyInput): VictoryMapCountyProfile {
  const electoral = classifyElectoralImportance(input);
  const opportunity = classifyOpportunity(input);
  const readiness = classifyReadiness(input.countySlug);
  const override = LEADERSHIP_COUNTY_OVERRIDES[input.countyShort];
  const row = input.winRow;

  const provenance: DimensionProvenance =
    electoral.provenance === "leadership_override" ||
    opportunity.provenance === "leadership_override" ||
    readiness.provenance === "leadership_override"
      ? "leadership_override"
      : electoral.provenance === "heuristic_kpi" || readiness.provenance === "heuristic_kpi"
        ? "mixed"
        : "heuristic_win_target";

  return {
    countySlug: input.countySlug,
    county: input.countyShort,
    displayName: input.displayName,
    regionSlug: input.regionSlug,
    electoralImportance: electoral.value,
    opportunityLevel: opportunity.value,
    organizationalReadiness: readiness.value,
    classificationStatus: override ? "needs_review" : "draft",
    targetVotes: row?.targetVotes ?? null,
    baselineDemVotes: row?.baselineDemVotes ?? null,
    targetVoteGain: row?.targetVoteGain ?? null,
    countyWinContribution: row?.countyWinContribution ?? null,
    seedProvenance: provenance,
    notes: override?.notes,
    lockedBy: null,
    lockedAt: null,
  };
}

export function buildAllVictoryMapCountyProfiles(
  winRows: CountyWinTargetRow[],
): VictoryMapCountyProfile[] {
  const contributions = winRows.map((r) => r.countyWinContribution ?? 0);
  const gains = winRows.map((r) => r.targetVoteGain ?? 0);
  const winByShort = new Map(winRows.map((r) => [r.county, r]));

  return ARKANSAS_COUNTY_REGISTRY.map((reg) => {
    const countyShort = shortName(reg.displayName);
    const winRow = winByShort.get(countyShort) ?? null;
    return buildVictoryMapCountyProfile({
      countyShort,
      countySlug: reg.slug,
      displayName: reg.displayName,
      fips: reg.fips,
      regionSlug: getCampaignRegionSlugForCounty(reg.fips, reg.regionId),
      winRow,
      winContributionPct: winRow ? percentileRank(contributions, winRow.countyWinContribution ?? 0) : undefined,
      targetGainPct: winRow ? percentileRank(gains, winRow.targetVoteGain ?? 0) : undefined,
    });
  });
}

export function summarizeVictoryMapDimensions(counties: VictoryMapCountyProfile[]) {
  const count = (dim: keyof Pick<VictoryMapCountyProfile, "electoralImportance" | "opportunityLevel" | "organizationalReadiness">, val: string) =>
    counties.filter((c) => c[dim] === val).length;

  return {
    total: counties.length,
    electoral: {
      critical: count("electoralImportance", "critical"),
      important: count("electoralImportance", "important"),
      helpful: count("electoralImportance", "helpful"),
      maintenance: count("electoralImportance", "maintenance"),
    },
    opportunity: {
      high: count("opportunityLevel", "high"),
      medium: count("opportunityLevel", "medium"),
      low: count("opportunityLevel", "low"),
    },
    readiness: {
      strong: count("organizationalReadiness", "strong"),
      moderate: count("organizationalReadiness", "moderate"),
      weak: count("organizationalReadiness", "weak"),
    },
    needsLeadershipReview: counties.filter((c) => c.classificationStatus !== "leadership_locked").length,
    leadershipOverrides: counties.filter((c) => c.seedProvenance === "leadership_override").length,
  };
}
