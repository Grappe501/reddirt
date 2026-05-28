import type {
  KimHammerEvidencePolarity,
  KimHammerEvidenceStatus,
  KimHammerSource,
  KimHammerSourceClass,
  KimHammerSourceConfidence,
  KimHammerSourceDurability,
} from "@/lib/opposition/types/kimHammerEvidence";

/** Operator review state on a durable citation card. */
export type KimHammerCitationReviewStatus =
  | "DRAFT"
  | "NEEDS_REVIEW"
  | "VERIFIED"
  | "STALE"
  | "ARCHIVED";

/** Source health signal for narrative confidence and revalidation routing. */
export type KimHammerSourceHealthStatus =
  | "HEALTHY"
  | "NEEDS_REVALIDATION"
  | "STALE"
  | "ARCHIVE_MISSING"
  | "BROKEN";

/** First-class reusable evidence unit in the citation locker. */
export type KimHammerCitationCard = {
  id: string;
  sourceId: string;
  sourceUrl: string;
  summary: string;
  quote?: string;
  context?: string;
  sourceClass: KimHammerSourceClass;
  sourceDurability: KimHammerSourceDurability;
  archiveCaptured: boolean;
  crossVerified: boolean;
  reviewStatus: KimHammerCitationReviewStatus;
  sourceHealth: KimHammerSourceHealthStatus;
  evidenceStatus: KimHammerEvidenceStatus;
  sourceConfidence: KimHammerSourceConfidence;
  originTaskId?: string;
  linkedClaimIds: string[];
  linkedNarrativeIds?: string[];
  capturedAt: string;
  lastValidatedAt?: string;
  lastUpdated: string;
  operatorNotes?: string;
};

/** Claim ↔ citation attachment with polarity. */
export type KimHammerCitationClaimLink = {
  claimId: string;
  citationId: string;
  polarity: KimHammerEvidencePolarity;
};

/** V3-C citation locker JSON artifact. */
export type KimHammerCitationLockerFile = {
  generatedAt: string;
  lockerVersion: string;
  purpose: string;
  sources: KimHammerSource[];
  citations: KimHammerCitationCard[];
  claimLinks: KimHammerCitationClaimLink[];
};

export const KIM_HAMMER_CITATION_REVIEW_STATUSES: KimHammerCitationReviewStatus[] = [
  "DRAFT",
  "NEEDS_REVIEW",
  "VERIFIED",
  "STALE",
  "ARCHIVED",
];

export const KIM_HAMMER_SOURCE_HEALTH_STATUSES: KimHammerSourceHealthStatus[] = [
  "HEALTHY",
  "NEEDS_REVALIDATION",
  "STALE",
  "ARCHIVE_MISSING",
  "BROKEN",
];
