/** NSI-6 aggregate campaign intelligence types — read-only, aggregate-only discipline. */

export type CampaignIntelligenceAdapterSourceStatus =
  | "LIVE"
  | "PARTIAL"
  | "PLANNED"
  | "SCAFFOLD";

export type CampaignIntelligenceAdapterGovernance =
  | "GOVERNED_READ"
  | "AGGREGATE_ONLY"
  | "PROHIBITED";

export type CampaignIntelligenceReadAdapter = {
  adapterId: string;
  systemName: string;
  dataDomain: string;
  aggregateOnly: true;
  governanceLevel: CampaignIntelligenceAdapterGovernance;
  synchronizationPriority: "P1_LIVE" | "P2_PARTIAL" | "P3_PLANNED" | "P4_FUTURE";
  geographicCoverage: "statewide" | "county" | "region" | "media_market";
  updateCadence: string;
  sourceStatus: CampaignIntelligenceAdapterSourceStatus;
  aiAccessibility: "READ_ONLY" | "PROHIBITED" | "EXPLAIN_ONLY";
  entityMappings: string[];
  operationalUseCases: string[];
  futureExpansionNotes: string;
  sourceArtifact?: string;
};

export type CampaignIntelligenceReadAdapterRegistryFile = {
  generatedAt: string;
  registryVersion: string;
  purpose: string;
  aggregateOnlyPolicy: string;
  adapters: CampaignIntelligenceReadAdapter[];
};

export type CountyOperationalSignal =
  | "COUNTY_OPERATIONALLY_STABLE"
  | "COUNTY_OPERATIONALLY_STRAINED"
  | "COUNTY_TURNOUT_VOLATILE"
  | "COUNTY_VOLUNTEER_WEAK"
  | "COUNTY_MEDIA_SATURATED"
  | "COUNTY_CIVIC_DISENGAGED"
  | "COUNTY_HIGH_OPPORTUNITY"
  | "COUNTY_STRUCTURALLY_COMPLEX";

export type CountyOperationalSignalRow = {
  signal: CountyOperationalSignal;
  text: string;
};

export type CountyAggregateOperationalEnvironment = {
  countyId: string;
  countyName: string;
  registrySlug: string;
  operationalEnvironment: string[];
  turnoutParticipationEnvironment: string[];
  volunteerFieldReadiness: string[];
  mediaEcosystemEnvironment: string[];
  demographicEconomicContext: string[];
  strategicOpportunityAnalysis: string[];
  operationalRiskAnalysis: string[];
  operationalSignals: CountyOperationalSignalRow[];
  adapterIdsUsed: string[];
  regionalClusterId: string | null;
  computedAt: string;
};

export type AggregateCampaignIntelligenceIndex = {
  generatedAt: string;
  adapterCount: number;
  liveAdapterCount: number;
  countiesEnriched: number;
  countyEnvironments: CountyAggregateOperationalEnvironment[];
};

export type RegionalNarrativeCluster = {
  clusterId: string;
  title: string;
  countyIds: string[];
  sharedThemes: string[];
  dominantOperationalSignal: CountyOperationalSignal | "MIXED";
  deploymentSummary: string;
};

export const COUNTY_OPERATIONAL_SIGNALS: CountyOperationalSignal[] = [
  "COUNTY_OPERATIONALLY_STABLE",
  "COUNTY_OPERATIONALLY_STRAINED",
  "COUNTY_TURNOUT_VOLATILE",
  "COUNTY_VOLUNTEER_WEAK",
  "COUNTY_MEDIA_SATURATED",
  "COUNTY_CIVIC_DISENGAGED",
  "COUNTY_HIGH_OPPORTUNITY",
  "COUNTY_STRUCTURALLY_COMPLEX",
];
