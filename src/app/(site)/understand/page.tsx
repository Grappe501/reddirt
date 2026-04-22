import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { EducateBeatSections } from "@/components/home/EducateBeatSections";
import { JourneyBeat } from "@/components/journey/JourneyBeat";
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

  return (
    <>
      <PageHero
        eyebrow="Educate"
        title="Understand the office—and why this campaign exists"
        subtitle="Each block below opens into deeper pages. Nothing here is decoration: it’s the spine of the Secretary of State race, told for real people."
      />

      <JourneyBeat
        id="understand-spine"
        variant="mist"
        className="scroll-mt-24 border-t-0 !py-6 lg:!py-10"
      >
        <EducateBeatSections homepage={homepage} featuredYoutube={featuredYoutube} />
      </JourneyBeat>
    </>
  );
}
