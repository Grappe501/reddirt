import electionHistorySource from "../../../data/election/arkansas-county-election-history.normalized.json";
import winTargetSource from "../../../data/election/kelly-win-target-scenario-v1.json";

/** Each Po5 leader: 5 voters × 10 conversations = ~50 net votes toward county goal. */
export const PO5_VOTES_PER_LEADER = 50;
export const PO5_VOTERS_PER_LEADER = 5;
export const PO5_CONVERSATIONS_PER_LEADER = 10;
export const DEFAULT_WEEKS_REMAINING = 20;

export type VictoryEffortLevel = "green" | "yellow" | "red";

export type CountyVictoryTarget = {
  county: string;
  slug: string;
  tier?: string;
  demVote2022: number;
  demVote2024: number;
  planningBaseline: number;
  targetVote: number;
  growthNeeded: number;
  percentIncrease: number;
  weeksRemaining: number;
  weeklyVoteGoal: number;
  powerOf5LeadersNeeded: number;
  effortLevel: VictoryEffortLevel;
  isStrategic: boolean;
};

export type CityVictoryTarget = {
  name: string;
  slug: string;
  county: string;
  planningBaseline: number;
  targetVote: number;
  growthNeeded: number;
  percentIncrease: number;
  weeksRemaining: number;
  weeklyVoteGoal: number;
  powerOf5LeadersNeeded: number;
  effortLevel: VictoryEffortLevel;
  isStrategic: boolean;
};

type ElectionHistoryRow = {
  county: string;
  sos2022DemVotes?: number;
  treasurer2024DemVotes?: number;
};

type WinTargetRow = {
  county: string;
  baselineDemVotes: number;
  targetVotes: number;
  targetVoteGain: number;
};

const STRATEGIC_COUNTIES = new Set([
  "Pulaski",
  "Benton",
  "Washington",
  "Saline",
  "Searcy",
  "Faulkner",
  "Jefferson",
  "Sebastian",
  "Craighead",
  "Garland",
]);

function countyToSlug(county: string): string {
  return county.toLowerCase().replace(/\s+/g, "-");
}

function effortLevel(percentIncrease: number): VictoryEffortLevel {
  if (percentIncrease <= 10) return "green";
  if (percentIncrease <= 20) return "yellow";
  return "red";
}

function isStrategicCounty(county: string, tier?: string): boolean {
  if (tier === "A") return true;
  return STRATEGIC_COUNTIES.has(county);
}

export function computeVictoryMetrics(
  planningBaseline: number,
  targetVote: number,
  weeksRemaining: number = DEFAULT_WEEKS_REMAINING,
): Pick<
  CountyVictoryTarget,
  "growthNeeded" | "percentIncrease" | "weeklyVoteGoal" | "powerOf5LeadersNeeded" | "effortLevel"
> {
  const growthNeeded = Math.max(0, targetVote - planningBaseline);
  const percentIncrease =
    planningBaseline > 0 ? (growthNeeded / planningBaseline) * 100 : growthNeeded > 0 ? 100 : 0;
  const weeklyVoteGoal = weeksRemaining > 0 ? Math.ceil(growthNeeded / weeksRemaining) : growthNeeded;
  const powerOf5LeadersNeeded =
    growthNeeded > 0 ? Math.ceil(growthNeeded / PO5_VOTES_PER_LEADER) : 0;
  return {
    growthNeeded,
    percentIncrease,
    weeklyVoteGoal,
    powerOf5LeadersNeeded,
    effortLevel: effortLevel(percentIncrease),
  };
}

function buildCountyTargets(): CountyVictoryTarget[] {
  const history = (electionHistorySource as { rows: ElectionHistoryRow[] }).rows;
  const winRows = (winTargetSource as { counties: WinTargetRow[] }).counties;
  const historyByCounty = new Map(history.map((h) => [h.county, h]));

  return winRows.map((row) => {
    const hist = historyByCounty.get(row.county);
    const demVote2022 = hist?.sos2022DemVotes ?? 0;
    const demVote2024 = hist?.treasurer2024DemVotes ?? 0;
    const metrics = computeVictoryMetrics(row.baselineDemVotes, row.targetVotes);
    return {
      county: row.county,
      slug: countyToSlug(row.county),
      demVote2022,
      demVote2024,
      planningBaseline: row.baselineDemVotes,
      targetVote: row.targetVotes,
      weeksRemaining: DEFAULT_WEEKS_REMAINING,
      ...metrics,
      isStrategic: isStrategicCounty(row.county),
    };
  });
}

let cachedTargets: CountyVictoryTarget[] | null = null;

export function getAllCountyVictoryTargets(): CountyVictoryTarget[] {
  if (!cachedTargets) cachedTargets = buildCountyTargets();
  return cachedTargets;
}

export function getCountyVictoryTarget(countyName: string, tier?: string): CountyVictoryTarget | null {
  const base = getAllCountyVictoryTargets().find((c) => c.county === countyName);
  if (!base) return null;
  if (!tier) return base;
  return { ...base, tier, isStrategic: isStrategicCounty(countyName, tier) };
}

export function getCountyVictoryTargetBySlug(slug: string, tier?: string): CountyVictoryTarget | null {
  const normalized = slug.replace(/-county$/i, "").toLowerCase();
  const base = getAllCountyVictoryTargets().find((c) => c.slug === normalized);
  if (!base) return null;
  if (!tier) return base;
  return { ...base, tier, isStrategic: isStrategicCounty(base.county, tier) };
}

export function getCityVictoryTarget(input: {
  name: string;
  slug: string;
  county: string;
  baselineVote: number;
  targetVotes: number;
  voteGain: number;
  isTop10?: boolean;
  weeksRemaining?: number;
}): CityVictoryTarget {
  const weeks = input.weeksRemaining ?? DEFAULT_WEEKS_REMAINING;
  const metrics = computeVictoryMetrics(input.baselineVote, input.targetVotes, weeks);
  return {
    name: input.name,
    slug: input.slug,
    county: input.county,
    planningBaseline: input.baselineVote,
    targetVote: input.targetVotes,
    weeksRemaining: weeks,
    ...metrics,
    isStrategic: Boolean(input.isTop10) || STRATEGIC_COUNTIES.has(input.county),
  };
}

export function getCountyVictoryTargetsRollup() {
  const counties = getAllCountyVictoryTargets();
  return {
    countyCount: counties.length,
    totalGrowthNeeded: counties.reduce((s, c) => s + c.growthNeeded, 0),
    totalBaseline: counties.reduce((s, c) => s + c.planningBaseline, 0),
    totalTarget: counties.reduce((s, c) => s + c.targetVote, 0),
    greenCount: counties.filter((c) => c.effortLevel === "green").length,
    yellowCount: counties.filter((c) => c.effortLevel === "yellow").length,
    redCount: counties.filter((c) => c.effortLevel === "red").length,
    strategicCount: counties.filter((c) => c.isStrategic).length,
    totalPo5Leaders: counties.reduce((s, c) => s + c.powerOf5LeadersNeeded, 0),
  };
}

export function countyVictoryTargetsHref(): string {
  return "/election-plan/county-victory-targets";
}

export function countyVictoryTargetsExecutiveHref(): string {
  return "/election-plan/executive-book/county-victory-targets";
}

export function formatPercentIncrease(n: number): string {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}

export function effortLevelLabel(level: VictoryEffortLevel): string {
  if (level === "green") return "Likely achievable (0–10%)";
  if (level === "yellow") return "Requires organizing (10–20%)";
  return "Exceptional effort (20%+)";
}

export function effortLevelShortLabel(level: VictoryEffortLevel): string {
  if (level === "green") return "0–10%";
  if (level === "yellow") return "10–20%";
  return "20%+";
}
