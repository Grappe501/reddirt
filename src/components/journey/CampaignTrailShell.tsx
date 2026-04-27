"use client";

import type { ReactNode } from "react";
import { JourneyProvider } from "@/components/journey/journey-context";
import { CAMPAIGN_TRAIL_JOURNEY_BEATS } from "@/content/home/journey";

export function CampaignTrailShell({ children }: { children: ReactNode }) {
  return (
    <JourneyProvider beats={CAMPAIGN_TRAIL_JOURNEY_BEATS}>
      {/* Opaque panel: avoids sitewide body gradient + body text reading as low-contrast on the wash. */}
      <div className="relative bg-kelly-fog text-kelly-ink pb-10">
        <div className="mx-auto w-full max-w-[100vw] px-[var(--gutter-x)] xl:max-w-[min(100%,1600px)]">
          {children}
        </div>
      </div>
    </JourneyProvider>
  );
}
