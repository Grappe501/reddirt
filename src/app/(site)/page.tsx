import type { Metadata } from "next";
import { HomeExperience } from "@/components/home/HomeExperience";
import { getMergedHomepageConfig } from "@/lib/content/homepage-merge";
import { pageMeta } from "@/lib/seo/metadata";
import { brandMediaFromLegacySite } from "@/config/brand-media";

export const metadata: Metadata = pageMeta({
  title: "Kelly Grappe for Arkansas Secretary of State",
  description:
    "Fair elections, transparent administration, and a modern Secretary of State’s office for all 75 counties. Meet Kelly, read her priorities, volunteer, or explore county-by-county organizing.",
  path: "/",
  imageSrc: brandMediaFromLegacySite.statewideBanner,
});

export default async function HomePage() {
  const homepage = await getMergedHomepageConfig();

  return <HomeExperience homepage={homepage} />;
}
