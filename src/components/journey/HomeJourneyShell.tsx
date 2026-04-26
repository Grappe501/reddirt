"use client";

import type { ReactNode } from "react";
import { JourneyProvider } from "@/components/journey/journey-context";
import { HomeHeroSection } from "@/components/home/sections/HomeHeroSection";
import { HomeTrustRibbonSection } from "@/components/home/sections/HomeTrustRibbonSection";
import { LANDING_JOURNEY_BEATS } from "@/content/home/journey";
import type { MergedHomepageConfig } from "@/lib/content/homepage-merge";

type HomeJourneyShellProps = {
  homepage: MergedHomepageConfig;
  /** Pass 02: server-rendered entry funnel (four pathways) between trust ribbon and trail band. */
  entryFunnel?: ReactNode;
  /** Optional band between funnel and the “after gateway” region (e.g. trail photos). */
  trailBand?: ReactNode;
  /** Rendered after trail band (e.g. Step in / get involved). */
  afterGateway?: ReactNode;
  /** Optional extra beats below (full-width column). */
  children?: ReactNode;
};

/**
 * Homepage body: prelude + full-width beats. Entry funnel is passed from the server `page.tsx` as
 * `entryFunnel` so we keep a single coherent journey without duplicating gateway cards.
 */
export function HomeJourneyShell({ homepage, entryFunnel, trailBand, afterGateway, children }: HomeJourneyShellProps) {
  return (
    <JourneyProvider beats={LANDING_JOURNEY_BEATS}>
      <div className="relative pb-10">
        <div id="beat-arrival" data-journey-beat="beat-arrival">
          <HomeHeroSection hero={homepage.hero} />
          <HomeTrustRibbonSection />
          {entryFunnel}
        </div>
        {trailBand}
        {afterGateway}
        {children ? (
          <div className="mx-auto w-full max-w-[100vw] px-[var(--gutter-x)] xl:max-w-[min(100%,1600px)]">
            {children}
          </div>
        ) : null}
      </div>
    </JourneyProvider>
  );
}
