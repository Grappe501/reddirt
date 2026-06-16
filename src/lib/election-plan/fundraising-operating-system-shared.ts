import fosSource from "../../../data/campaign-brain/fundraising-operating-system.source.json";

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
};

const source = fosSource as FosSourceFile;

/** Client-safe — reads static JSON only (no server-only snapshot). */
export function getFosConfig(): FosConfig {
  return {
    stateGoal: source.stateGoal,
    stateGoalLabel: source.stateGoalLabel,
    stretchMultiplierDefault: source.stretchMultiplierDefault,
    formulaExpression: source.formula.expression,
  };
}

export function getFosSourceFile(): FosSourceFile & {
  bonusCityOverrides?: Record<
    string,
    { baseGoal: number; stretchGoal: number; source: string; isolated?: boolean; note?: string }
  >;
  communityStretchMultipliers?: Record<string, number>;
} {
  return fosSource as FosSourceFile & {
    bonusCityOverrides?: Record<
      string,
      { baseGoal: number; stretchGoal: number; source: string; isolated?: boolean; note?: string }
    >;
    communityStretchMultipliers?: Record<string, number>;
  };
}
