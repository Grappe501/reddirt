import type { GovernedBriefType } from "./governedBriefTypes";

export const EVIDENCE_PACKET_GOVERNANCE_LABELS = [
  "INTERNAL_ONLY",
  "NON_PUBLISHABLE",
  "HUMAN_REVIEW_REQUIRED",
  "CLAIM_CHECK_REQUIRED",
  "CITATION_REQUIRED",
  "NO_SEND",
  "NO_PUBLIC_EXPORT",
] as const;

export type EvidencePacketGovernanceLabel = (typeof EVIDENCE_PACKET_GOVERNANCE_LABELS)[number];

export type EvidencePacketGovernance = {
  labels: EvidencePacketGovernanceLabel[];
  publicationSafety: "NON_PUBLISHABLE";
  humanReviewRequired: true;
  noSend: true;
  noPublicExport: true;
  citationRequired: true;
};

export type EvidencePacketSource = {
  sourceId: string;
  system: string;
  anchor: string;
  description: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  staleRisk: boolean;
};

export type EvidencePacketClaimCandidate = {
  claimId: string;
  claimText: string;
  tierHint: "verified" | "unverified" | "inferred" | "unsupported";
  sourceAnchorIds: string[];
};

export type EvidencePacketCitationAnchor = {
  anchorId: string;
  label: string;
  sourceSystem: string;
  urlOrPath?: string;
  requiredForPublicUse: boolean;
};

export type EvidencePacketResearchGap = {
  gapId: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  blocksPublicUse: boolean;
};

export type EvidencePacketGenerationContext = {
  countyReadiness?: string;
  shellCounty?: boolean;
  canonicalGoalVerified?: boolean;
  oppositionArchiveThin?: boolean;
  debateClipCount?: number;
  exportReadyClaimCount?: number;
  orchestratorRunId?: string;
};

export type EvidencePacket = {
  id: string;
  briefId: string;
  briefType: GovernedBriefType | string;
  title: string;
  subject: string;
  county: string | null;
  opponent: string | null;
  topicTags: string[];
  intendedUse: string;
  generatedAt: string;
  generatedBy: string;
  sourceSystems: string[];
  evidenceSummary: string[];
  sourceAnchors: EvidencePacketCitationAnchor[];
  sources: EvidencePacketSource[];
  verifiedClaimCandidates: EvidencePacketClaimCandidate[];
  inferredClaimCandidates: EvidencePacketClaimCandidate[];
  unsupportedClaimWarnings: string[];
  researchGaps: EvidencePacketResearchGap[];
  governance: EvidencePacketGovernance;
  confidenceScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  operatorInstructions: string[];
  generationContext: EvidencePacketGenerationContext;
};

export function defaultEvidencePacketGovernance(): EvidencePacketGovernance {
  return {
    labels: [...EVIDENCE_PACKET_GOVERNANCE_LABELS],
    publicationSafety: "NON_PUBLISHABLE",
    humanReviewRequired: true,
    noSend: true,
    noPublicExport: true,
    citationRequired: true,
  };
}

export function clampEvidenceConfidence(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}
