import fosSource from "../../../data/campaign-brain/fundraising-operating-system.source.json";
import { loadElectionPlanSnapshot } from "@/lib/election-plan/electionPlanSnapshot";
import { getCountyByName } from "@/lib/election-plan/load-county";
import { getCityNumericTargets } from "@/lib/election-plan/load-city-numeric-targets";
import { isBonusCitySlug } from "@/lib/election-plan/load-bonus-city-workbenches";
import { getFundraisingTracker } from "@/lib/election-plan/load-fundraising-tracker";
import type { ElectionPlanCity } from "@/lib/election-plan/types";

export type FosConfig = {
  stateGoal: number;
  stateGoalLabel: string;
  stretchMultiplierDefault: number;
  formulaExpression: string;
};

export type FosCommunityAllocation = {
  slug: string;
  name: string;
  county: string;
  countySlug: string;
  voteGoal: number;
  voteSharePct: number;
  baseGoal: number;
  stretchGoal: number;
  raised: number;
  remaining: number;
  progressPct: number;
  isBonusCity: boolean;
  isolatedFromStateRollup: boolean;
  raisedNote: string;
  formulaNote: string;
};

export type FosCountyRollup = {
  countySlug: string;
  countyName: string;
  clusterId: string | null;
  clusterName: string | null;
  communities: FosCommunityAllocation[];
  voteGoal: number;
  baseGoal: number;
  stretchGoal: number;
  raised: number;
  remaining: number;
  progressPct: number;
};

export type FosClusterRollup = {
  id: string;
  name: string;
  counties: string[];
  voteGoal: number;
  baseGoal: number;
  stretchGoal: number;
  raised: number;
  remaining: number;
  progressPct: number;
  countyRollups: FosCountyRollup[];
};

export type FosStateRollup = {
  stateGoal: number;
  top40TotalVoteGoal: number;
  voteGoalAllocated: number;
  baseGoal: number;
  stretchGoal: number;
  raised: number;
  raisedProvisional: boolean;
  raisedNote: string;
  remaining: number;
  progressPct: number;
  formulaExpression: string;
  clusters: FosClusterRollup[];
};

type FosSourceFile = {
  stateGoal: number;
  stateGoalLabel: string;
  stretchMultiplierDefault: number;
  formula: { expression: string };
  bonusCityOverrides?: Record<
    string,
    { baseGoal: number; stretchGoal: number; source: string; isolated?: boolean; note?: string }
  >;
  communityStretchMultipliers?: Record<string, number>;
};

const source = fosSource as FosSourceFile;

function top40Cities(cities: ElectionPlanCity[]): ElectionPlanCity[] {
  return cities.filter((c) => !c.isBonusCity);
}

function voteGoalForCity(city: ElectionPlanCity): number {
  const numeric = getCityNumericTargets(city.slug);
  return numeric?.votes.target ?? city.targetVotes;
}

function stretchMultiplierForSlug(slug: string): number {
  return source.communityStretchMultipliers?.[slug] ?? source.stretchMultiplierDefault;
}

function bonusOverride(slug: string) {
  return source.bonusCityOverrides?.[slug];
}

function buildCommunityAllocation(
  city: ElectionPlanCity,
  top40TotalVoteGoal: number,
): FosCommunityAllocation {
  const data = loadElectionPlanSnapshot();
  const countyRow = getCountyByName(data, city.county);
  const countySlug = countyRow?.slug ?? city.county.toLowerCase().replace(/\s+/g, "-");
  const override = bonusOverride(city.slug);
  const voteGoal = voteGoalForCity(city);
  const isBonus = Boolean(city.isBonusCity || isBonusCitySlug(city.slug));

  let baseGoal: number;
  let stretchGoal: number;
  let voteSharePct: number;
  let formulaNote: string;
  let isolatedFromStateRollup = false;

  if (override) {
    baseGoal = override.baseGoal;
    stretchGoal = override.stretchGoal;
    voteSharePct = top40TotalVoteGoal > 0 ? (voteGoal / top40TotalVoteGoal) * 100 : 0;
    formulaNote = `Bonus override · ${override.source}`;
    isolatedFromStateRollup = override.isolated ?? false;
  } else if (isBonus) {
    baseGoal = 0;
    stretchGoal = 0;
    voteSharePct = 0;
    formulaNote = "Bonus city — add override in fundraising-operating-system.source.json";
    isolatedFromStateRollup = true;
  } else {
    voteSharePct = top40TotalVoteGoal > 0 ? (voteGoal / top40TotalVoteGoal) * 100 : 0;
    baseGoal = Math.round((voteGoal / top40TotalVoteGoal) * source.stateGoal);
    stretchGoal = Math.round(baseGoal * stretchMultiplierForSlug(city.slug));
    formulaNote = `(${voteGoal.toLocaleString()} ÷ ${top40TotalVoteGoal.toLocaleString()}) × $${source.stateGoal.toLocaleString()}`;
  }

  const raised = 0;

  return {
    slug: city.slug,
    name: city.name,
    county: city.county,
    countySlug,
    voteGoal,
    voteSharePct,
    baseGoal,
    stretchGoal,
    raised,
    remaining: Math.max(0, baseGoal - raised),
    progressPct: baseGoal > 0 ? Math.min(100, (raised / baseGoal) * 100) : 0,
    isBonusCity: isBonus,
    isolatedFromStateRollup,
    raisedNote: "Raised stays $0 until compliance-backed donation records are linked to this community.",
    formulaNote,
  };
}

function allCommunityAllocations(): FosCommunityAllocation[] {
  const data = loadElectionPlanSnapshot();
  const top40 = top40Cities(data.cities);
  const totalVoteGoal = top40.reduce((sum, c) => sum + voteGoalForCity(c), 0);
  return data.cities.map((city) => buildCommunityAllocation(city, totalVoteGoal));
}

export function getFosConfig(): FosConfig {
  return {
    stateGoal: source.stateGoal,
    stateGoalLabel: source.stateGoalLabel,
    stretchMultiplierDefault: source.stretchMultiplierDefault,
    formulaExpression: source.formula.expression,
  };
}

export function getFosCommunityAllocation(slug: string): FosCommunityAllocation | null {
  const data = loadElectionPlanSnapshot();
  const city = data.cities.find((c) => c.slug === slug);
  if (!city) return null;
  const top40 = top40Cities(data.cities);
  const totalVoteGoal = top40.reduce((sum, c) => sum + voteGoalForCity(c), 0);
  return buildCommunityAllocation(city, totalVoteGoal);
}

export function getFosCountyRollup(countySlug: string): FosCountyRollup | null {
  const data = loadElectionPlanSnapshot();
  const county = data.counties.find((c) => c.slug === countySlug);
  if (!county) return null;

  const communities = allCommunityAllocations().filter(
    (c) => c.countySlug === countySlug && !c.isolatedFromStateRollup,
  );

  const cluster = data.execution?.clusters?.find((cl) => cl.counties.includes(county.county)) ?? null;

  const voteGoal = communities.reduce((s, c) => s + c.voteGoal, 0);
  const baseGoal = communities.reduce((s, c) => s + c.baseGoal, 0);
  const stretchGoal = communities.reduce((s, c) => s + c.stretchGoal, 0);
  const raised = communities.reduce((s, c) => s + c.raised, 0);

  return {
    countySlug,
    countyName: county.county,
    clusterId: cluster?.id ?? null,
    clusterName: cluster?.name ?? null,
    communities,
    voteGoal,
    baseGoal,
    stretchGoal,
    raised,
    remaining: Math.max(0, baseGoal - raised),
    progressPct: baseGoal > 0 ? Math.min(100, (raised / baseGoal) * 100) : 0,
  };
}

export function getFosClusterRollup(clusterId: string): FosClusterRollup | null {
  const data = loadElectionPlanSnapshot();
  const cluster = data.execution?.clusters?.find((c) => c.id === clusterId);
  if (!cluster) return null;

  const countyRollups = data.counties
    .filter((c) => cluster.counties.includes(c.county))
    .map((c) => getFosCountyRollup(c.slug))
    .filter((r): r is FosCountyRollup => r != null);

  const voteGoal = countyRollups.reduce((s, c) => s + c.voteGoal, 0);
  const baseGoal = countyRollups.reduce((s, c) => s + c.baseGoal, 0);
  const stretchGoal = countyRollups.reduce((s, c) => s + c.stretchGoal, 0);
  const raised = countyRollups.reduce((s, c) => s + c.raised, 0);

  return {
    id: cluster.id,
    name: cluster.name,
    counties: cluster.counties,
    voteGoal,
    baseGoal,
    stretchGoal,
    raised,
    remaining: Math.max(0, baseGoal - raised),
    progressPct: baseGoal > 0 ? Math.min(100, (raised / baseGoal) * 100) : 0,
    countyRollups,
  };
}

export function getFosStateRollup(): FosStateRollup {
  const data = loadElectionPlanSnapshot();
  const top40 = top40Cities(data.cities);
  const top40TotalVoteGoal = top40.reduce((sum, c) => sum + voteGoalForCity(c), 0);
  const allocations = allCommunityAllocations().filter((c) => !c.isolatedFromStateRollup);

  const baseGoal = allocations.reduce((s, c) => s + c.baseGoal, 0);
  const stretchGoal = allocations.reduce((s, c) => s + c.stretchGoal, 0);
  const voteGoalAllocated = allocations.reduce((s, c) => s + c.voteGoal, 0);

  const tracker = getFundraisingTracker();
  const raised = tracker.raised;
  const raisedProvisional = tracker.raisedProvisional;

  const clusters = (data.execution?.clusters ?? [])
    .map((c) => getFosClusterRollup(c.id))
    .filter((r): r is FosClusterRollup => r != null);

  return {
    stateGoal: source.stateGoal,
    top40TotalVoteGoal,
    voteGoalAllocated,
    baseGoal,
    stretchGoal,
    raised,
    raisedProvisional,
    raisedNote: tracker.raisedNote,
    remaining: Math.max(0, source.stateGoal - raised),
    progressPct: source.stateGoal > 0 ? Math.min(100, (raised / source.stateGoal) * 100) : 0,
    formulaExpression: source.formula.expression,
    clusters,
  };
}
