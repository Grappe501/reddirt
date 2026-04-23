"use client";

import type { ReactNode } from "react";
import { JourneyProvider } from "@/components/journey/journey-context";
import { CAMPAIGN_TRAIL_JOURNEY_BEATS } from "@/content/home/journey";

export function CampaignTrailShell({ children }: { children: ReactNode }) {
  return (
    <JourneyProvider beats={CAMPAIGN_TRAIL_JOURNEY_BEATS}>
      {/* Opaque field layer: avoids sitewide body blue gradient + dark default text reading as “black on blue.” */}
      <div className="relative bg-civic-fog text-civic-ink pb-10">
        <div className="mx-auto w-full max-w-[100vw] px-[var(--gutter-x)] xl:max-w-[min(100%,1600px)]">
          {children}
        </div>
      </div>
    </JourneyProvider>
  );
}
