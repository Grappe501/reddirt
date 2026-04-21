import { siteConfig } from "@/config/site";
import type { StoryEntry } from "@/content/stories";
import type { EditorialPiece } from "@/content/editorial/types";
import type { HomepageBlogCard } from "@/lib/content/blog-public";
import { isHomepageSectionEnabled, type MergedHomepageConfig } from "@/lib/content/homepage-merge";
import type { PublicFeedCardVM } from "@/lib/orchestrator/public-feed";
import {
  buildJournalCards,
  buildVoiceCards,
  type JournalCardVM,
} from "@/content/home/homepagePremium";
import { HomeJourneyShell } from "@/components/journey/HomeJourneyShell";
import { HomePathwayGateway } from "@/components/journey/HomePathwayGateway";
import { JourneyBeat } from "@/components/journey/JourneyBeat";
import { HomeHeroSection } from "@/components/home/sections/HomeHeroSection";
import { HomeTrustRibbonSection } from "@/components/home/sections/HomeTrustRibbonSection";
import { HomeHeardSection } from "@/components/home/sections/HomeHeardSection";
import { HomeMeetKellySection } from "@/components/home/sections/HomeMeetKellySection";
import { HomeMovementSection } from "@/components/home/sections/HomeMovementSection";
import { HomeOfficeMattersSection } from "@/components/home/sections/HomeOfficeMattersSection";
import { HomeFightForSection } from "@/components/home/sections/HomeFightForSection";
import { HomePathwaysSection } from "@/components/home/sections/HomePathwaysSection";
import { HomeSplitSection } from "@/components/home/sections/HomeSplitSection";
import { HomeProofSection } from "@/components/home/sections/HomeProofSection";
import { HomeStatewideSection } from "@/components/home/sections/HomeStatewideSection";
import { HomeVideoSection } from "@/components/home/sections/HomeVideoSection";
import { HomeArkansasBandSection } from "@/components/home/sections/HomeArkansasBandSection";
import { HomeVoicesSection } from "@/components/home/sections/HomeVoicesSection";
import { HomeEditorialSpotlightSection } from "@/components/home/sections/HomeEditorialSpotlightSection";
import { HomeBlogHighlightSection } from "@/components/home/sections/HomeBlogHighlightSection";
import { HomeJournalSection } from "@/components/home/sections/HomeJournalSection";
import { HomeHomepageQuoteSection } from "@/components/home/sections/HomeHomepageQuoteSection";
import { HomeGetInvolvedSection } from "@/components/home/sections/HomeGetInvolvedSection";
import { HomeClosingSection } from "@/components/home/sections/HomeClosingSection";
import { HomeFeaturedVideoSection } from "@/components/home/sections/HomeFeaturedVideoSection";
import { HomeFromTheRoadPreviewSection } from "@/components/home/sections/HomeFromTheRoadPreviewSection";
import { HomeWatchPreviewStrip } from "@/components/home/sections/HomeWatchPreviewStrip";
import type { RoadPostCard, YoutubeCardVM } from "@/lib/content/content-hub-queries";

export type HomeExperienceProps = {
  homepage: MergedHomepageConfig;
  homeStories: StoryEntry[];
  editorialPieces: EditorialPiece[];
  blogPosts: HomepageBlogCard[];
  orchestratorRail: PublicFeedCardVM[];
  featuredYoutube: YoutubeCardVM | null;
  roadPreviewPosts: RoadPostCard[];
};

function buildTrailCards(
  orchestratorRail: PublicFeedCardVM[],
  blogPosts: HomepageBlogCard[],
  editorialPieces: EditorialPiece[],
): JournalCardVM[] {
  const out: JournalCardVM[] = [];

  for (const p of orchestratorRail.slice(0, 3)) {
    out.push({
      key: p.id,
      title: p.title,
      excerpt: p.excerpt,
      href: p.href,
      meta: p.meta,
      cta: p.ctaLabel,
      imageSrc: p.imageSrc,
      imageAlt: p.imageAlt,
    });
  }
  let bi = 0;
  while (out.length < 3 && bi < blogPosts.length) {
    const p = blogPosts[bi];
    bi += 1;
    out.push({
      key: `blog-${p.slug}`,
      title: p.title,
      excerpt: p.excerpt,
      href: p.href,
      meta: p.publishedAt
        ? `${p.publishedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · Notebook`
        : "Notebook",
      cta: "Read",
      imageSrc: p.imageSrc,
      imageAlt: p.imageAlt,
    });
  }
  let ei = 0;
  while (out.length < 3 && ei < editorialPieces.length) {
    const p = editorialPieces[ei];
    ei += 1;
    out.push({
      key: `ed-${p.slug}`,
      title: p.title,
      excerpt: p.summary,
      href: `/editorial/${p.slug}`,
      meta: p.category,
      cta: "Read essay",
      imageSrc: p.image.src,
      imageAlt: p.image.alt,
    });
  }
  return out;
}

export function HomeExperience({
  homepage,
  homeStories,
  editorialPieces,
  blogPosts,
  orchestratorRail,
  featuredYoutube,
  roadPreviewPosts,
}: HomeExperienceProps) {
  const {
    hero,
    finalCta,
    sectionOrder,
    heardItems,
    movementBeliefs,
    pathwayCards,
    splitDemocracy,
    splitLabor,
    arkansasBand,
    quoteBand,
  } = homepage;

  const so = sectionOrder;
  const voices = buildVoiceCards(homeStories, 3);
  const liveJournal = buildTrailCards(orchestratorRail, blogPosts, editorialPieces);
  const journalCards = buildJournalCards(liveJournal, 3);
  const closingDonateHref = finalCta.secondaryHref === "/donate" ? siteConfig.donateHref : finalCta.secondaryHref;

  const prelude = (
    <div id="beat-arrival" data-journey-beat="beat-arrival">
      <HomeHeroSection hero={hero} />
      <HomeTrustRibbonSection />
      <HomePathwayGateway />
    </div>
  );

  return (
    <HomeJourneyShell prelude={prelude}>
      <JourneyBeat
        id="beat-educate"
        variant="mist"
        lead={
          <>
            <p className="text-center font-body text-[11px] font-bold uppercase tracking-[0.26em] text-red-dirt">Educate</p>
            <h2 className="mt-4 text-center font-heading text-[clamp(1.75rem,3.5vw,2.65rem)] font-bold tracking-tight text-civic-ink">
              Understand the office—and why this campaign exists
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-center font-body text-lg leading-relaxed text-civic-slate md:text-xl">
              Each block below opens into deeper pages. Nothing here is decoration: it’s the spine of the Secretary of
              State race, told for real people.
            </p>
          </>
        }
      >
        {isHomepageSectionEnabled(so, "heard") ? <HomeHeardSection items={heardItems} /> : null}
        {featuredYoutube ? <HomeFeaturedVideoSection video={featuredYoutube} anchorId="hear-kelly" /> : null}
        <HomeMeetKellySection />
        {isHomepageSectionEnabled(so, "movement") ? <HomeMovementSection items={movementBeliefs} /> : null}
        <HomeOfficeMattersSection />
        <HomeFightForSection />
        {isHomepageSectionEnabled(so, "pathways") ? <HomePathwaysSection cards={pathwayCards} /> : null}
      </JourneyBeat>

      <JourneyBeat
        id="beat-civic"
        variant="light"
        lead={
          <>
            <p className="text-center font-body text-[11px] font-bold uppercase tracking-[0.26em] text-civic-blue">Civic depth</p>
            <h2 className="mt-4 text-center font-heading text-[clamp(1.65rem,3vw,2.35rem)] font-bold text-civic-ink">
              Democracy tools and proof of organization
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center font-body text-lg text-civic-slate">
              Drill into ballot access and the systems that should serve every county—then see how this campaign is
              built, not just branded.
            </p>
          </>
        }
      >
        {isHomepageSectionEnabled(so, "democracy") ? <HomeSplitSection variant="democracy" copy={splitDemocracy} /> : null}
        <HomeProofSection />
        {isHomepageSectionEnabled(so, "labor") ? <HomeSplitSection variant="labor" copy={splitLabor} /> : null}
      </JourneyBeat>

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

      <JourneyBeat
        id="beat-act"
        variant="mist"
        lead={
          <>
            <p className="text-center font-body text-[11px] font-bold uppercase tracking-[0.26em] text-civic-blue">Your move</p>
            <h2 className="mt-4 text-center font-heading text-[clamp(1.65rem,3vw,2.35rem)] font-bold text-civic-ink">
              Help, give, or keep learning—your lane matters
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center font-body text-lg text-civic-slate">
              Pick what fits your life. Every button leads somewhere real.
            </p>
          </>
        }
      >
        <HomeWatchPreviewStrip />
        <HomeGetInvolvedSection />
        <HomeClosingSection
          eyebrow={finalCta.eyebrow}
          title={finalCta.title}
          description={finalCta.description}
          primaryLabel={finalCta.primaryLabel}
          primaryHref={finalCta.primaryHref}
          secondaryLabel={finalCta.secondaryLabel}
          secondaryHref={closingDonateHref}
        />
      </JourneyBeat>
    </HomeJourneyShell>
  );
}
