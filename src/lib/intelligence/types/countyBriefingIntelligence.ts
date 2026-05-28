/** NSI-5 county briefing intelligence types — read-only aggregate composition. NSI-6 extends with operationalIntelligence. */

import type { CountyAggregateOperationalEnvironment } from "@/lib/intelligence/types/aggregateCampaignIntelligence";

export type CountyBriefingSignal =
  | "COUNTY_READY"
  | "COUNTY_NEEDS_RESEARCH"
  | "COUNTY_CITATION_WEAK"
  | "COUNTY_MESSAGE_RISK"
  | "COUNTY_HIGH_OPPORTUNITY"
  | "COUNTY_DEBATE_RELEVANT"
  | "COUNTY_VOLUNTEER_READY";

export type CountyBriefingConfidenceBand = "STRONG" | "MODERATE" | "WEAK" | "BLOCKED";

export type CountyBriefingLocalRiskLevel = "LOW" | "MEDIUM" | "HIGH";

export type CountyNarrativePriority = {
  narrativeId: string;
  narrativeTitle: string;
  geographicSignal: string;
  geographicScore: number;
  signalText: string;
};

export type CountyOpponentBillPriority = {
  billNumber: string;
  actNumber: string | null;
  localRelevanceScore: number;
  civicSignal: string;
  civicSignalText: string;
  localReason: string;
};

export type CountyBriefingSignalRow = {
  signal: CountyBriefingSignal;
  text: string;
};

export type CountyBriefingIntelligence = {
  countyId: string;
  countyName: string;
  region: string;
  topNarratives: CountyNarrativePriority[];
  weakNarratives: CountyNarrativePriority[];
  blockedNarratives: CountyNarrativePriority[];
  topOpponentBills: CountyOpponentBillPriority[];
  civicImpactSummary: string[];
  countyOperationsImpact: string[];
  ballotInitiativeImpact: string[];
  electionIntegrityImpact: string[];
  transparencyAccountabilityImpact: string[];
  governmentAccessibilityImpact: string[];
  citizenEmpowermentImpact: string[];
  recommendedMessagingFrames: string[];
  debatePrepGuidance: string[];
  volunteerSurrogateGuidance: string[];
  whatToAvoid: string[];
  strongestEvidence: string[];
  weakestEvidence: string[];
  openResearchNeeds: string[];
  exportReadyTalkingPoints: string[];
  doctrineAlignmentSummary: string[];
  localRiskSummary: string[];
  countyStrategyNotes: string[];
  confidenceBand: CountyBriefingConfidenceBand;
  localRiskLevel: CountyBriefingLocalRiskLevel;
  briefingSignals: CountyBriefingSignalRow[];
  graphEntityId: string;
  computedAt: string;
  /** NSI-6 operational environment composition (aggregate-only). */
  operationalIntelligence?: CountyAggregateOperationalEnvironment;
};

export type CountyBriefingIndexCard = {
  countyId: string;
  countyName: string;
  region: string;
  confidenceBand: CountyBriefingConfidenceBand;
  localRiskLevel: CountyBriefingLocalRiskLevel;
  topNarrativeTitle: string;
  topOpponentBill: string | null;
  openResearchCount: number;
  exportReadyTalkingPointCount: number;
  blockedNarrativeCount: number;
  primarySignal: CountyBriefingSignal;
  primarySignalText: string;
};

export type CountyBriefingIntelligenceIndex = {
  generatedAt: string;
  countyCount: number;
  cards: CountyBriefingIndexCard[];
  counties: CountyBriefingIntelligence[];
};

export const COUNTY_BRIEFING_SIGNALS: CountyBriefingSignal[] = [
  "COUNTY_READY",
  "COUNTY_NEEDS_RESEARCH",
  "COUNTY_CITATION_WEAK",
  "COUNTY_MESSAGE_RISK",
  "COUNTY_HIGH_OPPORTUNITY",
  "COUNTY_DEBATE_RELEVANT",
  "COUNTY_VOLUNTEER_READY",
];

export const COUNTY_REGIONS: Record<string, string> = {
  statewide: "Statewide",
  pulaski: "Central Arkansas",
  washington: "Northwest Arkansas",
  benton: "Northwest Arkansas",
  sebastian: "Western Arkansas",
  craighead: "Northeast Arkansas",
};
