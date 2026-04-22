import { HomeProofSection } from "@/components/home/sections/HomeProofSection";
import { HomeSplitSection } from "@/components/home/sections/HomeSplitSection";
import { isHomepageSectionEnabled, type MergedHomepageConfig } from "@/lib/content/homepage-merge";

export type CivicBeatSectionsProps = {
  homepage: Pick<MergedHomepageConfig, "sectionOrder" | "splitDemocracy" | "splitLabor">;
};

/** Former homepage “Civic depth” chapter — democracy split, proof, labor split. */
export function CivicBeatSections({ homepage }: CivicBeatSectionsProps) {
  const so = homepage.sectionOrder;
  const { splitDemocracy, splitLabor } = homepage;

  return (
    <>
      {isHomepageSectionEnabled(so, "democracy") ? (
        <HomeSplitSection variant="democracy" copy={splitDemocracy} />
      ) : null}
      <HomeProofSection />
      {isHomepageSectionEnabled(so, "labor") ? <HomeSplitSection variant="labor" copy={splitLabor} /> : null}
    </>
  );
}
