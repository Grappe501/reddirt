import type { StoryEntry } from "@/content/stories";
import type { EditorialPiece } from "@/content/editorial/types";
import type { HomepageBlogCard } from "@/lib/content/blog-public";
import { isHomepageSectionEnabled, type MergedHomepageConfig } from "@/lib/content/homepage-merge";
import type { PublicFeedCardVM } from "@/lib/orchestrator/public-feed";
import {
  buildJournalCards,
  buildJournalTrailLive,
  buildVoiceCards,
} from "@/content/home/homepagePremium";
import { CampaignTrailShell } from "@/components/journey/CampaignTrailShell";
import { JourneyBeat } from "@/components/journey/JourneyBeat";
import { HomeStatewideSection } from "@/components/home/sections/HomeStatewideSection";
import { HomeVideoSection } from "@/components/home/sections/HomeVideoSection";
import { HomeArkansasBandSection } from "@/components/home/sections/HomeArkansasBandSection";
import { HomeVoicesSection } from "@/components/home/sections/HomeVoicesSection";
import { HomeEditorialSpotlightSection } from "@/components/home/sections/HomeEditorialSpotlightSection";
import { HomeBlogHighlightSection } from "@/components/home/sections/HomeBlogHighlightSection";
import { HomeJournalSection } from "@/components/home/sections/HomeJournalSection";
import { HomeHomepageQuoteSection } from "@/components/home/sections/HomeHomepageQuoteSection";
import { HomeFromTheRoadPreviewSection } from "@/components/home/sections/HomeFromTheRoadPreviewSection";
import { HomeUpcomingCalendarSection } from "@/components/home/sections/HomeUpcomingCalendarSection";
import type { RoadPostCard, YoutubeCardVM } from "@/lib/content/content-hub-queries";
import type { PublicCampaignEvent } from "@/lib/calendar/public-event-types";

export type CampaignTrailExperienceProps = {
  homepage: MergedHomepageConfig;
  homeStories: StoryEntry[];
  editorialPieces: EditorialPiece[];
  blogPosts: HomepageBlogCard[];
  orchestratorRail: PublicFeedCardVM[];
  featuredYoutube: YoutubeCardVM | null;
  roadPreviewPosts: RoadPostCard[];
  upcomingPublicEvents: PublicCampaignEvent[];
};

export function CampaignTrailExperience({
  homepage,
  homeStories,
  editorialPieces,
  blogPosts,
  orchestratorRail,
  featuredYoutube,
  roadPreviewPosts,
  upcomingPublicEvents,
}: CampaignTrailExperienceProps) {
  const { sectionOrder, arkansasBand, quoteBand } = homepage;
  const so = sectionOrder;
  const voices = buildVoiceCards(homeStories, 3);
  const liveJournal = buildJournalTrailLive(orchestratorRail, blogPosts, editorialPieces);
  const journalCards = buildJournalCards(liveJournal, 3);

  return (
    <CampaignTrailShell>
      <JourneyBeat
        id="beat-field"
        variant="mist"
        lead={
          <>
            <p className="text-center font-body text-[11px] font-bold uppercase tracking-[0.26em] text-civic-gold">In the field</p>
            <h2 className="mt-4 text-center font-heading text-[clamp(1.65rem,3vw,2.35rem)] font-bold text-civic-ink">
              Arkansas-wide presence, human voice
            </h2>
          </>
        }
      >
        <HomeStatewideSection />
        {upcomingPublicEvents.length ? <HomeUpcomingCalendarSection events={upcomingPublicEvents} /> : null}
        {roadPreviewPosts.length ? <HomeFromTheRoadPreviewSection posts={roadPreviewPosts} /> : null}
        <HomeVideoSection omitMainEmbed={Boolean(featuredYoutube)} />
        {isHomepageSectionEnabled(so, "arkansas") ? <HomeArkansasBandSection band={arkansasBand} /> : null}
      </JourneyBeat>

      <JourneyBeat
        id="beat-people"
        variant="light"
        lead={
          <>
            <p className="text-center font-body text-[11px] font-bold uppercase tracking-[0.26em] text-red-dirt">Voices</p>
            <h2 className="mt-4 text-center font-heading text-[clamp(1.65rem,3vw,2.35rem)] font-bold text-civic-ink">
              Stories, essays, and the trail notebook
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center font-body text-lg text-civic-slate">
              Read further on every card—this is the living record of the campaign.
            </p>
          </>
        }
      >
        {isHomepageSectionEnabled(so, "stories") ? <HomeVoicesSection voices={voices} /> : null}
        {isHomepageSectionEnabled(so, "editorial") ? <HomeEditorialSpotlightSection pieces={editorialPieces} /> : null}
        {isHomepageSectionEnabled(so, "blog") ? <HomeBlogHighlightSection posts={blogPosts} /> : null}
        {isHomepageSectionEnabled(so, "updates") ? <HomeJournalSection cards={journalCards} /> : null}
      </JourneyBeat>

      {isHomepageSectionEnabled(so, "quote") ? (
        <JourneyBeat
          id="beat-conviction"
          variant="light"
          lead={
            <>
              <p className="text-center font-body text-[11px] font-bold uppercase tracking-[0.26em] text-red-dirt">
                Conviction
              </p>
              <h2 className="mt-4 text-center font-heading text-[clamp(1.5rem,2.8vw,2rem)] font-bold text-civic-ink">
                The standard we’re asking you to hold us to
              </h2>
            </>
          }
        >
          <HomeHomepageQuoteSection quote={quoteBand.quote} attribution={quoteBand.attribution} />
        </JourneyBeat>
      ) : null}
    </CampaignTrailShell>
  );
}
