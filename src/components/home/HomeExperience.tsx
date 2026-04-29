import type { ReactNode } from "react";
import { HomeJourneyShell } from "@/components/journey/HomeJourneyShell";
import { HomeGetInvolvedSection } from "@/components/home/sections/HomeGetInvolvedSection";
import { HomeDonateFloatingGate } from "@/components/home/HomeDonateFloatingGate";
import { type MergedHomepageConfig } from "@/lib/content/homepage-merge";

export type HomeExperienceProps = {
  homepage: MergedHomepageConfig;
  /** Optional band between pathway cards and “Get involved” (trail gallery lives on /from-the-road). */
  trailBand?: ReactNode;
};

export function HomeExperience({ homepage, trailBand }: HomeExperienceProps) {
  return (
    <>
      <HomeDonateFloatingGate />
      <HomeJourneyShell
        homepage={homepage}
        trailBand={trailBand}
        afterGateway={
          <div key="home-after-gateway">
            {/* Old `/#hear-kelly` bookmarks land near Step in after the watch strip was removed */}
            <div id="hear-kelly" hidden aria-hidden="true" />
            <section
              id="beat-act"
              data-journey-beat="beat-act"
              className="scroll-mt-[5.5rem] border-t border-kelly-ink/[0.06]"
              aria-label="Get involved"
            >
              <HomeGetInvolvedSection />
            </section>
          </div>
        }
      />
    </>
  );
}
