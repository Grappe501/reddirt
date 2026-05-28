/** SDI-1 strategic doctrine registry and alignment types — read-only composition. */

export type CampaignStrategicAlignmentSignal =
  | "STRATEGICALLY_ALIGNED"
  | "STRATEGICALLY_TENSE"
  | "STRATEGICALLY_FRAGILE"
  | "STRATEGICALLY_CONTRADICTORY"
  | "STRATEGICALLY_UNDERDEFINED"
  | "STRATEGICALLY_PRIORITY";

export type CampaignDoctrineCategory =
  | "VALUES"
  | "MESSAGING"
  | "FIELD"
  | "DEBATE"
  | "TURNOUT"
  | "OPERATIONS"
  | "COMMUNICATIONS"
  | "COALITION"
  | "VOLUNTEER"
  | "LEADERSHIP"
  | "INTELLIGENCE"
  | "COMPLIANCE"
  | "RAPID_RESPONSE"
  | "COUNTY";

export type CampaignDoctrineRegistryEntry = {
  doctrineId: string;
  title: string;
  category: CampaignDoctrineCategory;
  sourcePath: string;
  strategicDomain: string;
  doctrineType: "JSON_ARTIFACT" | "MARKDOWN_DOCTRINE" | "SYSTEM_PLAN" | "PLAYBOOK" | "RESEARCH_PACKET";
  corePrinciples: string[];
  messagingThemes: string[];
  governingPhilosophy: string;
  operationalGuidance: string;
  geographicApplicability: "STATEWIDE" | "COUNTY" | "REGION" | "MULTI_COUNTY" | "NATIONAL_CONTEXT";
  audienceApplicability: string[];
  alignmentSensitivity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  contradictionRisks: string[];
  updateCadence: string;
  stewardship: string;
  reviewStatus: "APPROVED_FOR_INTERNAL_USE" | "NEEDS_REVIEW" | "DRAFT" | "PRESENT";
  aiAccessibility: "READ_ONLY_CONTEXT" | "SANDBOX_ROUTING_ONLY" | "PROHIBITED" | "AGGREGATE_ONLY";
  synchronizationPriority: "P1_LIVE" | "P2_PARTIAL" | "P3_PLANNED";
  linkedNarrativeIds?: string[];
};

export type CampaignStrategicDoctrineRegistryFile = {
  generatedAt: string;
  registryVersion: string;
  purpose: string;
  discoveryPhase: string;
  doctrines: CampaignDoctrineRegistryEntry[];
};

export type CampaignNarrativeDoctrineAlignment = {
  narrativeId: string;
  narrativeTitle: string;
  alignmentSignal: CampaignStrategicAlignmentSignal;
  alignmentScore: number;
  signal: string;
  matchedDoctrineIds: string[];
  tensionDoctrineIds: string[];
  operationalReadinessBand: string;
  geographicDominantSignal: string | null;
  usageSignal: string | null;
  blockers: string[];
  computedAt: string;
};

export type CampaignDoctrineConsistencySignal = {
  doctrineId: string;
  doctrineTitle: string;
  signal: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  affectedNarrativeIds: string[];
};

export type CampaignStrategicAlignmentIndex = {
  generatedAt: string;
  doctrineCount: number;
  narrativeCount: number;
  signalCounts: Record<CampaignStrategicAlignmentSignal, number>;
  alignments: CampaignNarrativeDoctrineAlignment[];
  consistencySignals: CampaignDoctrineConsistencySignal[];
  topStrategicTensions: Array<{ narrativeId: string; narrativeTitle: string; signal: string }>;
  priorityDoctrineAreas: Array<{ doctrineId: string; title: string; category: string }>;
  aiSuggestionAlignmentWarnings: Array<{ suggestionId: string; title: string; warning: string }>;
};

export const CAMPAIGN_STRATEGIC_ALIGNMENT_SIGNALS: CampaignStrategicAlignmentSignal[] = [
  "STRATEGICALLY_ALIGNED",
  "STRATEGICALLY_TENSE",
  "STRATEGICALLY_FRAGILE",
  "STRATEGICALLY_CONTRADICTORY",
  "STRATEGICALLY_UNDERDEFINED",
  "STRATEGICALLY_PRIORITY",
];

export type CampaignAiSuggestionDoctrineContext = {
  suggestionId: string;
  doctrineSignal: CampaignStrategicAlignmentSignal | "NONE";
  warnings: string[];
  matchedDoctrineIds: string[];
  nonAuthoritative: true;
};
