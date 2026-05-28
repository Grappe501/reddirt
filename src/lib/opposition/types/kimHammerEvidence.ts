/**
 * Kim Hammer evidence governance types (KH-5 Step 2).
 *
 * Normalized contracts for claims, evidence, retrieval tasks, and export packets.
 * Backward-compatible with existing JSON artifacts under data/opposition/.
 * No Prisma migration; loaders may adopt these types incrementally from Step 3 onward.
 */

/** Evidence classification used across KH-1/KH-2/KH-3 JSON artifacts. */
export type KimHammerEvidenceStatus =
  | "VERIFIED_FACT"
  | "REPORTED_CLAIM"
  | "INTERPRETATION"
  | "RESEARCH_QUESTION"
  | "NEEDS_REVIEW";

/** Source confidence used across profile and research JSON. */
export type KimHammerSourceConfidence = "LOW" | "MEDIUM" | "HIGH";

/** Publication tier for external-use gating (debate board + claim graph). */
export type KimHammerPublicationTier =
  | "TIER_1_PUBLIC_DEPLOYABLE"
  | "TIER_2_NEEDS_CORROBORATION"
  | "TIER_3_INTERNAL_ONLY"
  | "TIER_4_HIGH_CAUTION";

/** Legal risk classification for publication safety. */
export type KimHammerLegalRisk = "LOW" | "MEDIUM" | "HIGH";

/** Citation completeness on a claim. */
export type KimHammerCitationStatus = "CITED" | "PARTIAL" | "UNCITED";

/** External deployment readiness (debate board). */
export type KimHammerExternalUseStatus =
  | "READY_WITH_CITATION"
  | "USE_WITH_CAUTION"
  | "INTERNAL_ONLY"
  | "DO_NOT_USE_EXTERNALLY";

/**
 * Claim lifecycle / governance state (Step 9 target; optional on legacy JSON).
 * Maps to master-plan review workflow.
 */
export type KimHammerReviewStatus =
  | "DRAFT"
  | "NEEDS_REVIEW"
  | "APPROVED_FOR_INTERNAL_USE"
  | "APPROVED_FOR_EXTERNAL_USE"
  | "EXPORTED"
  | "BLOCKED"
  | "ARCHIVED";

/** Allowed claim lifecycle review states (Step 9). */
export const KIM_HAMMER_REVIEW_STATUSES: KimHammerReviewStatus[] = [
  "DRAFT",
  "NEEDS_REVIEW",
  "APPROVED_FOR_INTERNAL_USE",
  "APPROVED_FOR_EXTERNAL_USE",
  "EXPORTED",
  "BLOCKED",
  "ARCHIVED",
];

/** Review statuses that satisfy the external export gate when explicitly set. */
export const KIM_HAMMER_EXPORT_APPROVED_REVIEW_STATUSES: KimHammerReviewStatus[] = [
  "APPROVED_FOR_EXTERNAL_USE",
  "EXPORTED",
];

/**
 * Retrieval task execution state (Step 5 target; optional on legacy KH-3B JSON).
 */
export type KimHammerRetrievalTaskStatus =
  | "NOT_STARTED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "BLOCKED"
  | "READY_FOR_REVIEW"
  | "COMPLETE"
  | "ARCHIVED";

/** Priority band shared by gaps and tasks. */
export type KimHammerTaskPriority = "LOW" | "MEDIUM" | "HIGH";

/** Evidence polarity relative to a claim. */
export type KimHammerEvidencePolarity = "SUPPORTING" | "CHALLENGING" | "NEUTRAL";

/** Underlying document or media origin. */
export type KimHammerSourceClass =
  | "OFFICIAL_PROFILE"
  | "CAMPAIGN_PUBLISHING"
  | "LEGISLATIVE_RECORD"
  | "NEWS_MEDIA"
  | "SOCIAL_MEDIA"
  | "VIDEO_AUDIO"
  | "INTERNAL_ARTIFACT"
  | "OTHER";

export type KimHammerSourceDurability = "LOW" | "MEDIUM" | "HIGH";

/** Origin record for a piece of evidence. */
export type KimHammerSource = {
  id?: string;
  url: string;
  title?: string;
  publisher?: string;
  publishedAt?: string;
  capturedAt?: string;
  sourceClass?: KimHammerSourceClass;
  sourceDurability?: KimHammerSourceDurability;
  archiveCaptured?: boolean;
  sourceConfidence?: KimHammerSourceConfidence;
};

/** Quotable or attributable excerpt tied to a source. */
export type KimHammerCitation = {
  id?: string;
  sourceId?: string;
  sourceUrl: string;
  quote?: string;
  summary: string;
  context?: string;
  timestamp?: string;
  capturedAt?: string;
};

/**
 * Lightweight evidence reference used on public debate board JSON
 * (`supportingEvidence` / `challengingEvidence` arrays).
 */
export type KimHammerEvidenceReference = {
  summary: string;
  url: string;
};

/** Normalized evidence item linked to a claim. */
export type KimHammerEvidence = {
  id: string;
  claimId: string;
  polarity: KimHammerEvidencePolarity;
  summary: string;
  sourceUrl: string;
  sourceClass?: KimHammerSourceClass;
  sourceDurability?: KimHammerSourceDurability;
  archiveCaptured?: boolean;
  crossVerified?: boolean;
  citation?: KimHammerCitation;
  evidenceStatus?: KimHammerEvidenceStatus;
  sourceConfidence?: KimHammerSourceConfidence;
  humanReviewRequired?: boolean;
};

/** Governed assertion requiring source backing before external use. */
export type KimHammerClaim = {
  id: string;
  topic?: string;
  text: string;
  entityId?: string;

  /** Debate-board / legacy fields */
  claim?: string;

  supportingEvidence?: KimHammerEvidenceReference[];
  challengingEvidence?: KimHammerEvidenceReference[];

  evidenceStatus?: KimHammerEvidenceStatus;
  confidenceTier?: KimHammerPublicationTier;
  verificationTier?: KimHammerPublicationTier;
  confidenceScore?: number;
  citationStatus?: KimHammerCitationStatus;
  externalUseStatus?: KimHammerExternalUseStatus;
  publicationReadiness?: KimHammerExternalUseStatus;
  legalRisk?: KimHammerLegalRisk;
  humanReviewRequired?: boolean;

  /** Step 9 lifecycle fields (optional on legacy JSON) */
  reviewStatus?: KimHammerReviewStatus;
  reviewer?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  lastExportedAt?: string;
};

/**
 * KH-3B retrieval queue item (`kim-hammer-intelligence-gaps.json` gap objects).
 * Step 5 will add taskStatus, owner, dueDate, etc.
 */
export type KimHammerRetrievalTask = {
  id: string;
  priority: KimHammerTaskPriority;
  rank?: number;
  description: string;
  attackValue?: KimHammerTaskPriority;
  confidenceNeed?: KimHammerTaskPriority;
  likelySourcePath?: string[];
  externalMessageReadiness?: string;
  evidenceStatus?: KimHammerEvidenceStatus;
  notes?: string;

  /** Step 5 workflow fields (optional until task board pass) */
  taskStatus?: KimHammerRetrievalTaskStatus;
  owner?: string;
  dueDate?: string;
  lastUpdated?: string;
  completionNotes?: string;
  reviewRequired?: boolean;
};

/** Filtered deployable packet for debate/comms export (Step 6+). */
export type KimHammerExportPacket = {
  generatedAt: string;
  packetVersion: string;
  opponentId: string;
  exportFilter: {
    externalUseStatus: KimHammerExternalUseStatus;
    citationStatus: KimHammerCitationStatus;
    confidenceTier: KimHammerPublicationTier;
    legalRisk: KimHammerLegalRisk;
  };
  claims: KimHammerClaim[];
  safetyBlockers: string[];
  humanReviewRequired: boolean;
};

/** Raw debate-board row shape (backward compatible). */
export type KimHammerPublicDebateEvidenceItem = {
  id: string;
  topic: string;
  claim: string;
  supportingEvidence: KimHammerEvidenceReference[];
  challengingEvidence: KimHammerEvidenceReference[];
  confidenceTier: KimHammerPublicationTier;
  confidenceScore: number;
  citationStatus: KimHammerCitationStatus;
  externalUseStatus: KimHammerExternalUseStatus;
  legalRisk: KimHammerLegalRisk;
  humanReviewRequired: boolean;
  reviewStatus?: KimHammerReviewStatus;
  reviewer?: string;
  reviewedAt?: string | null;
  reviewNotes?: string;
  lastExportedAt?: string | null;
};

/** Raw intelligence-gaps file shape (backward compatible). */
export type KimHammerIntelligenceGapsFile = {
  generatedAt: string;
  queueVersion?: string;
  objective?: string;
  gaps: KimHammerRetrievalTask[];
};

/** Raw public debate evidence board file shape (backward compatible). */
export type KimHammerPublicDebateEvidenceBoardFile = {
  generatedAt: string;
  purpose: string;
  items: KimHammerPublicDebateEvidenceItem[];
  definitions?: {
    confidenceTiers?: KimHammerPublicationTier[];
    externalUseStatus?: KimHammerExternalUseStatus[];
    reviewStatuses?: KimHammerReviewStatus[];
  };
};

/** KH-4 claim-graph claim row (backward compatible). */
export type KimHammerClaimGraphClaim = {
  id: string;
  entityId: string;
  text: string;
  verificationTier: KimHammerPublicationTier;
  confidenceScore: number;
  publicationReadiness: KimHammerExternalUseStatus;
  reviewStatus?: KimHammerReviewStatus;
  reviewer?: string;
  reviewedAt?: string | null;
  reviewNotes?: string;
  lastExportedAt?: string | null;
};

/** KH-4 claim-graph evidence row (backward compatible). */
export type KimHammerClaimGraphEvidence = {
  id: string;
  claimId: string;
  sourceUrl: string;
  sourceClass: KimHammerSourceClass;
  sourceDurability: KimHammerSourceDurability;
  archiveCaptured: boolean;
  crossVerified: boolean;
};
