"use client";

import type { ReactNode } from "react";
import { JourneyProvider } from "@/components/journey/journey-context";
import { CampaignGuideDock } from "@/components/campaign-guide/CampaignGuideDock";
import { HomePathwayGateway } from "@/components/journey/HomePathwayGateway";
import { HomeHeroSection } from "@/components/home/sections/HomeHeroSection";
import { HomeTrustRibbonSection } from "@/components/home/sections/HomeTrustRibbonSection";
import { LANDING_JOURNEY_BEATS } from "@/content/home/journey";
import type { MergedHomepageConfig } from "@/lib/content/homepage-merge";

type HomeJourneyShellProps = {
  homepage: MergedHomepageConfig;
  /** Journey beats below the pathway cards (e.g. `beat-act`) */
  children: ReactNode;
};

/**
 * Homepage body: prelude + full-width beats. Prelude is composed here (not passed from a Server
 * Component) so `HomePathwayGateway` stays under `JourneyProvider` in the client tree—avoids
 * `useJourney` running without context after hydration.
 */
export function HomeJourneyShell({ homepage, children }: HomeJourneyShellProps) {
  return (
    <JourneyProvider beats={LANDING_JOURNEY_BEATS}>
      <div className="relative pb-10">
        <div id="beat-arrival" data-journey-beat="beat-arrival">
          <HomeHeroSection hero={homepage.hero} />
          <HomeTrustRibbonSection />
          <HomePathwayGateway />
        </div>
        <div className="mx-auto w-full max-w-[100vw] px-[var(--gutter-x)] xl:max-w-[min(100%,1600px)]">
          {children}
        </div>
        <CampaignGuideDock />
      </div>
    </JourneyProvider>
  );
}
