import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { CivicBeatSections } from "@/components/home/CivicBeatSections";
import { JourneyBeat } from "@/components/journey/JourneyBeat";
import { getMergedHomepageConfig } from "@/lib/content/homepage-merge";
import { pageMeta } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMeta({
  title: "Civic depth",
  description:
    "Ballot access, proof of organization, and how the Secretary of State’s office should serve every county—off the homepage, in one place.",
  path: "/civic-depth",
});

export default async function CivicDepthPage() {
  const homepage = await getMergedHomepageConfig();

  return (
    <>
      <PageHero
        eyebrow="Civic depth"
        title="Democracy tools and proof of organization"
        subtitle="Drill into ballot access and the systems that should serve every county—and how this campaign explains the office in plain language."
      />

      <JourneyBeat id="civic-spine" variant="light" className="scroll-mt-24 border-t-0 !py-6 lg:!py-10">
        <CivicBeatSections homepage={homepage} />
      </JourneyBeat>
    </>
  );
}
