import { ContentHubKind, OwnedMediaReviewStatus, Prisma } from "@prisma/client";
import { roadPostPublicWhere } from "@/lib/content/content-hub-visibility";
import { prisma } from "@/lib/db";
import type { RoadPostCard } from "@/lib/content/content-hub-queries";
import type { CountyVoterMetricsWithSnapshot } from "@/lib/voter-file/queries";
import { getLatestCountyVoterMetrics } from "@/lib/voter-file/queries";
import { listUpcomingPublicCampaignEventsForCountySlug } from "@/lib/calendar/public-events";
import type { PublicCampaignEvent } from "@/lib/calendar/public-event-types";

const countyWithRelations = Prisma.validator<Prisma.CountyDefaultArgs>()({
  include: {
    campaignStats: true,
    demographics: true,
    elected: {
      where: { reviewStatus: "APPROVED" },
      orderBy: [{ jurisdiction: "asc" }, { sortOrder: "asc" }],
    },
  },
});

export type CountyCommandRecord = Prisma.CountyGetPayload<typeof countyWithRelations>;

export async function listPublishedCounties() {
  return prisma.county.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    include: {
      campaignStats: true,
    },
  });
}

export async function getCountyCommandBySlug(slug: string): Promise<CountyCommandRecord | null> {
  return prisma.county.findFirst({
    where: { slug, published: true },
    include: countyWithRelations.include,
  });
}

export type CountyPageSnapshot = {
  county: CountyCommandRecord;
  /** Precomputed SOS file rollups when the voter pipeline has completed a snapshot */
  latestVoterMetrics: CountyVoterMetricsWithSnapshot | null;
  latestVisitPost: RoadPostCard | null;
  latestStoryPost: RoadPostCard | null;
  mediaGallery: Awaited<ReturnType<typeof loadCountyOwnedMediaPreview>>;
  /** Public CampaignOS events for this county (PUBLISHED + isPublicOnWebsite + not canceled) */
  upcomingPublicCampaignEvents: PublicCampaignEvent[];
  nextPublicCampaignEvent: PublicCampaignEvent | null;
};

function roadWhereForCounty(slug: string): Prisma.SyncedPostWhereInput {
  return {
    AND: [roadPostPublicWhere, { countySlug: slug }],
  };
}

/** “Campaign stop” vs “story” — prefer `ROAD_UPDATE` and `STORY` kinds when set; else fall back. */
async function loadStoryAndVisitPosts(countySlug: string) {
  const all = await prisma.syncedPost.findMany({
    where: roadWhereForCounty(countySlug),
    orderBy: { publishedAt: "desc" },
    take: 8,
    include: { heroMedia: true },
  });
  if (all.length === 0) {
    return { visit: null as RoadPostCard | null, story: null as RoadPostCard | null };
  }
  const asVisit = all.find((p) => p.contentKind === ContentHubKind.ROAD_UPDATE) as RoadPostCard | null;
  const asStoryKind = all.find((p) => p.contentKind === ContentHubKind.STORY) as RoadPostCard | null;
  const visit = asVisit;
  const story =
    asStoryKind ||
    (asVisit ? (all.find((p) => p.id !== asVisit.id) as RoadPostCard | null) : (all[0] as RoadPostCard));
  return {
    visit,
    story: story && visit && story.id === visit.id ? null : story,
  };
}

async function loadCountyOwnedMediaPreview(countySlug: string) {
  return prisma.ownedMediaAsset.findMany({
    where: {
      countySlug,
      isPublic: true,
      reviewStatus: OwnedMediaReviewStatus.APPROVED,
    },
    orderBy: [{ eventDate: "desc" }, { updatedAt: "desc" }],
    take: 8,
    select: {
      id: true,
      publicUrl: true,
      kind: true,
      title: true,
      eventDate: true,
      reviewStatus: true,
    },
  });
}

/**
 * Composes public county page: DB county row + events content + (optional) road + owned media.
 */
export async function getCountyPageSnapshot(slug: string): Promise<CountyPageSnapshot | null> {
  const county = await getCountyCommandBySlug(slug);
  if (!county) return null;

  const [{ visit, story }, mediaGallery, latestVoterMetrics] = await Promise.all([
    loadStoryAndVisitPosts(slug),
    loadCountyOwnedMediaPreview(slug),
    getLatestCountyVoterMetrics(county.id),
  ]);

  const publicEv = await listUpcomingPublicCampaignEventsForCountySlug(slug, 20);
  const nextPublicCampaignEvent = publicEv[0] ?? null;

  return {
    county,
    latestVoterMetrics,
    latestVisitPost: visit,
    latestStoryPost: story,
    mediaGallery,
    upcomingPublicCampaignEvents: publicEv,
    nextPublicCampaignEvent,
  };
}
