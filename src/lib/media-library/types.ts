import type {
  OwnedMediaColorLabel,
  OwnedMediaKind,
  OwnedMediaPickStatus,
  OwnedMediaSourceType,
} from "@prisma/client";

export type MediaLibraryListFilters = {
  q?: string;
  /** Exact issue tag (array `has`) */
  issueTag?: string;
  countyId?: string;
  /** `CampaignEvent.id` for linked media filter */
  campaignEventId?: string;
  kind?: OwnedMediaKind;
  dateFrom?: string;
  dateTo?: string;
  /** Filter by `createdAt` (ingest) instead of or in addition to `capturedAt` — set `dateField`. */
  dateField?: "captured" | "created";
  approvedForSocial?: boolean;
  approvedForPress?: boolean;
  approvedForPublicSite?: boolean;
  hasTranscript?: boolean;
  sourceTypes?: OwnedMediaSourceType[];
  pickStatus?: OwnedMediaPickStatus;
  colorLabel?: OwnedMediaColorLabel;
  ratingMin?: number;
  ratingMax?: number;
  isFavorite?: boolean;
  isUnreviewed?: boolean;
  /** `MediaIngestBatch.id` */
  mediaIngestBatchId?: string;
  /** `OwnedMediaCollection.id` */
  collectionId?: string;
  /** When true: `reviewedAt` is set. When false: not set. */
  isReviewed?: boolean;
  /** Result ordering; default `UPDATED` desc. */
  sort?: "UPDATED" | "CAPTURED" | "CREATED" | "RATING" | "TITLE";
  take?: number;
  skip?: number;
};
