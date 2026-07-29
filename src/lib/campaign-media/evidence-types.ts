/**
 * Local Evidence Workbench — confirmation overlays (calendar / photos / speeches).
 * Operator edits live in data/campaign-media/*.json — not invented geography.
 */

export type CalendarPresenceStatus = "Needs confirm" | "Confirmed" | "Exclude" | "Unknown";

export type CalendarPresenceRow = {
  id: string;
  date: string;
  summary: string;
  location: string;
  city: string;
  county: string;
  status: CalendarPresenceStatus;
  hasPhysicalLocation: boolean;
};

export type CalendarPresenceStore = {
  version: 1;
  updatedAt: string;
  sourceNote: string;
  rows: CalendarPresenceRow[];
};

export type PhotoEvidenceTier = "Gold" | "Silver" | "Archive" | "";

export type PhotoEvidenceOverlay = {
  county?: string;
  city?: string;
  venue?: string;
  eventDate?: string;
  eventName?: string;
  photographer?: string;
  peopleVisible?: string[];
  whatThisProves?: string;
  approvedForPublic?: boolean;
  homepageCandidate?: boolean;
  featuredPhoto?: boolean;
  heroLevel?: "HERO" | "FEATURE" | "SUPPORTING" | "UNREVIEWED";
  tierIntent?: PhotoEvidenceTier;
  publicationStatus?: "DRAFT" | "IN_REVIEW" | "APPROVED" | "PUBLISHED" | "ARCHIVED";
  /**
   * Pass 4 — public delivery src override (must be under /media/campaign-derivatives/{photoId}/).
   * Registry original under campaign-photos is never deleted.
   */
  publicSrcOverride?: string;
  promotedDerivativeId?: string;
  promotedAt?: string;
  /** Pass 5 — normalized focus point for attention crops (0–1). */
  focusX?: number;
  focusY?: number;
  /** Last operator-reviewed crop advice note (from AI or manual). */
  cropAdviceNote?: string;
  updatedAt?: string;
};

export type PhotoEvidenceStore = {
  version: 1;
  updatedAt: string;
  purpose: string;
  photos: Record<string, PhotoEvidenceOverlay>;
};

export type SpeechEvidenceOverlay = {
  counties?: string[];
  city?: string;
  venue?: string;
  eventDate?: string;
  eventName?: string;
  whatThisProves?: string;
  approvedForPublic?: boolean;
  homepageCandidate?: boolean;
  publicationStatus?: "DRAFT" | "IN_REVIEW" | "APPROVED" | "PUBLISHED" | "ARCHIVED";
  /** Pass 8 — operator-applied transcript notes / quotes / guardrails. */
  speakerNotes?: string;
  keyQuotes?: string[];
  doNotClaim?: string[];
  transcriptChapters?: Array<{ title: string; startSeconds: number }>;
  transcriptIntelAt?: string;
  transcriptIntelPlanId?: string;
  updatedAt?: string;
};

export type SpeechEvidenceStore = {
  version: 1;
  updatedAt: string;
  purpose: string;
  speeches: Record<string, SpeechEvidenceOverlay>;
};

export const CALENDAR_PRESENCE_REL = "data/campaign-media/calendar-presence.json";
export const PHOTO_EVIDENCE_REL = "data/campaign-media/photo-evidence.json";
export const SPEECH_EVIDENCE_REL = "data/campaign-media/speech-evidence.json";
export const PHOTO_INGEST_DRAFTS_REL = "data/campaign-media/photo-ingest-drafts.json";

export type PhotoIngestDraftStore = {
  version: 1;
  updatedAt: string;
  purpose: string;
  photos: import("@/content/media/campaign-photo-types").CampaignPhotoRecord[];
};

export const CALENDAR_STATUSES: CalendarPresenceStatus[] = [
  "Needs confirm",
  "Confirmed",
  "Exclude",
  "Unknown",
];
