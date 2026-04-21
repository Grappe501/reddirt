import type { OwnedMediaKind, OwnedMediaSourceType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

const transcriptInclude = { transcripts: true, quoteCandidates: true } as const;

export function ownedMediaListArgs(filter: {
  countySlug?: string | null;
  city?: string | null;
  kind?: OwnedMediaKind | null;
  sourceType?: OwnedMediaSourceType | null;
  issueTag?: string | null;
  from?: Date;
  to?: Date;
  /** If true, `from` / `to` apply to `capturedAt` (EXIF) instead of `eventDate`. */
  useCapturedAt?: boolean;
  withTranscript?: boolean;
  approvedQuotesOnly?: boolean;
}): Prisma.OwnedMediaAssetFindManyArgs {
  const where: Prisma.OwnedMediaAssetWhereInput = {};

  if (filter.countySlug) where.countySlug = filter.countySlug;
  if (filter.city) where.city = filter.city;
  if (filter.kind) where.kind = filter.kind;
  if (filter.sourceType) where.sourceType = filter.sourceType;
  if (filter.issueTag) {
    where.issueTags = { has: filter.issueTag };
  }
  const useCap = filter.useCapturedAt === true;
  if (filter.from || filter.to) {
    const range = { gte: filter.from, lte: filter.to };
    if (useCap) {
      where.capturedAt = range;
    } else {
      where.eventDate = range;
    }
  }
  if (filter.withTranscript) {
    where.transcripts = { some: { reviewStatus: "APPROVED" } };
  }
  if (filter.approvedQuotesOnly) {
    where.quoteCandidates = { some: { reviewStatus: "APPROVED" } };
  }

  return {
    where,
    orderBy: useCap
      ? [{ capturedAt: "desc" }, { updatedAt: "desc" }]
      : [{ eventDate: "desc" }, { updatedAt: "desc" }],
    include: transcriptInclude,
  };
}

export async function listOwnedMediaByCounty(countySlug: string) {
  return prisma.ownedMediaAsset.findMany({
    where: { countySlug },
    orderBy: { eventDate: "desc" },
    include: transcriptInclude,
  });
}

export async function listOwnedMediaByIssueTag(issueTag: string) {
  return prisma.ownedMediaAsset.findMany({
    where: { issueTags: { has: issueTag } },
    orderBy: { eventDate: "desc" },
    include: transcriptInclude,
  });
}

/** Speech (or similar) by issue for communications pulls — optional role filter. */
export async function listOwnedSpeechClipsByIssue(issueTag: string) {
  return prisma.ownedMediaAsset.findMany({
    where: { issueTags: { has: issueTag }, role: { in: ["SPEECH", "INTERVIEW", "ROAD_CLIP"] } },
    orderBy: { eventDate: "desc" },
    include: transcriptInclude,
  });
}

export async function listOwnedMediaInDateRange(from: Date, to: Date) {
  return prisma.ownedMediaAsset.findMany({
    where: { eventDate: { gte: from, lte: to } },
    orderBy: { eventDate: "desc" },
    include: transcriptInclude,
  });
}

export async function listOwnedMediaInCapturedAtRange(from: Date, to: Date) {
  return prisma.ownedMediaAsset.findMany({
    where: { capturedAt: { gte: from, lte: to } },
    orderBy: { capturedAt: "desc" },
    include: transcriptInclude,
  });
}

export async function listOwnedMediaByCity(city: string) {
  return prisma.ownedMediaAsset.findMany({
    where: { city },
    orderBy: { capturedAt: "desc" },
    include: transcriptInclude,
  });
}

export async function listOwnedMediaByKindAndSource(params: { kind: OwnedMediaKind; sourceType: OwnedMediaSourceType }) {
  return prisma.ownedMediaAsset.findMany({
    where: { kind: params.kind, sourceType: params.sourceType },
    orderBy: { updatedAt: "desc" },
    include: transcriptInclude,
  });
}

export async function listOwnedMediaWithApprovedTranscripts() {
  return prisma.ownedMediaAsset.findMany({
    where: { transcripts: { some: { reviewStatus: "APPROVED" } } },
    orderBy: { updatedAt: "desc" },
    include: transcriptInclude,
  });
}

export async function listOwnedMediaWithApprovedQuotes() {
  return prisma.ownedMediaAsset.findMany({
    where: { quoteCandidates: { some: { reviewStatus: "APPROVED" } } },
    orderBy: { updatedAt: "desc" },
    include: transcriptInclude,
  });
}

export async function getOwnedMediaById(id: string) {
  return prisma.ownedMediaAsset.findUnique({
    where: { id },
    include: { transcripts: { orderBy: { createdAt: "desc" } }, quoteCandidates: { orderBy: { createdAt: "desc" } } },
  });
}

/** Rows with both lat and lng (map / gallery prep). */
export async function listOwnedMediaWithGps() {
  return prisma.ownedMediaAsset.findMany({
    where: { gpsLat: { not: null }, gpsLng: { not: null } },
    orderBy: { updatedAt: "desc" },
    include: transcriptInclude,
  });
}

/** Editorial queue: inferred or EXIF geo not yet confirmed for public county use. */
export async function listOwnedMediaNeedingGeoReview() {
  return prisma.ownedMediaAsset.findMany({
    where: { needsGeoReview: true },
    orderBy: { updatedAt: "desc" },
    include: transcriptInclude,
  });
}

/** Speech / video / audio-style assets in a county (for local storytelling). */
export async function listOwnedSpeechOrVideoByCounty(countySlug: string) {
  return prisma.ownedMediaAsset.findMany({
    where: {
      countySlug,
      OR: [{ kind: { in: ["VIDEO", "AUDIO"] } }, { role: { in: ["SPEECH", "INTERVIEW", "ROAD_CLIP"] } }],
    },
    orderBy: [{ capturedAt: "desc" }, { eventDate: "desc" }],
    include: transcriptInclude,
  });
}

/** Date filter: use `capturedAt` if set in range, else fall back to `eventDate` — for “fuzzy” windows use two queries or raw SQL later. */
export async function listOwnedMediaByCapturedOrEventDateRange(from: Date, to: Date) {
  return prisma.ownedMediaAsset.findMany({
    where: {
      OR: [
        { capturedAt: { gte: from, lte: to } },
        { AND: [{ capturedAt: null }, { eventDate: { gte: from, lte: to } }] },
      ],
    },
    orderBy: [{ capturedAt: "desc" }, { eventDate: "desc" }],
    include: transcriptInclude,
  });
}
