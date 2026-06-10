/**
 * Victory OS Sprint 4 — Victory Board types (intelligence from decisions, not raw dumps).
 */

import type {
  CountyOpsStatus,
  CountyVictoryContext,
  ElectoralImportance,
  WeeklyCampaignDecision,
} from "./types";

export type VictoryBoardMapLayer =
  | "deployment_priority"
  | "ops_status"
  | "electoral_importance"
  | "decision_rank";

export type VictoryBoardCountyPin = {
  countySlug: string;
  county: string;
  displayName: string;
  regionSlug: string;
  lat: number;
  lng: number;
  deploymentPriority: number;
  opsStatus: CountyOpsStatus;
  electoralImportance: ElectoralImportance;
  opportunityLevel: string;
  organizationalReadiness: string;
  decisionRank: number | null;
  inTop10: boolean;
  decisionStatus: WeeklyCampaignDecision["status"] | null;
  fillColor: string;
  strokeColor: string;
  pinSize: number;
  tooltipLine: string;
};

export type VictoryBoardChartBar = {
  label: string;
  value: number;
  color: string;
  pct?: number;
};

export type VictoryBoardChartSeries = {
  id: string;
  title: string;
  subtitle?: string;
  bars: VictoryBoardChartBar[];
};

export type VictoryBoardRegionRollup = {
  regionSlug: string;
  regionLabel: string;
  countyCount: number;
  avgDeploymentPriority: number;
  criticalCount: number;
  redOpsCount: number;
  topDecisionCount: number;
};

export type VictoryBoardViewModel = {
  version: 1;
  weekKey: string;
  generatedAt: string;
  publicationSafety: "INTERNAL_DRAFT";
  mapLayerDefault: VictoryBoardMapLayer;
  pins: VictoryBoardCountyPin[];
  charts: VictoryBoardChartSeries[];
  regionRollups: VictoryBoardRegionRollup[];
  topDecisions: WeeklyCampaignDecision[];
  countiesAtRisk: CountyVictoryContext[];
  strategicOpportunities: CountyVictoryContext[];
  intelligenceNarrative: string;
  statewide: {
    pace: string;
    statewideVoteGap: number;
    workingTargetWithCushion: number;
    seasonLabel: string;
    approvalPct: number;
    pendingDecisions: number;
  };
  electionDaysRemaining: number;
};

export type VictoryBoardSnapshotFile = VictoryBoardViewModel & {
  doctrinePath: "docs/campaign-events/VICTORY_OS_DOCTRINE.md";
  sourceBriefId: string | null;
};
