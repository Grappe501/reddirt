import type { Metadata } from "next";
import { EditorialCampaignPhoto } from "@/components/about/EditorialCampaignPhoto";
import { PageHero } from "@/components/blocks/PageHero";
import { EducateBeatSections } from "@/components/home/EducateBeatSections";
import { JourneyBeat } from "@/components/journey/JourneyBeat";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { UNDERSTAND_MOVEMENT_BRIDGE_PHOTO_ID } from "@/content/media/campaign-trail-photo-use";
import { campaignTrailPhotos } from "@/content/media/campaign-trail-photos";
import { getMergedHomepageConfig } from "@/lib/content/homepage-merge";
import { pageMeta } from "@/lib/seo/metadata";
import { getFeaturedYoutubeForHub } from "@/lib/content/content-hub-queries";

export const metadata: Metadata = pageMeta({
  title: "Understand the office",
  description:
    "What Arkansans expect from the Secretary of State, who Kelly is, and why this campaign exists—without overwhelming the homepage.",
  path: "/understand",
});

export default async function UnderstandTheOfficePage() {
  const homepage = await getMergedHomepageConfig();
  const featuredYoutube = await getFeaturedYoutubeForHub(homepage.featuredHomepageVideoInboundId);
  const movementBridgePhoto = campaignTrailPhotos.find((p) => p.id === UNDERSTAND_MOVEMENT_BRIDGE_PHOTO_ID);

  return (
    <>
      <PageHero
        eyebrow="Educate"
        title="Understand the office—and why this campaign exists"
        subtitle="Fair elections, clear business services, and a Secretary of State’s office that works for every county—explore what that means in plain language."
      />

      <JourneyBeat
        id="understand-spine"
        variant="mist"
        className="scroll-mt-24 border-t-0 !py-6 lg:!py-10"
      >
        <EducateBeatSections
          homepage={homepage}
          featuredYoutube={featuredYoutube}
          bridgeBeforeMovement={
            movementBridgePhoto ? (
              <section
                className="border-t border-civic-ink/[0.06] bg-white py-10 md:py-14"
                aria-label="Campaign trail moment"
              >
                <ContentContainer wide>
                  <EditorialCampaignPhoto
                    photo={movementBridgePhoto}
                    variant="fluid"
                    kicker="On the trail"
                    caption="County rooms and honest handshakes—the work starts with showing up."
                  />
                </ContentContainer>
              </section>
            ) : null
          }
        />
      </JourneyBeat>
    </>
  );
}
