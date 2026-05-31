/** Governed internal brief types — all outputs default NON_PUBLISHABLE until human approval. */

export const GOVERNED_BRIEF_DEFAULT_LABELS = [
  "INTERNAL_DRAFT",
  "NON_PUBLISHABLE",
  "HUMAN_REVIEW_REQUIRED",
  "SOURCE_GROUNDED",
  "CLAIM_CHECK_REQUIRED",
  "NOT_PUBLIC_CONTENT",
] as const;

export type GovernedBriefType =
  | "county_public_messaging"
  | "county_field_intelligence"
  | "opposition_research"
  | "debate_prep"
  | "rapid_response_prep"
  | "candidate_message"
  | "weekly_intelligence";

export type GovernedBriefStatus =
  | "DRAFT_INTERNAL"
  | "NEEDS_RESEARCH"
  | "READY_FOR_HUMAN_REVIEW"
  | "HUMAN_APPROVED"
  | "REJECTED"
  | "ARCHIVED";

export type GovernedBriefPublishability =
  | "NOT_PUBLISHABLE"
  | "MESSAGE_SOURCE_ONLY"
  | "APPROVED_FOR_INTERNAL_USE"
  | "APPROVED_FOR_PUBLIC_ADAPTATION"
  | "APPROVED_FOR_PUBLIC_RELEASE";

export type CountyPublicBriefReadiness =
  | "PUBLIC_BRIEF_READY"
  | "INTERNAL_MESSAGE_SOURCE_ONLY"
  | "FIELD_PLANNING_ONLY"
  | "SHELL_ONLY"
  | "BLOCKED";

export type GovernedClaimRecord = {
  claim: string;
  tier: "verified" | "unverified" | "inferred" | "unsupported";
  sourceAnchors: string[];
  notes?: string;
};

export type GovernedBrief = {
  briefId: string;
  title: string;
  briefType: GovernedBriefType;
  tags: string[];
  audience: string;
  intendedUse: string;
  status: GovernedBriefStatus;
  publishabilityStatus: GovernedBriefPublishability;
  evidenceSummary: string[];
  verifiedClaims: GovernedClaimRecord[];
  unverifiedClaims: GovernedClaimRecord[];
  inferredClaims: GovernedClaimRecord[];
  researchGaps: string[];
  recommendedMessaging: string[];
  riskWarnings: string[];
  humanReviewChecklist: string[];
  sourceAnchors: string[];
  confidenceScore: number;
  confidenceBasis: string;
  generatedAt: string;
  generatedBy: string;
  governanceLabels: typeof GOVERNED_BRIEF_DEFAULT_LABELS[number][];
};

export type MessageIntelligenceGuidance = {
  briefId: string;
  safeMessageThemes: string[];
  riskyMessageThemes: string[];
  claimsNeedingVerification: string[];
  fieldOrganizerQuestions: string[];
  debateQuestions: string[];
  countyListeningPrompts: string[];
  emailSocialAnglesInternalOnly: string[];
  governanceLabels: typeof GOVERNED_BRIEF_DEFAULT_LABELS[number][];
};

export type WeeklyIntelligencePacket = {
  packetId: string;
  generatedAt: string;
  generatedBy: string;
  status: "live";
  publicationSafety: "NON_PUBLISHABLE";
  humanReviewRequired: true;
  sourceSystemsUsed: string[];
  topIntelligencePriorities: string[];
  countyRisks: string[];
  debateReadinessMovement: string[];
  oppositionResearchGaps: string[];
  recommendedHumanActions: string[];
  unresolvedClaimRisks: string[];
  messagingOpportunities: string[];
  governanceWarnings: string[];
  notVerifiedNeedsHumanReview: string[];
  confidenceSummary: string;
  relatedHrefs: string[];
};

export function defaultGovernedBriefFields(generatedBy: string): Pick<
  GovernedBrief,
  "status" | "publishabilityStatus" | "governanceLabels" | "generatedAt" | "generatedBy"
> {
  return {
    status: "DRAFT_INTERNAL",
    publishabilityStatus: "NOT_PUBLISHABLE",
    governanceLabels: [...GOVERNED_BRIEF_DEFAULT_LABELS],
    generatedAt: new Date().toISOString(),
    generatedBy,
  };
}

export function clampBriefConfidence(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}
