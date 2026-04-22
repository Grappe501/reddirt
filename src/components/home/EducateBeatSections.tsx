import { HomeFeaturedVideoSection } from "@/components/home/sections/HomeFeaturedVideoSection";
import { HomeFightForSection } from "@/components/home/sections/HomeFightForSection";
import { HomeHeardSection } from "@/components/home/sections/HomeHeardSection";
import { HomeMovementSection } from "@/components/home/sections/HomeMovementSection";
import { HomePathwaysSection } from "@/components/home/sections/HomePathwaysSection";
import { isHomepageSectionEnabled, type MergedHomepageConfig } from "@/lib/content/homepage-merge";
import type { YoutubeCardVM } from "@/lib/content/content-hub-queries";

export type EducateBeatSectionsProps = {
  homepage: Pick<MergedHomepageConfig, "sectionOrder" | "heardItems" | "movementBeliefs" | "pathwayCards">;
  featuredYoutube: YoutubeCardVM | null;
};

/** `/understand` chapter — what we hear, movement, fight-for, pathways. */
export function EducateBeatSections({ homepage, featuredYoutube }: EducateBeatSectionsProps) {
  const so = homepage.sectionOrder;

  return (
    <>
      {isHomepageSectionEnabled(so, "heard") ? <HomeHeardSection items={homepage.heardItems} /> : null}
      {featuredYoutube ? <HomeFeaturedVideoSection video={featuredYoutube} anchorId="hear-kelly" /> : null}
      {isHomepageSectionEnabled(so, "movement") ? <HomeMovementSection items={homepage.movementBeliefs} /> : null}
      <HomeFightForSection />
      {isHomepageSectionEnabled(so, "pathways") ? <HomePathwaysSection cards={homepage.pathwayCards} /> : null}
    </>
  );
}
