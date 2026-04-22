"use client";

import type { ReactNode } from "react";
import { JourneyProvider } from "@/components/journey/journey-context";
import { CampaignGuideDock } from "@/components/campaign-guide/CampaignGuideDock";
import { CAMPAIGN_TRAIL_JOURNEY_BEATS } from "@/content/home/journey";

export function CampaignTrailShell({ children }: { children: ReactNode }) {
  return (
    <JourneyProvider beats={CAMPAIGN_TRAIL_JOURNEY_BEATS}>
      <div className="relative pb-10">
        <div className="mx-auto w-full max-w-[100vw] px-[var(--gutter-x)] xl:max-w-[min(100%,1600px)]">
          {children}
        </div>
        <CampaignGuideDock />
      </div>
    </JourneyProvider>
  );
}
