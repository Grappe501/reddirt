/** NSI-4 unified campaign intelligence graph + civic signal types. */

export type CampaignGraphEntityType =
  | "BILL"
  | "LAW"
  | "NARRATIVE"
  | "CLAIM"
  | "CITATION"
  | "COUNTY"
  | "EXPORT_PACKET"
  | "DEBATE_FRAME"
  | "DOCTRINE"
  | "PHILOSOPHY"
  | "CIVIC_VALUE"
  | "COUNTY_BURDEN_THEME"
  | "GOVERNANCE_CONCEPT"
  | "AI_SUGGESTION"
  | "GEOGRAPHIC_OVERLAY"
  | "USAGE_ANALYTICS"
  | "FIELD_STRATEGY";

export type CampaignCivicSignal =
  | "CIVICALLY_ALIGNED"
  | "CIVICALLY_TENSE"
  | "CIVICALLY_FRAGILE"
  | "CIVICALLY_CENTRALIZING"
  | "CIVICALLY_EMPOWERING"
  | "CIVICALLY_OPAQUE"
  | "CIVICALLY_ACCOUNTABLE";

export type CampaignGraphEntity = {
  entityId: string;
  entityType: CampaignGraphEntityType;
  title: string;
  linkedEntities: string[];
  doctrineLinks: string[];
  countyLinks: string[];
  citationLinks: string[];
  exportLinks: string[];
  strategicThemes: string[];
  civicImpactThemes: string[];
  governingPrinciples: string[];
  operationalImpacts: string[];
  debateUsage: string[];
  messagingFrames: string[];
  publicRisk: "LOW" | "MEDIUM" | "HIGH";
  reviewStatus: "APPROVED_FOR_INTERNAL_USE" | "NEEDS_REVIEW" | "DRAFT" | "INTERPRETATION";
  graphConfidence: "LOW" | "MEDIUM" | "HIGH";
  synchronizationPriority: "P1_LIVE" | "P2_PARTIAL" | "P3_PLANNED";
  sourceArtifact?: string;
};

export type CampaignIntelligenceGraphFile = {
  generatedAt: string;
  graphVersion: string;
  purpose: string;
  entityCount: number;
  entities: CampaignGraphEntity[];
};

export type CampaignPhilosophyNode = {
  philosophyId: string;
  title: string;
  category: string;
  principle: string;
  linkedDoctrines: string[];
  linkedNarratives: string[];
  linkedBills: string[];
  linkedPhilosophyIds: string[];
  messagingFrames: string[];
  reviewStatus: string;
};

export type CampaignPhilosophyGraphFile = {
  generatedAt: string;
  graphVersion: string;
  purpose: string;
  nodes: CampaignPhilosophyNode[];
};

export type KimHammerBillCivicQuestion = {
  question: string;
  answer: string;
  evidenceStatus: "VERIFIED_FACT" | "INTERPRETATION" | "NEEDS_REVIEW";
};

export type KimHammerBillCivicIntelligence = {
  billNumber: string;
  actNumber: string | null;
  civicSignal: CampaignCivicSignal;
  civicSignalText: string;
  civicQuestions: KimHammerBillCivicQuestion[];
  civicImpactAnalysis: string[];
  democracyParticipationAnalysis: string[];
  transparencyAccountabilityAnalysis: string[];
  countyOperationsImpact: string[];
  governingPhilosophyAlignment: {
    aligned: string[];
    tense: string[];
    doctrineIds: string[];
  };
  strategicMessagingGuidance: string[];
  publicExplanationLayer: string[];
  debateFramingLayer: {
    bestContrast: string[];
    bridgeLines: string[];
    counterarguments: string[];
    traps: string[];
  };
  riskCounterattackAnalysis: string[];
  civicEnvironmentImpact: string[];
  graphEntityId: string;
  linkedEntityIds: string[];
  reviewStatus: string;
  computedAt: string;
};

export const CAMPAIGN_CIVIC_SIGNALS: CampaignCivicSignal[] = [
  "CIVICALLY_ALIGNED",
  "CIVICALLY_TENSE",
  "CIVICALLY_FRAGILE",
  "CIVICALLY_CENTRALIZING",
  "CIVICALLY_OPAQUE",
  "CIVICALLY_EMPOWERING",
  "CIVICALLY_ACCOUNTABLE",
];
