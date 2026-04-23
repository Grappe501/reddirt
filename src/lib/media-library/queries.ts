import type { Prisma } from "@prisma/client";
import { OwnedMediaKind, OwnedMediaSourceType } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { MediaLibraryListFilters } from "./types";
import { ownedMediaPreviewUrl } from "./public-urls";
import type { MediaLibraryListItem, MediaLibraryListResult, MediaRefListItem } from "./dto";

export type { MediaLibraryListFilters } from "./types";

const listInclude = {
  county: { select: { id: true, displayName: true, slug: true } },
  linkedCampaignEvent: { select: { id: true, title: true } },
  transcripts: { select: { id: true, transcriptText: true }, take: 1, orderBy: { updatedAt: "desc" as const } },
} as const;

function mapRow(
  a: Prisma.OwnedMediaAssetGetPayload<{ include: typeof listInclude }>
): MediaLibraryListItem {
  const t = a.transcripts[0];
  const excerpt = t?.transcriptText ? t.transcriptText.replace(/\s+/g, " ").trim().slice(0, 220) : null;
  return {
    id: a.id,
    title: a.title,
    fileName: a.fileName,
    kind: a.kind,
    sourceType: a.sourceType,
    mimeType: a.mimeType,
    capturedAt: a.capturedAt ? a.capturedAt.toISOString() : null,
    eventDate: a.eventDate ? a.eventDate.toISOString() : null,
    previewUrl: ownedMediaPreviewUrl(a.id),
    hasTranscript: a.transcripts.length > 0,
    transcriptExcerpt: excerpt,
    approvedForSocial: a.approvedForSocial,
    countyId: a.countyId,
    countyLabel: a.county?.displayName ?? null,
    linkedCampaignEventId: a.linkedCampaignEventId,
    linkedCampaignEventTitle: a.linkedCampaignEvent?.title ?? null,
    indexSourceLabel: a.indexSourceLabel,
    originalFileName: a.originalFileName ?? null,
    canonicalFileName: a.canonicalFileName ?? null,
    mediaIngestBatchId: a.mediaIngestBatchId ?? null,
    parentAssetId: a.parentAssetId ?? null,
    rootAssetId: a.rootAssetId ?? null,
    reviewedAt: a.reviewedAt ? a.reviewedAt.toISOString() : null,
    reviewNotes: a.reviewNotes ?? null,
    rating: a.rating ?? null,
    pickStatus: a.pickStatus,
    colorLabel: a.colorLabel,
    isFavorite: a.isFavorite,
    approvedForPress: a.approvedForPress,
    approvedForPublicSite: a.approvedForPublicSite,
    derivativeType: a.derivativeType,
    createdAt: a.createdAt.toISOString(),
  };
}

function buildWhere(f: MediaLibraryListFilters): Prisma.OwnedMediaAssetWhereInput {
  const w: Prisma.OwnedMediaAssetWhereInput = {};
  if (f.issueTag) w.issueTags = { has: f.issueTag };
  if (f.q && f.q.trim()) {
    const q = f.q.trim();
    w.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { fileName: { contains: q, mode: "insensitive" } },
      { originalFileName: { contains: q, mode: "insensitive" } },
      { canonicalFileName: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }
  if (f.countyId) w.countyId = f.countyId;
  if (f.campaignEventId) w.linkedCampaignEventId = f.campaignEventId;
  if (f.kind) w.kind = f.kind;
  if (f.approvedForSocial != null) w.approvedForSocial = f.approvedForSocial;
  if (f.sourceTypes && f.sourceTypes.length) w.sourceType = { in: f.sourceTypes as OwnedMediaSourceType[] };
  if (f.dateFrom || f.dateTo) {
    const range: { gte?: Date; lte?: Date } = {};
    if (f.dateFrom) range.gte = new Date(f.dateFrom);
    if (f.dateTo) range.lte = new Date(f.dateTo);
    if (f.dateField === "created") w.createdAt = range;
    else w.capturedAt = range;
  }
  if (f.hasTranscript != null) {
    if (f.hasTranscript) {
      w.transcripts = { some: {} };
    } else {
      w.transcripts = { none: {} };
    }
  }
  if (f.pickStatus) w.pickStatus = f.pickStatus;
  if (f.colorLabel) w.colorLabel = f.colorLabel;
  if (f.ratingMin != null || f.ratingMax != null) {
    w.rating = {};
    if (f.ratingMin != null) w.rating.gte = f.ratingMin;
    if (f.ratingMax != null) w.rating.lte = f.ratingMax;
  }
  if (f.isFavorite != null) w.isFavorite = f.isFavorite;
  if (f.approvedForPress != null) w.approvedForPress = f.approvedForPress;
  if (f.approvedForPublicSite != null) w.approvedForPublicSite = f.approvedForPublicSite;
  if (f.mediaIngestBatchId) w.mediaIngestBatchId = f.mediaIngestBatchId;
  if (f.collectionId) w.collectionItems = { some: { collectionId: f.collectionId } };
  if (f.isReviewed === true) w.reviewedAt = { not: null };
  if (f.isReviewed === false) w.reviewedAt = null;
  if (f.isUnreviewed) {
    w.pickStatus = "UNRATED";
    if (f.approvedForSocial == null) w.approvedForSocial = false;
  }
  return w;
}

function orderByFor(
  sort: MediaLibraryListFilters["sort"]
): Prisma.OwnedMediaAssetOrderByWithRelationInput | Prisma.OwnedMediaAssetOrderByWithRelationInput[] {
  switch (sort) {
    case "CAPTURED":
      return { capturedAt: "desc" };
    case "CREATED":
      return { createdAt: "desc" };
    case "RATING":
      return [{ rating: "desc" }, { updatedAt: "desc" }];
    case "TITLE":
      return { title: "asc" };
    case "UPDATED":
    default:
      return { updatedAt: "desc" };
  }
}

export async function queryMediaLibrary(filters: MediaLibraryListFilters): Promise<MediaLibraryListResult> {
  const take = Math.min(filters.take ?? 40, 500);
  const skip = Math.max(filters.skip ?? 0, 0);
  const where = buildWhere(filters);
  const orderBy = orderByFor(filters.sort);
  try {
    const [rows, total] = await Promise.all([
      prisma.ownedMediaAsset.findMany({
        where,
        orderBy,
        take,
        skip,
        include: listInclude,
      }),
      prisma.ownedMediaAsset.count({ where }),
    ]);
    return { items: rows.map(mapRow), total };
  } catch {
    return { items: [], total: 0 };
  }
}

export async function getMediaLibraryRowById(id: string): Promise<MediaLibraryListItem | null> {
  if (!id) return null;
  try {
    const a = await prisma.ownedMediaAsset.findUnique({ where: { id }, include: listInclude });
    if (!a) return null;
    return mapRow(a);
  } catch {
    return null;
  }
}

const refInclude = {
  ownedMedia: {
    include: listInclude,
  },
  socialPlatformVariant: {
    select: { id: true, platform: true },
  },
} as const;

export async function getMediaRefsForSocialContentItem(
  socialContentItemId: string
): Promise<MediaRefListItem[]> {
  if (!socialContentItemId) return [];
  try {
    const rows = await prisma.socialContentMediaRef.findMany({
      where: { socialContentItemId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: refInclude,
    });
    return rows.map((r) => {
      const m = mapRow(r.ownedMedia);
      return {
        refId: r.id,
        purpose: r.purpose,
        note: r.note,
        sortOrder: r.sortOrder,
        socialPlatformVariantId: r.socialPlatformVariantId,
        variantPlatformLabel: r.socialPlatformVariant
          ? String(r.socialPlatformVariant.platform).replace(/_/g, " ")
          : null,
        media: m,
      };
    });
  } catch {
    return [];
  }
}
