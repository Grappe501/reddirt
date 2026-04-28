import type { Metadata } from "next";
import { HomeExperience } from "@/components/home/HomeExperience";
import { getMergedHomepageConfig } from "@/lib/content/homepage-merge";
import { pageMeta } from "@/lib/seo/metadata";
import { brandMediaFromLegacySite } from "@/config/brand-media";

export const metadata: Metadata = pageMeta({
  title: "Kelly Grappe for Arkansas Secretary of State",
  description:
    "Kelly Grappe for Arkansas Secretary of State: fair elections, accountable administration, and a modern office for all 75 counties—meet Kelly, read priorities, volunteer, or explore organizing near you.",
  path: "/",
  imageSrc: brandMediaFromLegacySite.statewideBanner,
});

export default async function HomePage() {
  const homepage = await getMergedHomepageConfig();

  return <HomeExperience homepage={homepage} />;
}
