/** NSI-3 narrative usage analytics and export fatigue types — read-only composition. */

export type KimHammerNarrativeUsageSignal =
  | "USAGE_HEALTHY"
  | "USAGE_RISING"
  | "USAGE_OVEREXPOSED"
  | "USAGE_STALE"
  | "USAGE_UNDERUTILIZED"
  | "USAGE_FRAGILE"
  | "USAGE_RECOVERING";

export type KimHammerNarrativeDeploymentEvent = {
  exportId: string;
  packetVersion: string;
  scope: string;
  countyId?: string;
  exportedAt: string;
  claimIds: string[];
  citationIds: string[];
  operator: string;
  linkReason: "NARRATIVE_ID" | "CLAIM_LINEAGE";
};

export type KimHammerNarrativeDeploymentHistory = {
  narrativeId: string;
  narrativeTitle: string;
  deploymentCount: number;
  firstDeployedAt: string | null;
  lastDeployedAt: string | null;
  lastScope: string | null;
  countyScopes: string[];
  events: KimHammerNarrativeDeploymentEvent[];
};

export type KimHammerNarrativeFreshness = {
  narrativeId: string;
  freshnessScore: number;
  staleCitationCount: number;
  needsAttentionCitationCount: number;
  oldestValidationAgeDays: number | null;
  lastReviewRecencyDays: number | null;
  signal: string;
};

export type KimHammerNarrativeFatigueRecord = {
  narrativeId: string;
  narrativeTitle: string;
  usageSignal: KimHammerNarrativeUsageSignal;
  signal: string;
  deploymentCount: number;
  freshnessScore: number;
  readinessBand: string;
  readinessScore: number;
  geographicExposureCount: number;
  geographicRiskCount: number;
  aiSuggestionPressure: number;
  blockers: string[];
  countyHeatSummary: string;
  exportLineageRefs: string[];
  computedAt: string;
};

export type KimHammerNarrativeUsageAnalyticsRecord = KimHammerNarrativeFatigueRecord & {
  deploymentHistory: KimHammerNarrativeDeploymentHistory;
  freshness: KimHammerNarrativeFreshness;
  deploymentTrend: "FLAT" | "RISING" | "FALLING" | "NONE";
};

export type KimHammerNarrativeUsageAnalyticsIndex = {
  generatedAt: string;
  narrativeCount: number;
  signalCounts: Record<KimHammerNarrativeUsageSignal, number>;
  totalDeployments: number;
  narratives: KimHammerNarrativeUsageAnalyticsRecord[];
  topFatigueWarnings: Array<{ narrativeId: string; narrativeTitle: string; signal: string }>;
  underutilizedAlerts: Array<{ narrativeId: string; narrativeTitle: string; signal: string }>;
  deploymentTimeline: Array<{ exportedAt: string; exportId: string; narrativeIds: string[]; scope: string }>;
  synchronizationReadinessSummary: {
    mappedSourceCount: number;
    integratedSourceCount: number;
    plannedSourceCount: number;
    readinessLabel: string;
  };
};

export const KIM_HAMMER_NARRATIVE_USAGE_SIGNALS: KimHammerNarrativeUsageSignal[] = [
  "USAGE_HEALTHY",
  "USAGE_RISING",
  "USAGE_OVEREXPOSED",
  "USAGE_STALE",
  "USAGE_UNDERUTILIZED",
  "USAGE_FRAGILE",
  "USAGE_RECOVERING",
];
