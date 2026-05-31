/** Claim ledger types — JSON-first; interfaces designed for future Prisma/Postgres migration. */

export type ClaimClassification = "VERIFIED" | "INFERRED" | "UNSUPPORTED" | "NEEDS_REVIEW";

export type ClaimVerificationStatus =
  | "DRAFT"
  | "NEEDS_REVIEW"
  | "HUMAN_VERIFIED"
  | "HUMAN_APPROVED_INTERNAL"
  | "HUMAN_APPROVED_FOR_PUBLIC_ADAPTATION"
  | "REJECTED"
  | "RETIRED";

export type ClaimPublishabilityStatus =
  | "NOT_PUBLISHABLE"
  | "MESSAGE_SOURCE_ONLY"
  | "APPROVED_FOR_INTERNAL_USE"
  | "APPROVED_FOR_PUBLIC_ADAPTATION"
  | "APPROVED_FOR_PUBLIC_RELEASE";

export type ClaimInternalUseStatus =
  | "DO_NOT_USE"
  | "RESEARCH_ONLY"
  | "SAFE_FOR_INTERNAL_STRATEGY"
  | "SAFE_FOR_DRAFTING_WITH_CITATION"
  | "READY_FOR_REVIEWED_MESSAGE_USE";

export type ClaimSupportType =
  | "DIRECT_SUPPORT"
  | "INDIRECT_SUPPORT"
  | "CONTEXT_ONLY"
  | "CONTRADICTS"
  | "WEAK_SUPPORT"
  | "NEEDS_CONFIRMATION";

export type EvidenceStrength = "NONE" | "WEAK" | "MODERATE" | "STRONG" | "HIGH_CONFIDENCE";

export type ClaimHistoryEventType =
  | "CREATED"
  | "INGESTED"
  | "MERGED"
  | "SUBMITTED_FOR_REVIEW"
  | "APPROVED_INTERNAL"
  | "APPROVED_PUBLIC_ADAPTATION"
  | "REJECTED"
  | "RETIRED"
  | "REQUIRES_MORE_EVIDENCE"
  | "SCORE_UPDATED";

export type ClaimHistoryEntry = {
  timestamp: string;
  eventType: ClaimHistoryEventType;
  actor: string;
  previousStatus: ClaimVerificationStatus | null;
  nextStatus: ClaimVerificationStatus | null;
  notes: string;
};

export type HumanReviewRecord = {
  reviewedBy: string | null;
  reviewedAt: string | null;
  decision: string | null;
  notes: string;
  requiredEdits: string[];
  approvalScope: "NONE" | "INTERNAL" | "PUBLIC_ADAPTATION" | "PUBLIC_RELEASE";
};

export type ClaimLedgerEntry = {
  id: string;
  claimText: string;
  normalizedClaimText: string;
  claimFingerprint: string;
  claimType: string;
  domain: "county" | "opposition" | "debate" | "rapid_response" | "weekly" | "message" | "general";
  countySlug: string | null;
  opponentId: string | null;
  topicTags: string[];
  sourceBriefIds: string[];
  sourceEvidencePacketIds: string[];
  sourceReviewItemIds: string[];
  citationAnchorIds: string[];
  supportingSourceIds: string[];
  contradictingSourceIds: string[];
  classification: ClaimClassification;
  verificationStatus: ClaimVerificationStatus;
  publishabilityStatus: ClaimPublishabilityStatus;
  evidenceDepthScore: number;
  evidenceStrength: EvidenceStrength;
  confidenceScore: number;
  publicUseRisk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  internalUseStatus: ClaimInternalUseStatus;
  recommendedHumanAction: string;
  humanReview: HumanReviewRecord;
  history: ClaimHistoryEntry[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastReviewedAt: string | null;
};

export type CitationSource = {
  id: string;
  title: string;
  sourceType: "file" | "registry" | "url" | "internal_note" | "public_record" | "media";
  urlOrPath: string | null;
  publicationDate: string | null;
  retrievedAt: string;
  author: string | null;
  publisher: string | null;
  jurisdiction: string | null;
  countySlug: string | null;
  opponentId: string | null;
  reliabilityRating: "LOW" | "MEDIUM" | "HIGH";
  sourceConfidence: number;
  quoteOrExcerpt: string | null;
  summary: string;
  limitations: string[];
  createdAt: string;
};

export type CitationAnchor = {
  id: string;
  sourceId: string;
  anchorType: "file_path" | "registry_key" | "url" | "claim_graph" | "evidence_index";
  lineRange: string | null;
  pageNumber: string | null;
  section: string | null;
  claimSupportType: ClaimSupportType;
  excerpt: string | null;
  notes: string;
};

/** JSON file shapes — swap persistence layer without changing business logic. */
export type ClaimLedgerFile = {
  version: number;
  generatedAt: string;
  purpose: string;
  entries: ClaimLedgerEntry[];
};

export type CitationSourcesFile = {
  version: number;
  generatedAt: string;
  sources: CitationSource[];
};

export type CitationAnchorsFile = {
  version: number;
  generatedAt: string;
  anchors: CitationAnchor[];
};

export type ClaimLedgerAuditEvent = {
  eventId: string;
  timestamp: string;
  eventType: string;
  claimId: string | null;
  actor: string;
  details: string;
};

export type ClaimLedgerAuditLogFile = {
  version: number;
  generatedAt: string;
  events: ClaimLedgerAuditEvent[];
};

export const CLAIM_LEDGER_DEFAULTS = {
  verificationStatus: "DRAFT" as ClaimVerificationStatus,
  publishabilityStatus: "NOT_PUBLISHABLE" as ClaimPublishabilityStatus,
  internalUseStatus: "RESEARCH_ONLY" as ClaimInternalUseStatus,
};
