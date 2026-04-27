/**
 * County Dashboard v2 — shared data shapes (OIS shell). County-specific builders extend as needed.
 */

export type CountyDashboardLabeledMetric<T> = {
  value: T;
  source: "db" | "derived" | "demo";
  note?: string;
};

export type CountyDashboardExecutiveKpiStrip = {
  population: CountyDashboardLabeledMetric<number | null>;
  registeredVoters: CountyDashboardLabeledMetric<number | null>;
  turnout2024: CountyDashboardLabeledMetric<number | null>;
  activePowerTeams: CountyDashboardLabeledMetric<number>;
  completePowerTeams: CountyDashboardLabeledMetric<number>;
  peopleSignedUp: CountyDashboardLabeledMetric<number>;
  coverageRate: CountyDashboardLabeledMetric<number>;
  organizingReadinessScore: CountyDashboardLabeledMetric<number>;
  candidatePipelineScore: CountyDashboardLabeledMetric<number>;
  priorityLevel: CountyDashboardLabeledMetric<"P1" | "P2" | "P3">;
};

export type CountyDashboardCityDrilldown = {
  key: string;
  displayName: string;
  population: CountyDashboardLabeledMetric<number>;
  registeredVoters: CountyDashboardLabeledMetric<number>;
  powerTeams: CountyDashboardLabeledMetric<number>;
  coveragePct: CountyDashboardLabeledMetric<number>;
  turnoutGapPct: CountyDashboardLabeledMetric<number>;
  priorityScore: CountyDashboardLabeledMetric<number>;
  nextAction: string;
  futureCityHref: string;
  futurePrecinctPattern: string;
};

export type CountyDashboardPowerOfFiveKpis = {
  teamsFormed: CountyDashboardLabeledMetric<number>;
  teamsComplete: CountyDashboardLabeledMetric<number>;
  teamsIncomplete: CountyDashboardLabeledMetric<number>;
  peopleInvited: CountyDashboardLabeledMetric<number>;
  peopleActivated: CountyDashboardLabeledMetric<number>;
  conversationsLogged: CountyDashboardLabeledMetric<number>;
  followUpsDue: CountyDashboardLabeledMetric<number>;
  weeklyGrowth: CountyDashboardLabeledMetric<number>;
  leaderGaps: CountyDashboardLabeledMetric<number>;
  teamCompletionRate: CountyDashboardLabeledMetric<number>;
};

export type CountyDashboardChartPoint = { label: string; value: number };

/**
 * Relational / Power of 5 chart slices — aggregate demo until field telemetry backs them.
 * Aligns bar charts with invite → activate → team depth (no individual nodes on public pages).
 */
export type PowerOf5RelationalChartBundle = {
  /** Weekly relational touches (conversations / meaningful contacts — demo scale). */
  conversationsTrend: CountyDashboardChartPoint[];
  /** Funnel stages from the same demo numerators as the KPI strip. */
  inviteActivateFunnel: CountyDashboardChartPoint[];
  /** Optional follow-up queue shape (cadence / buckets). */
  followUpCadence?: CountyDashboardChartPoint[];
};

export type CountyDashboardChartBundle = {
  turnoutTrend: CountyDashboardChartPoint[];
  voteShareTrend: CountyDashboardChartPoint[];
  powerTeamGrowth: CountyDashboardChartPoint[];
  coverageByCity: { label: string; value: number }[];
  volunteerPipeline: CountyDashboardChartPoint[];
  candidatePipeline: CountyDashboardChartPoint[];
  issueIntensity: { issue: string; score: number }[];
  /** When set, `CountyChartPanel` renders relational bars above electoral/trend blocks. */
  relational?: PowerOf5RelationalChartBundle;
};

export type CountyDashboardNextAction = {
  id: string;
  title: string;
  ownerRole: string;
  urgency: "high" | "medium" | "low";
  expectedImpact: string;
  kpiAffected: string;
  nextStep: string;
};

export type CountyDashboardRiskRow = {
  id: string;
  category: string;
  severity: "high" | "medium" | "low";
  mitigation: string;
  ownerRole: string;
};

export type CountyDashboardStrategyNarrative = {
  strongest: string;
  weakest: string;
  nextOrganizingMove: string;
  riverValleyRollup: string;
  powerOfFiveLift: string;
};

export type CountyDashboardVisualLabels = {
  countyMap: string;
  cityMap: string;
  precinctMap: string;
  teamDensity: string;
  coverageGaps: string;
  growth: string;
};

/** UI-ready payload (no per-county Prisma / engine types). */
export type CountyDashboardV2 = {
  countySlug: string;
  displayName: string;
  fips: string;
  /** Unchanged command ID from `arkansas-county-registry` (stable; not renamed). */
  regionCode: string;
  /**
   * Preferred stakeholder-facing label from `arkansas-campaign-regions` when wired;
   * may differ from `registryCommandRegionLabel` (e.g. Pope → River Valley).
   */
  regionLabel: string;
  /** Long label from registry `ARKANSAS_COMMAND_REGIONS` for footnotes when campaign label differs. */
  registryCommandRegionLabel?: string;
  /** Campaign slug from CANON-REGION-1 (e.g. `river-valley`). */
  campaignRegionSlug?: string;
  generatedAt: string;
  dataWarnings: string[];
  executive: CountyDashboardExecutiveKpiStrip;
  powerOfFive: CountyDashboardPowerOfFiveKpis;
  strategy: CountyDashboardStrategyNarrative;
  cities: CountyDashboardCityDrilldown[];
  precinctPlaceholders: { id: string; label: string; note: string }[];
  charts: CountyDashboardChartBundle;
  nextActions: CountyDashboardNextAction[];
  risks: CountyDashboardRiskRow[];
  visualLabels: CountyDashboardVisualLabels;
  priorityVoterOnRoll: number | null;
};

export type CountyDashboardKpiItem = {
  label: string;
  metric: CountyDashboardLabeledMetric<number | null | string>;
  actionHint: string;
};
