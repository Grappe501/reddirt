export type MessageIntelligenceReviewStatus =
  | "DRAFT"
  | "NEEDS_REVIEW"
  | "HUMAN_VERIFIED"
  | "REJECTED";

export type MessageRecommendation = {
  id: string;
  category:
    | "SAFE_THEME"
    | "RISKY_THEME"
    | "TALKING_POINT"
    | "DEBATE_LANE"
    | "COUNTY_OPPORTUNITY"
    | "RAPID_RESPONSE"
    | "AVOID_PHRASE"
    | "EVIDENCE_ANGLE"
    | "WEAK_ANGLE";
  text: string;
  evidenceAnchors: string[];
  claimLedgerIds: string[];
  citationDepthScore: number;
  confidenceScore: number;
  reviewStatus: MessageIntelligenceReviewStatus;
  publicUseRisk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  recommendedHumanAction: string;
  sourceSystems: string[];
};

export type MessageIntelligenceRollup = {
  generatedAt: string;
  readinessScore: number;
  readinessBasis: string;
  safeMessageThemes: MessageRecommendation[];
  riskyMessageThemes: MessageRecommendation[];
  claimsNeedingCitation: MessageRecommendation[];
  claimsNeedingHumanReview: MessageRecommendation[];
  usableInternalTalkingPoints: MessageRecommendation[];
  debateMessageLanes: MessageRecommendation[];
  countyMessageOpportunities: MessageRecommendation[];
  rapidResponseOpportunities: MessageRecommendation[];
  phrasesToAvoid: MessageRecommendation[];
  strongestEvidenceAngles: MessageRecommendation[];
  weakestUnsafeAngles: MessageRecommendation[];
  governance: {
    publicationSafety: "NON_PUBLISHABLE";
    humanReviewRequired: true;
    internalOnly: true;
    labels: string[];
  };
};

export const MESSAGE_INTELLIGENCE_GOVERNANCE = {
  publicationSafety: "NON_PUBLISHABLE" as const,
  humanReviewRequired: true as const,
  internalOnly: true as const,
  labels: [
    "INTERNAL_DRAFT",
    "NON_PUBLISHABLE",
    "HUMAN_REVIEW_REQUIRED",
    "NOT_PUBLIC_CONTENT",
    "MESSAGE_SOURCE_ONLY",
  ],
};
