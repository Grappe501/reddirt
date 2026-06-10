/**
 * Victory OS — canonical types (doctrine: docs/campaign-events/VICTORY_OS_DOCTRINE.md)
 * Lane: RedDirt only. Advisory / planning — not autonomous execution.
 */

/** Layer 0 — Dimension 1: electoral importance to statewide victory. */
export type ElectoralImportance = "critical" | "important" | "helpful" | "maintenance";

/** Layer 0 — Dimension 2: room for growth. */
export type OpportunityLevel = "high" | "medium" | "low";

/** Layer 0 — Dimension 3: can we execute there today? */
export type OrganizationalReadiness = "strong" | "moderate" | "weak";

export type VictoryMapClassificationStatus = "draft" | "leadership_locked" | "needs_review";

/** Ops-facing county traffic light (Layer 3). */
export type CountyOpsStatus = "green" | "yellow" | "red";

/** Kelly deployment tier (resource allocation). */
export type KellyDeploymentTier = 1 | 2 | 3 | 4;

export type VictoryResourceType =
  | "kelly"
  | "surrogate"
  | "volunteer"
  | "county_chair"
  | "media"
  | "phone_bank"
  | "fundraising"
  | "literature"
  | "none";

export type CampaignVictorySeasonId =
  | "season_1_build_organization"
  | "season_2_build_familiarity"
  | "season_3_build_confidence"
  | "season_4_build_turnout"
  | "season_5_build_urgency"
  | "election_day";

/** County mission time horizons (doctrine: four-level stack). */
export type CountyMissionHorizon = "long_term" | "monthly" | "weekly" | "daily";

export type CountyMissionStatus = "proposed" | "approved" | "in_progress" | "completed" | "cancelled";

export type WeeklyDecisionStatus = "pending" | "approved" | "declined" | "modified";

export type StatewideVictoryPace = "ahead" | "on_pace" | "behind" | "unknown";

export type VictoryMapSeedProvenance = "leadership_override" | "heuristic_win_target" | "heuristic_kpi" | "mixed";

/** Layer 0 county profile — one row per county in victory-map-v1.json */
export type VictoryMapCountyProfile = {
  countySlug: string;
  /** Short label matching win-target JSON, e.g. "Pulaski" */
  county: string;
  displayName: string;
  regionSlug: string;
  electoralImportance: ElectoralImportance;
  opportunityLevel: OpportunityLevel;
  organizationalReadiness: OrganizationalReadiness;
  classificationStatus: VictoryMapClassificationStatus;
  /** Vote math from kelly-win-target-scenario-v1.json (planning only). */
  targetVotes?: number | null;
  baselineDemVotes?: number | null;
  targetVoteGain?: number | null;
  countyWinContribution?: number | null;
  seedProvenance?: VictoryMapSeedProvenance;
  notes?: string;
  lockedBy?: string | null;
  lockedAt?: string | null;
};

export type VictoryMapMeta = {
  note: string;
  exemplarCountiesComplete: number;
  totalCountiesRequired: number;
  winTargetSource: string;
  registrySource: string;
  seedScript?: string;
};

export type VictoryMapFile = {
  version: 1;
  updatedAt: string;
  doctrinePath: "docs/campaign-events/VICTORY_OS_DOCTRINE.md";
  classificationStatus: VictoryMapClassificationStatus;
  meta?: VictoryMapMeta;
  statewide: {
    workingTargetWithCushion: number;
    statewideVoteGap: number;
    scenarioNote: string;
  };
  dimensionDefinitions?: {
    electoralImportance: ElectoralImportance[];
    opportunityLevel: OpportunityLevel[];
    organizationalReadiness: OrganizationalReadiness[];
  };
  counties: VictoryMapCountyProfile[];
};

export type VictoryOsSeasonsFile = {
  version: 1;
  doctrinePath: string;
  updatedAt: string;
  decisionCadence: Record<string, string>;
  seasons: {
    id: CampaignVictorySeasonId;
    label: string;
    startYmd: string;
    endYmd: string;
    headlineQuestion: string;
    primaryMeasures: string[];
    kellyFocusMix?: Record<string, number>;
    targets?: Record<string, number>;
    regionalSwingRule?: string;
  }[];
};

export type VictoryMapDimensionCounts = {
  total: number;
  electoral: { critical: number; important: number; helpful: number; maintenance: number };
  opportunity: { high: number; medium: number; low: number };
  readiness: { strong: number; moderate: number; weak: number };
  needsLeadershipReview: number;
  leadershipOverrides: number;
};

export type VictoryMapStatewideSummary = {
  totalCounties: number;
  mapClassificationStatus: VictoryMapClassificationStatus;
  updatedAt: string;
  statewideVoteGap: number;
  workingTargetWithCushion: number;
  dimensionCounts: VictoryMapDimensionCounts;
  currentSeason: { id: CampaignVictorySeasonId; label: string; headlineQuestion: string } | null;
  topByDeploymentPriority: CountyVictoryContext[];
  criticalCountiesAtRisk: CountyVictoryContext[];
  leadershipReviewRemaining: number;
  counties: CountyVictoryContext[];
};

/** Normalized factors for deployment priority (each 0–1). */
export type DeploymentPriorityFactors = {
  victoryImportance: number;
  opportunity: number;
  readinessGap: number;
  urgency: number;
  /** Product × 100, capped 0–100 for display. */
  deploymentPriority: number;
};

export type CountyVictoryContext = VictoryMapCountyProfile & {
  opsStatus: CountyOpsStatus;
  deploymentPriority: DeploymentPriorityFactors;
  neglectDays?: number | null;
};

/**
 * Layer 1 — one ranked decision for the Campaign Manager (Top 10).
 * Doctrine: decision engine output, not a calendar row.
 */
export type WeeklyCampaignDecision = {
  id: string;
  rank: number;
  weekKey: string;
  seasonId: CampaignVictorySeasonId;
  countySlug: string;
  county: string;
  displayName: string;
  opsStatus: CountyOpsStatus;
  recommendation: string;
  resourceType: VictoryResourceType;
  kellyTier: KellyDeploymentTier;
  expectedOutcome: string;
  reason: string;
  electoralImportance: ElectoralImportance;
  opportunityLevel: OpportunityLevel;
  organizationalReadiness: OrganizationalReadiness;
  deploymentPriority: number;
  status: WeeklyDecisionStatus;
  linkedMissionId?: string | null;
};

/** Layer 1 — full Monday brief (Sprint 1 generator output). */
export type WeeklyDecisionBrief = {
  briefId: string;
  weekKey: string;
  generatedAt: string;
  seasonId: CampaignVictorySeasonId;
  seasonLabel: string;
  publicationSafety: "INTERNAL_DRAFT";
  humanReviewRequired: true;
  statewideVictory: {
    pace: StatewideVictoryPace;
    workingTargetWithCushion: number;
    statewideVoteGap: number;
    summary: string;
  };
  topDecisions: WeeklyCampaignDecision[];
  kellyDeployment: WeeklyCampaignDecision[];
  volunteerDeployment: WeeklyCampaignDecision[];
  fundraisingDeployment: WeeklyCampaignDecision[];
  countiesAtRisk: CountyVictoryContext[];
  strategicOpportunities: CountyVictoryContext[];
};

/** County mission at any horizon (Sprint 2). */
export type CountyMission = {
  id: string;
  countySlug: string;
  horizon: CountyMissionHorizon;
  /** YYYY-MM for monthly; YYYY-Www for weekly; YYYY-MM-DD for daily parent */
  periodKey: string;
  seasonId?: CampaignVictorySeasonId;
  title: string;
  objective: string;
  successMetric?: string;
  status: CountyMissionStatus;
  linkedDecisionIds?: string[];
  tacticIds?: string[];
};
