/** Scenario / planning types for Kelly statewide + county vote targets (not a prediction). */

export const DEFAULT_CUSHION_PCT = 0.0075;
export const DEFAULT_MIDTERM_DROPOFF_FACTOR = 0.72;

/** Fixed relative weights for projected turnout; presidential leg is scaled by `midtermDropoffFactor`. */
export const PROJECTED_TURNOUT_WEIGHTS = {
  secretaryOfState2022: 0.45,
  treasurer2022: 0.2,
  treasurer2024: 0.2,
  presidential2024: 0.15,
} as const;

export const BASELINE_DEM_WEIGHTS = {
  secretaryOfState2022: 0.4,
  treasurer2022: 0.2,
  treasurer2024: 0.25,
  presidential2024: 0.15,
} as const;

export type WinTargetModelConfig = {
  cushionPct: number;
  midtermDropoffFactor: number;
  capacityWeights: {
    baselineDemVoteShare: number;
    registrationGoal: number;
    turnoutHeadroom: number;
    recentGrowth: number;
    countyOpportunity: number;
    travelEfficiency: number;
    localInfrastructure: number;
  };
};

export const DEFAULT_WIN_TARGET_CONFIG: WinTargetModelConfig = {
  cushionPct: DEFAULT_CUSHION_PCT,
  midtermDropoffFactor: DEFAULT_MIDTERM_DROPOFF_FACTOR,
  capacityWeights: {
    baselineDemVoteShare: 0.3,
    registrationGoal: 0.2,
    turnoutHeadroom: 0.15,
    recentGrowth: 0.15,
    countyOpportunity: 0.1,
    travelEfficiency: 0.05,
    localInfrastructure: 0.05,
  },
};

/** County short label (matches `county-priority-snapshot.json` `county`, e.g. "Pulaski"). */
export type CountyElectionHistoryRow = {
  county: string;
  sos2022TotalVotes?: number;
  sos2022DemVotes?: number;
  treasurer2022TotalVotes?: number;
  treasurer2022DemVotes?: number;
  treasurer2024TotalVotes?: number;
  treasurer2024DemVotes?: number;
  presidential2024TotalVotes?: number;
  presidential2024DemVotes?: number;
};

export type VoterRegistrationGoalRow = {
  county: string;
  goal?: number;
  registeredVoters?: number;
  source?: string;
};

export type CountyWinTargetRow = {
  county: string;

  projectedTotalVotes: number;
  legalTarget50Plus1Statewide: number;
  workingTargetWithCushionStatewide: number;

  baselineDemVotes: number;
  baselineDemShare: number;

  registrationGoal?: number;
  registrationGoalSource?: string;

  turnoutHeadroom?: number;
  turnoutHeadroomScore: number;

  recentGrowthScore: number;
  countyOpportunityScore: number;
  travelEfficiencyScore: number;
  localInfrastructureScore: number;
  countyCapacityScore: number;

  targetVotes: number;
  targetShare: number;
  targetVoteGain: number;

  confidence: "high" | "medium" | "low";
  missingData: string[];

  dashboardLabel:
    | "base_hold"
    | "growth_county"
    | "registration_opportunity"
    | "turnout_headroom"
    | "needs_data";

  /** 2022 SOS Democratic votes when available — closest comparable down-ballot race. */
  priorComparableDemVotes: number;
  countyWinContribution: number;
};

export type KellyWinTargetScenarioFile = {
  version: 1;
  generatedAt: string;
  modelNote: string;
  config: WinTargetModelConfig;
  statewide: {
    projectedStatewideVotes: number;
    legalTarget50Plus1: number;
    workingTargetWithCushion: number;
    statewideBaselineVotes: number;
    statewideVoteGap: number;
  };
  counties: CountyWinTargetRow[];
  modelWarnings: string[];
};
