import type { Metadata } from "next";
import { HomeExperience } from "@/components/home/HomeExperience";
import { HomeEntryFunnelSection } from "@/components/home/HomeEntryFunnelSection";
import { siteConfig } from "@/config/site";
import { getMergedHomepageConfig } from "@/lib/content/homepage-merge";
import { pageMeta } from "@/lib/seo/metadata";
import { brandMediaFromLegacySite } from "@/config/brand-media";

export const metadata: Metadata = pageMeta({
  title: "Home",
  description: siteConfig.description,
  path: "/",
  imageSrc: brandMediaFromLegacySite.statewideBanner,
});

/** Homepage — Pass 02 wires `HomeEntryFunnelSection` into `HomeJourneyShell` (see `HomeExperience`). */
export default async function HomePage() {
  const homepage = await getMergedHomepageConfig();

  return (
    <HomeExperience homepage={homepage} entryFunnel={<HomeEntryFunnelSection />} />
  );
}
