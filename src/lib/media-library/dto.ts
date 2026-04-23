import type {
  OwnedMediaColorLabel,
  OwnedMediaDerivativeType,
  OwnedMediaKind,
  OwnedMediaPickStatus,
  OwnedMediaSourceType,
  SocialContentMediaRefPurpose,
} from "@prisma/client";

/** Row for admin Media Library (no raw filesystem paths; preview via API routes). */
export type MediaLibraryListItem = {
  id: string;
  title: string;
  fileName: string;
  kind: OwnedMediaKind;
  sourceType: OwnedMediaSourceType;
  mimeType: string;
  capturedAt: string | null;
  eventDate: string | null;
  /** Safe preview URL (admin session cookie or public rules apply in route). */
  previewUrl: string;
  hasTranscript: boolean;
  /** Short excerpt; full text via transcripts API / admin — TODO: semantic search. */
  transcriptExcerpt: string | null;
  approvedForSocial: boolean;
  countyId: string | null;
  countyLabel: string | null;
  linkedCampaignEventId: string | null;
  linkedCampaignEventTitle: string | null;
  indexSourceLabel: string | null;
  originalFileName: string | null;
  /** Deterministic display name; may match `fileName` after ingest. */
  canonicalFileName: string | null;
  /** `MediaIngestBatch.id` (API alias: importBatchId). */
  mediaIngestBatchId: string | null;
  parentAssetId: string | null;
  rootAssetId: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  rating: number | null;
  pickStatus: OwnedMediaPickStatus;
  colorLabel: OwnedMediaColorLabel;
  isFavorite: boolean;
  approvedForPress: boolean;
  approvedForPublicSite: boolean;
  derivativeType: OwnedMediaDerivativeType;
  createdAt: string;
};

export type MediaLibraryListResult = {
  items: MediaLibraryListItem[];
  total: number;
};

export type MediaRefListItem = {
  refId: string;
  purpose: SocialContentMediaRefPurpose;
  note: string | null;
  sortOrder: number;
  /** Full library row for workbench / studio (preview URL is path-safe). */
  media: MediaLibraryListItem;
  socialPlatformVariantId: string | null;
  /** When `purpose` is PLATFORM_VARIANT or a variant is linked. */
  variantPlatformLabel: string | null;
};
