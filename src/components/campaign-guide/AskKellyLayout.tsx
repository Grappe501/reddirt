"use client";

import { usePathname } from "next/navigation";
import { CampaignGuideDock } from "@/components/campaign-guide/CampaignGuideDock";
import { JourneyProvider } from "@/components/journey/journey-context";
import { JOURNEY_BEAT_DEFINITIONS } from "@/content/home/journey";

/**
 * Sitewide floating “Ask Kelly” + guide. `key={pathname}` resets journey scroll-spy when navigating
 * so the chip doesn’t show a beat from the previous page.
 */
export function AskKellyLayout() {
  const pathname = usePathname();
  return (
    <JourneyProvider key={pathname} beats={JOURNEY_BEAT_DEFINITIONS}>
      <CampaignGuideDock />
    </JourneyProvider>
  );
}
