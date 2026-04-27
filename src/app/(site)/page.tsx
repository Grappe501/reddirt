import type { Metadata } from "next";
import { HomeExperience } from "@/components/home/HomeExperience";
import { getMergedHomepageConfig } from "@/lib/content/homepage-merge";
import { pageMeta } from "@/lib/seo/metadata";
import { brandMediaFromLegacySite } from "@/config/brand-media";

export const metadata: Metadata = pageMeta({
  title: "Fair elections & organizing for Arkansas",
  description:
    "Kelly Grappe for Secretary of State: pathways into Power of 5 relational organizing, statewide organizing intelligence, the 75-county workbench, and Conversations & Stories—plus voter registration help and ways to volunteer.",
  path: "/",
  imageSrc: brandMediaFromLegacySite.statewideBanner,
});

export default async function HomePage() {
  const homepage = await getMergedHomepageConfig();

  return <HomeExperience homepage={homepage} />;
}
