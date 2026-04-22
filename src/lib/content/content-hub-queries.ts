import {
  ContentHubKind,
  InboundReviewStatus,
  Prisma,
  type InboundContentItem,
  type MediaAsset,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { youtubeVideoIdFromExternalId } from "@/lib/media/youtube-id";
import { WATCH_RAIL_DEFS, type WatchRailDef } from "@/lib/content/watch-rails";
import { inboundYoutubePublicWhere, roadPostPublicWhere } from "@/lib/content/content-hub-visibility";

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

/** @see content-hub-visibility.ts — homepage + /watch hero selection rules. */
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

export async function listRoadPreviewPosts(limit = 6): Promise<RoadPostCard[]> {
  return prisma.syncedPost.findMany({
    where: roadPostPublicWhere,
    orderBy: [{ featuredRoadPreview: "desc" }, { publishedAt: "desc" }],
    take: limit,
    include: roadPostInclude,
  });
}

export async function listFromTheRoadPosts(limit = 48): Promise<RoadPostCard[]> {
  return prisma.syncedPost.findMany({
    where: roadPostPublicWhere,
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: roadPostInclude,
  });
}

function railWhere(def: WatchRailDef): Prisma.InboundContentItemWhereInput {
  const parts: Prisma.InboundContentItemWhereInput[] = [];
  if (def.contentSeries) {
    parts.push({ contentSeries: def.contentSeries });
  }
  if (def.issueTags?.length) {
    parts.push({ issueTags: { hasSome: def.issueTags } });
  }
  return {
    ...inboundYoutubePublicWhere,
    OR: parts.length ? parts : [{ id: "__none__" }],
  };
}

export async function listWatchRailVideos(def: WatchRailDef, limit = 12): Promise<YoutubeCardVM[]> {
  const rows = await prisma.inboundContentItem.findMany({
    where: railWhere(def),
    include: { mediaAsset: true },
    orderBy: [{ featuredWeight: "desc" }, { publishedAt: "desc" }],
    take: limit,
  });
  return rows.map(toYoutubeCard).filter((v): v is YoutubeCardVM => Boolean(v));
}

export async function loadAllWatchRails(): Promise<{ def: WatchRailDef; videos: YoutubeCardVM[] }[]> {
  const out: { def: WatchRailDef; videos: YoutubeCardVM[] }[] = [];
  for (const def of WATCH_RAIL_DEFS) {
    const videos = await listWatchRailVideos(def, 12);
    out.push({ def, videos });
  }
  return out;
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
