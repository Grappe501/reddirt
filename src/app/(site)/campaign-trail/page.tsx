import type { Metadata } from "next";
import { CampaignTrailExperience } from "@/components/home/CampaignTrailExperience";
import { getHomepageSyncedPosts, toBlogCard } from "@/lib/content/blog-public";
import { getMergedHomepageConfig } from "@/lib/content/homepage-merge";
import { listHomepageOrchestratorRail, toFeedCardVM } from "@/lib/orchestrator/public-feed";
import {
  applyEditorialOverride,
  applyStoryOverride,
  getAllContentOverrides,
} from "@/lib/content/public-overrides";
import { pageMeta } from "@/lib/seo/metadata";
import { getEditorialBySlug } from "@/content/editorial";
import { getStoryBySlug, type StoryEntry } from "@/content/stories";
import type { EditorialPiece } from "@/content/editorial/types";
import { ContentCollection } from "@prisma/client";
import { brandMediaFromLegacySite } from "@/config/brand-media";
import { listUpcomingPublicCampaignEventsForHomepage } from "@/lib/calendar/public-events";
import { getLatestCoveragePlan, listPublicFestivalFeed } from "@/lib/festivals/queries";
import {
  getFeaturedYoutubeForHub,
  listRoadPreviewPosts,
} from "@/lib/content/content-hub-queries";

export const metadata: Metadata = pageMeta({
  title: "Campaign trail",
  description: "Field presence, voices from the road, and the conviction behind this campaign.",
  path: "/campaign-trail",
  imageSrc: brandMediaFromLegacySite.statewideBanner,
});

export default async function CampaignTrailPage() {
  const homepage = await getMergedHomepageConfig();
  const overrideMap = await getAllContentOverrides();
  const homeStories: StoryEntry[] = homepage.featuredStorySlugs
    .map((slug) => {
      const base = getStoryBySlug(slug);
      if (!base) return null;
      const o = overrideMap.get(`${ContentCollection.STORY}:${slug}`);
      if (o?.hidden) return null;
      return applyStoryOverride(base, o);
    })
    .filter((s): s is StoryEntry => Boolean(s));

  const editorialPieces: EditorialPiece[] = homepage.featuredEditorialSlugs
    .map((slug) => {
      const base = getEditorialBySlug(slug);
      if (!base) return null;
      const o = overrideMap.get(`${ContentCollection.EDITORIAL}:${slug}`);
      if (o?.hidden) return null;
      return applyEditorialOverride(base, o);
    })
    .filter((p): p is EditorialPiece => Boolean(p));

  const rawBlog = await getHomepageSyncedPosts(homepage.featuredSyncedPostSlugs);
  const blogPosts = rawBlog.map(toBlogCard);
  const orchestratorItems = await listHomepageOrchestratorRail(6);
  const orchestratorRail = orchestratorItems.map(toFeedCardVM);

  const [featuredYoutube, roadPreviewPosts, upcomingPublicEvents, festivalFeed, coverageSnap] = await Promise.all([
    getFeaturedYoutubeForHub(homepage.featuredHomepageVideoInboundId),
    listRoadPreviewPosts(6),
    listUpcomingPublicCampaignEventsForHomepage(3),
    listPublicFestivalFeed(24),
    getLatestCoveragePlan(),
  ]);

  return (
    <CampaignTrailExperience
      homepage={homepage}
      homeStories={homeStories}
      editorialPieces={editorialPieces}
      blogPosts={blogPosts}
      orchestratorRail={orchestratorRail}
      featuredYoutube={featuredYoutube}
      roadPreviewPosts={roadPreviewPosts}
      upcomingPublicEvents={upcomingPublicEvents}
      festivalFeed={festivalFeed}
      festivalCoveragePayload={coverageSnap?.payload ?? null}
    />
  );
}
