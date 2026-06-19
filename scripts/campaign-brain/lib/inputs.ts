/**
 * Load all strategic-plan outputs into Campaign Brain inputs.
 */

import path from "node:path";

import { ARKANSAS_COUNTY_REGISTRY } from "../../../src/lib/county/arkansas-county-registry";
import { readJson, shortCountyName, PLAN_ROOT, fmt } from "../../strategic-plan/lib/strategic-plan-shared";
import { ARKANSAS_TOP_100_CITIES } from "../../strategic-plan/data/arkansas-top-40-cities";
import { OPPORTUNITY_CLUSTERS } from "../../strategic-plan/data/opportunity-clusters";

const ROOT = process.cwd();
export const BRAIN_ROOT = path.join(ROOT, "docs/campaign-brain");
export const BRAIN_DATA = path.join(ROOT, "data/campaign-brain");

export type VciCounty = {
  county: string;
  slug: string;
  vci: number;
  rank: number;
  mission?: { role: string; primaryMission: string };
};

export type OpportunityCounty = {
  county: string;
  tier: string;
  rank: number;
  dropOffRecovery50: number;
  registrationGoal: number;
  republicanConversionPotential: number;
  opportunityScore: number;
};

export type ClusterRow = {
  id: string;
  name: string;
  counties: string[];
  cities: string[];
  combined: {
    lane2Recovery50: number;
    registrationGoal: number;
    lane4ConversionPotential: number;
    victoryContributionIndex: number;
  };
  recommendedVisits: number;
};

export type CommunityEvent = {
  id: string;
  type: string;
  title: string;
  county: string;
  verificationStatus?: string;
  campaignValue?: string;
  recommendedCoverage?: string;
  routeCluster?: string;
  audienceTags?: string[];
  score?: { total: number };
};

export type CapturedProgress = {
  version: number;
  note: string;
  byCounty: Record<string, { capturedVci: number; notes?: string }>;
  byCluster: Record<string, { capturedVci: number; notes?: string }>;
};

export function loadVci(): VciCounty[] {
  const data = readJson<{ counties: VciCounty[] }>(path.join(PLAN_ROOT, "command-center/victory-contribution-index.json"));
  if (!data) throw new Error("Run strategic-plan:chapter-09:build first.");
  return data.counties;
}

export function loadOpportunityCounties(): OpportunityCounty[] {
  const data = readJson<{ counties: OpportunityCounty[] }>(
    path.join(PLAN_ROOT, "part-ii-electoral-math/opportunity-scorecard/statewide-opportunity-scorecard.json"),
  );
  if (!data) throw new Error("Run strategic-plan:opportunity:build first.");
  return data.counties;
}

export function loadClusters(): ClusterRow[] {
  const data = readJson<{ clusters: ClusterRow[] }>(path.join(PLAN_ROOT, "command-center/opportunity-clusters/clusters.json"));
  if (!data) throw new Error("Run strategic-plan:clusters:build first.");
  return data.clusters;
}

export function loadCommunityEvents(): CommunityEvent[] {
  const data = readJson<{ rows: CommunityEvent[] }>(
    path.join(ROOT, "data/calendar-command-center/community-opportunities-2026.normalized.json"),
  );
  return data?.rows ?? [];
}

export function loadFestivalLeads(): Array<{ eventName: string; county: string; date?: string; reconcileStatus?: string }> {
  return readJson(path.join(ROOT, "data/calendar-command-center/festival-leads.verified.json")) ?? [];
}

export function loadCapturedProgress(): CapturedProgress {
  const p = path.join(BRAIN_DATA, "captured-progress.json");
  const existing = readJson<CapturedProgress>(p);
  if (existing) return existing;

  const byCounty: CapturedProgress["byCounty"] = {};
  for (const reg of ARKANSAS_COUNTY_REGISTRY) {
    byCounty[shortCountyName(reg.displayName)] = { capturedVci: 0 };
  }
  const byCluster: CapturedProgress["byCluster"] = {};
  for (const c of OPPORTUNITY_CLUSTERS) {
    byCluster[c.id] = { capturedVci: 0 };
  }
  return {
    version: 1,
    note: "Update capturedVci as field operations deliver visits, registrations, and relationships.",
    byCounty,
    byCluster,
  };
}

export function vciByCountyMap(vci: VciCounty[]): Map<string, VciCounty> {
  return new Map(vci.map((c) => [c.county, c]));
}

export function oppByCountyMap(opp: OpportunityCounty[]): Map<string, OpportunityCounty> {
  return new Map(opp.map((c) => [c.county, c]));
}

export function maxOf(values: number[]): number {
  return Math.max(...values, 1);
}

export function cityInfluenceByCounty(): Map<string, number> {
  const citySummary =
    readJson<{ cities: Array<{ name: string; county: string; targetVotes: number }> }>(
      path.join(PLAN_ROOT, "part-iii-arkansas-battlefield/chapter-07-top-40-city-strategy/top-40-city-summary.json"),
    )?.cities ?? [];

  const map = new Map<string, number>();
  for (const city of ARKANSAS_TOP_100_CITIES) {
    const row = citySummary.find((s) => s.name === city.name);
    const votes = row?.targetVotes ?? 0;
    map.set(city.county, (map.get(city.county) ?? 0) + votes);
  }
  return map;
}

export type DropOffTotals = {
  rawDropOff: number;
  recovery50Total: number;
};

export function loadDropOffTotals(): DropOffTotals {
  const data = readJson<{ totals: DropOffTotals }>(
    path.join(PLAN_ROOT, "part-ii-electoral-math/chapter-04-democratic-drop-off/statewide-drop-off-summary.json"),
  );
  return data?.totals ?? { rawDropOff: 102_070, recovery50Total: 51_051 };
}

export { ARKANSAS_COUNTY_REGISTRY, shortCountyName, readJson, fmt };
