"use client";

import type { ReactNode } from "react";
import { JourneyProvider } from "@/components/journey/journey-context";
import { HomeJourneyNavDesktop, HomeJourneyNavMobile } from "@/components/journey/HomeJourneyNav";
import { CampaignGuideDock } from "@/components/campaign-guide/CampaignGuideDock";

type HomeJourneyShellProps = {
  /** Hero + trust + gateway — full width, outside the grid */
  prelude: ReactNode;
  /** Main journey beats (wrapped sections) */
  children: ReactNode;
};

/**
 * Two-column journey on large screens: sticky chapter nav + content.
 * Mobile: horizontal beat chips + campaign guide dock.
 */
export function HomeJourneyShell({ prelude, children }: HomeJourneyShellProps) {
  return (
    <JourneyProvider>
      <div className="relative pb-20 lg:pb-0">
        {prelude}
        <div className="mx-auto flex w-full max-w-[100vw] gap-6 px-[var(--gutter-x)] lg:gap-10 xl:max-w-[min(100%,1600px)]">
          <HomeJourneyNavDesktop />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
        <HomeJourneyNavMobile />
        <CampaignGuideDock />
      </div>
    </JourneyProvider>
  );
}
