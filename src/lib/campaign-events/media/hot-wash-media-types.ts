/**
 * Hot Wash media intake — metadata model (JSON index; no Prisma this pass).
 */

export type HotWashMediaType = "image" | "video" | "audio" | "speech" | "document" | "other";

export type HotWashUploadSource =
  | "admin"
  | "public_link"
  | "host"
  | "volunteer"
  | "candidate"
  | "campaign_manager";

export type HotWashApprovalStatus = "pending" | "approved" | "rejected" | "needs_review";

export type HotWashPipelineStatus = "not_started" | "queued" | "complete" | "failed";

export type HotWashCountyArchiveStatus = "pending" | "published" | "rejected";

export type HotWashMediaRecord = {
  id: string;
  eventRecordId: string;
  eventTitle: string;
  eventDate: string;
  county: string;
  countySlug: string;
  city: string;
  uploaderName: string;
  uploaderEmail: string;
  uploaderPhone?: string;
  uploadSource: HotWashUploadSource;
  originalFilename: string;
  storedPath: string;
  mimeType: string;
  mediaType: HotWashMediaType;
  approvalStatus: HotWashApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  caption?: string;
  createdAt: string;
  updatedAt: string;
  transcriptionStatus: HotWashPipelineStatus;
  chunkingStatus: HotWashPipelineStatus;
  countyArchiveStatus: HotWashCountyArchiveStatus;
  /** Relative path under data/campaign-events/media/ when approved (planned or actual). */
  approvedArchivePath?: string;
  /** Future: detected faces / people tags — not populated this pass. */
  detectedPeople?: string[];
  /** Future: AI-enriched event metadata attached to file — not populated this pass. */
  aiEventMetadata?: Record<string, string>;
  /** Sprint 7 — metadata scaffolds (no real transcription/OCR yet). */
  intelligence?: HotWashMediaIntelligenceMeta;
};

export type HotWashMediaIntelligenceMeta = {
  facesCountPlaceholder?: number;
  signsBannersDetected?: string;
  crowdEstimatePlaceholder?: string;
  ocrPlaceholder?: string;
  durationSeconds?: number;
  transcriptPlaceholder?: string;
  clipMarkers?: string[];
  speechDetectionPlaceholder?: string;
  keyMomentsPlaceholder?: string[];
  quoteExtractionPlaceholder?: string[];
  issueTags?: string[];
  countyTag?: string;
  speakerTags?: string[];
};

export type HotWashMediaIndex = {
  version: 1;
  items: HotWashMediaRecord[];
};

export type EventMediaContext = {
  eventRecordId: string;
  eventTitle: string;
  eventDate: string;
  eventSlug: string;
  county: string;
  countySlug: string;
  city: string;
};

export type MediaPanelKind =
  | "photos"
  | "videos"
  | "speeches"
  | "documents"
  | "uploader_submissions"
  | "pending_approval"
  | "approved_archive";
