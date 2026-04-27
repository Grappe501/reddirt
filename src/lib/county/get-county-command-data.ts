import { ContentHubKind, OwnedMediaReviewStatus, Prisma, type CountyCampaignStats } from "@prisma/client";
import { roadPostPublicWhere } from "@/lib/content/content-hub-visibility";
import { prisma } from "@/lib/db";
import type { RoadPostCard } from "@/lib/content/content-hub-queries";
import type { CountyVoterMetricsWithSnapshot } from "@/lib/voter-file/queries";
import { getLatestCountyVoterMetrics } from "@/lib/voter-file/queries";
import { listUpcomingPublicCampaignEventsForCountySlug } from "@/lib/calendar/public-events";
import type { PublicCampaignEvent } from "@/lib/calendar/public-event-types";
import {
  ARKANSAS_COUNTY_REGISTRY,
  getRegistryCountyBySlug,
  regionMetaForId,
  type ArkansasRegistryCounty,
} from "@/lib/county/arkansas-county-registry";

const countyWithRelations = Prisma.validator<Prisma.CountyDefaultArgs>()({
  include: {
    campaignStats: true,
    demographics: true,
  },
});

export type CountyCommandRecord = Prisma.CountyGetPayload<typeof countyWithRelations>;

/**
 * In-memory record when a county is in the Arkansas registry but not yet in the DB
 * (or before seed). Same shape as a Prisma row for the public command UI.
 */
function buildRegistryStubCountyCommandRecord(reg: ArkansasRegistryCounty): CountyCommandRecord {
  const rlab = regionMetaForId(reg.regionId)?.shortLabel ?? reg.regionId;
  return {
    id: `registry:${reg.slug}`,
    slug: reg.slug,
    fips: reg.fips,
    displayName: reg.displayName,
    regionLabel: rlab,
    sortOrder: reg.sortOrder,
    heroEyebrow: null,
    heroIntro: null,
    leadName: null,
    leadTitle: null,
    leadBio: null,
    leadPhotoUrl: null,
    featuredEventSlugs: [],
    showOnStatewideMap: true,
    published: true,
    createdAt: new Date(0),
    updatedAt: new Date(0),
    campaignStats: null,
    demographics: null,
  };
}

/**
 * Resolves a public command row: live DB (must be `published`) or stub from the 75-county master registry.
 */
export async function resolveCountyCommandBySlug(slug: string): Promise<CountyCommandRecord | null> {
  const inDb = await prisma.county.findFirst({
    where: { slug },
    include: countyWithRelations.include,
  });
  if (inDb) {
    if (!inDb.published) return null;
    return inDb;
  }
  const reg = getRegistryCountyBySlug(slug);
  if (!reg) return null;
  return buildRegistryStubCountyCommandRecord(reg);
}

export type CountyRosterListItem = {
  id: string;
  slug: string;
  fips: string;
  displayName: string;
  regionLabel: string | null;
  leadName: string | null;
  leadTitle: string | null;
  /** false when a draft DB row blocks the public page (rare) */
  hasPublicPage: boolean;
  campaignStats: CountyCampaignStats | null;
};

/**
 * Static 75-county roster for offline/DB-failure UIs (no Prisma). Same field shape as the merged list.
 */
export function listArkansasCountyCommandRosterFromRegistryOnly(): CountyRosterListItem[] {
  return ARKANSAS_COUNTY_REGISTRY.map((reg) => {
    const rlab = regionMetaForId(reg.regionId)?.shortLabel ?? null;
    return {
      id: `registry:${reg.slug}`,
      slug: reg.slug,
      fips: reg.fips,
      displayName: reg.displayName,
      regionLabel: rlab,
      leadName: null,
      leadTitle: null,
      hasPublicPage: true,
      campaignStats: null,
    } satisfies CountyRosterListItem;
  });
}

/**
 * All 75 counties for /counties, voter registration roster, and admin workbench.
 * Merges DB (when present) with the master registry. One row per Arkansas county, FIPS order.
 */
export async function listArkansasCountyCommandRoster(): Promise<CountyRosterListItem[]> {
  const inDb = await prisma.county.findMany({
    include: { campaignStats: true },
  });
  const bySlug = new Map(inDb.map((c) => [c.slug, c]));
  return ARKANSAS_COUNTY_REGISTRY.map((reg) => {
    const row = bySlug.get(reg.slug);
    const rlab = row?.regionLabel?.trim() || regionMetaForId(reg.regionId)?.shortLabel || null;
    if (row) {
      return {
        id: row.id,
        slug: row.slug,
        fips: row.fips,
        displayName: row.displayName,
        regionLabel: rlab,
        leadName: row.leadName,
        leadTitle: row.leadTitle,
        hasPublicPage: row.published,
        campaignStats: row.campaignStats,
      } satisfies CountyRosterListItem;
    }
    return {
      id: `registry:${reg.slug}`,
      slug: reg.slug,
      fips: reg.fips,
      displayName: reg.displayName,
      regionLabel: rlab,
      leadName: null,
      leadTitle: null,
      hasPublicPage: true,
      campaignStats: null,
    } satisfies CountyRosterListItem;
  });
}

/** @deprecated Prefer `listArkansasCountyCommandRoster` — kept for a few call sites. */
export async function listPublishedCounties() {
  return listArkansasCountyCommandRoster();
}

export async function getCountyCommandBySlug(slug: string): Promise<CountyCommandRecord | null> {
  return resolveCountyCommandBySlug(slug);
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
  const county = await resolveCountyCommandBySlug(slug);
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
