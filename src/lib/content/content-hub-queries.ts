import {
  ContentHubKind,
  ContentPlatform,
  InboundReviewStatus,
  Prisma,
  type InboundContentItem,
  type MediaAsset,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { youtubeVideoIdFromExternalId } from "@/lib/media/youtube-id";
import {
  inboundSocialFromRoadWhere,
  inboundYoutubePublicWhere,
  roadPostPublicWhere,
} from "@/lib/content/content-hub-visibility";
import { platformLabel, sourceTypeLabel } from "@/lib/orchestrator/public-feed";

const roadPostInclude = { heroMedia: true } as const;
export type RoadPostCard = Prisma.SyncedPostGetPayload<{ include: typeof roadPostInclude }>;

const VIDEO_KINDS: ContentHubKind[] = [
  ContentHubKind.VIDEO,
  ContentHubKind.SPEECH,
  ContentHubKind.EXPLAINER,
  ContentHubKind.INTERVIEW,
];

export type YoutubeCardVM = {
  inboundId: string;
  videoId: string;
  title: string;
  posterUrl: string | null;
  canonicalUrl: string | null;
  publishedAt: Date | null;
  contentSeries: string | null;
  countySlug: string | null;
  city: string | null;
};

function toYoutubeCard(row: InboundContentItem & { mediaAsset: MediaAsset | null }): YoutubeCardVM | null {
  const videoId = youtubeVideoIdFromExternalId(row.externalId);
  if (!videoId) return null;
  const posterUrl = row.mediaAsset?.url?.trim() || null;
  return {
    inboundId: row.id,
    videoId,
    title: row.title?.trim() || "Video",
    posterUrl,
    canonicalUrl: row.canonicalUrl?.trim() || null,
    publishedAt: row.publishedAt,
    contentSeries: row.contentSeries ?? null,
    countySlug: row.countySlug?.trim() || null,
    city: row.city?.trim() || null,
  };
}

/** @see content-hub-visibility.ts — featured video for hubs (homepage, campaign trail, understand, etc.). */
export async function getFeaturedYoutubeForHub(
  featuredHomepageVideoInboundId: string | null,
): Promise<YoutubeCardVM | null> {
  try {
    if (featuredHomepageVideoInboundId) {
      const row = await prisma.inboundContentItem.findFirst({
        where: {
          id: featuredHomepageVideoInboundId,
          ...inboundYoutubePublicWhere,
        },
        include: { mediaAsset: true },
      });
      const vm = row ? toYoutubeCard(row) : null;
      if (vm) return vm;
    }

    const featured = await prisma.inboundContentItem.findFirst({
      where: {
        ...inboundYoutubePublicWhere,
        reviewStatus: InboundReviewStatus.FEATURED,
      },
      include: { mediaAsset: true },
      orderBy: [{ featuredWeight: "desc" }, { publishedAt: "desc" }],
    });
    if (featured) {
      const vm = toYoutubeCard(featured);
      if (vm) return vm;
    }

    const fallback = await prisma.inboundContentItem.findFirst({
      where: {
        ...inboundYoutubePublicWhere,
        OR: [{ contentKind: { in: VIDEO_KINDS } }, { contentKind: null }],
      },
      include: { mediaAsset: true },
      orderBy: [{ featuredWeight: "desc" }, { publishedAt: "desc" }],
    });
    return fallback ? toYoutubeCard(fallback) : null;
  } catch {
    /** DB unavailable (e.g. local dev without Postgres) — page still renders without featured video. */
    return null;
  }
}

/**
 * Public YouTube for a specific inbound row (e.g. Forevermost / Heifer on /about). No featured fallback.
 */
export async function getPublicYoutubeByInboundId(
  inboundId: string | null | undefined,
): Promise<YoutubeCardVM | null> {
  try {
    const id = inboundId?.trim();
    if (!id) return null;
    const row = await prisma.inboundContentItem.findFirst({
      where: { id, ...inboundYoutubePublicWhere },
      include: { mediaAsset: true },
    });
    return row ? toYoutubeCard(row) : null;
  } catch {
    return null;
  }
}

export async function listRoadPreviewPosts(limit = 6): Promise<RoadPostCard[]> {
  try {
    return await prisma.syncedPost.findMany({
      where: roadPostPublicWhere,
      orderBy: [{ featuredRoadPreview: "desc" }, { publishedAt: "desc" }],
      take: limit,
      include: roadPostInclude,
    });
  } catch {
    return [];
  }
}

export async function listFromTheRoadPosts(limit = 48): Promise<RoadPostCard[]> {
  try {
    return await prisma.syncedPost.findMany({
      where: roadPostPublicWhere,
      orderBy: { publishedAt: "desc" },
      take: limit,
      include: roadPostInclude,
    });
  } catch {
    return [];
  }
}

export type RoadSocialCardVM = {
  id: string;
  platform: ContentPlatform;
  platformLabel: string;
  sourceTypeLabel: string;
  title: string;
  excerpt: string;
  href: string;
  imageSrc: string | null;
  imageAlt: string;
  publishedAt: Date | null;
  countySlug: string | null;
  city: string | null;
};

function toRoadSocialCard(row: InboundContentItem & { mediaAsset: MediaAsset | null }): RoadSocialCardVM {
  const body = row.body?.trim() ?? "";
  const fromBody =
    body.length > 0 ? (body.length > 220 ? `${body.slice(0, 220)}…` : body) : "";
  return {
    id: row.id,
    platform: row.sourcePlatform,
    platformLabel: platformLabel(row.sourcePlatform),
    sourceTypeLabel: sourceTypeLabel(String(row.sourceType)),
    title: row.title?.trim() || "Field update",
    excerpt: row.excerpt?.trim() || fromBody,
    href: row.canonicalUrl?.trim() || "#",
    imageSrc: row.mediaAsset?.url?.trim() || null,
    imageAlt: row.title?.trim() || "Campaign post",
    publishedAt: row.publishedAt,
    countySlug: row.countySlug?.trim() || null,
    city: row.city?.trim() || null,
  };
}

/**
 * Public Facebook + Instagram field posts (after sync + Inbox review). Requires connector env in production.
 */
export async function listFromTheRoadSocialItems(limit = 32): Promise<RoadSocialCardVM[]> {
  try {
    const rows = await prisma.inboundContentItem.findMany({
      where: inboundSocialFromRoadWhere,
      include: { mediaAsset: true },
      orderBy: [{ publishedAt: "desc" }, { syncTimestamp: "desc" }],
      take: limit,
    });
    return rows.map(toRoadSocialCard);
  } catch {
    return [];
  }
}

/** YouTube items approved for public video hubs; latest moments for the /from-the-road “on camera” row. */
export async function listFromTheRoadYoutubeMoments(limit = 8): Promise<YoutubeCardVM[]> {
  try {
    const rows = await prisma.inboundContentItem.findMany({
      where: inboundYoutubePublicWhere,
      include: { mediaAsset: true },
      orderBy: [{ publishedAt: "desc" }, { syncTimestamp: "desc" }],
      take: limit,
    });
    return rows.map(toYoutubeCard).filter((v): v is YoutubeCardVM => Boolean(v));
  } catch {
    return [];
  }
}

export function roadPostExcerpt(post: RoadPostCard): string {
  const t = post.teaserOverride?.trim();
  if (t) return t;
  return post.summary?.trim() || "";
}

export function roadPostImageSrc(post: RoadPostCard): string | null {
  const fromHero = post.heroMedia?.url?.trim();
  if (fromHero) return fromHero;
  return post.featuredImageUrl?.trim() || null;
}
