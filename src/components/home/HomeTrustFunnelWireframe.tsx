/**
 * Homepage section orchestrator — LIVE CANON shell for `/`
 * (KELLY-PUBLIC-WEBSITE-48H-LAUNCH-SPRINT-1.0 narrative order).
 * @see docs/website/HOMEPAGE_48H_LAUNCH_SPRINT_MAP.md
 *
 * Orphaned alternate stacks (`HomeHeroSection`, admin homepage merge) are out of path —
 * this wireframe + TrustFunnel* sections are the live `/` surface.
 */
import type { RoadPostCard } from "@/lib/content/content-hub-queries";
import type { PublicCampaignEvent } from "@/lib/calendar/public-event-types";
import { TrustFunnelFourPillarsSection } from "@/components/home/trust-funnel/TrustFunnelFourPillarsSection";
import { TrustFunnelHero } from "@/components/home/trust-funnel/TrustFunnelHero";
import { TrustFunnelMeetKellySection } from "@/components/home/trust-funnel/TrustFunnelMeetKellySection";
import { TrustFunnelCampaignPhotosSection } from "@/components/home/trust-funnel/TrustFunnelCampaignPhotosSection";
import { TrustFunnelPrimaryMessageSection } from "@/components/home/trust-funnel/TrustFunnelPrimaryMessageSection";
import { TrustFunnelKellyAcrossArkansasSection } from "@/components/home/trust-funnel/TrustFunnelKellyAcrossArkansasSection";
import { TrustFunnelEndorsementsSection } from "@/components/home/trust-funnel/TrustFunnelEndorsementsSection";
import { TrustFunnelNewsUpdatesSection } from "@/components/home/trust-funnel/TrustFunnelNewsUpdatesSection";
import { TrustFunnelFinalActionSection } from "@/components/home/trust-funnel/TrustFunnelFinalActionSection";
import { PublicMediaSlotFrame } from "@/components/media/PublicMediaSlotFrame";
import { getHomepageMeetKellyPhoto } from "@/content/media/homepage-campaign-photos";

export type HomeTrustFunnelWireframeProps = {
  roadPreviewPosts: RoadPostCard[];
  upcomingPublicEvents: PublicCampaignEvent[];
};

/**
 * Soft visual glue between primary video and Meet Kelly copy —
 * proof still via typed public slot (not a new section / not memoir).
 */
function MeetKellyMediaBridge() {
  return (
    <div
      className="relative isolate h-[min(42vw,18rem)] w-full overflow-hidden border-y border-kelly-ink/10 sm:h-[min(36vw,20rem)]"
      aria-hidden
    >
      <PublicMediaSlotFrame
        slotKey="home.personality.primary"
        className="absolute inset-0 h-full w-full"
        sizes="100vw"
        warmOverlay
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-white/70"
        aria-hidden
      />
    </div>
  );
}

export function HomeTrustFunnelWireframe({ roadPreviewPosts, upcomingPublicEvents }: HomeTrustFunnelWireframeProps) {
  const meetKellyPhoto = getHomepageMeetKellyPhoto();

  return (
    <div className="bg-white">
      <TrustFunnelHero />

      <TrustFunnelFourPillarsSection />

      <TrustFunnelPrimaryMessageSection />

      <MeetKellyMediaBridge />

      <TrustFunnelMeetKellySection photo={meetKellyPhoto} />

      <TrustFunnelKellyAcrossArkansasSection />

      <TrustFunnelCampaignPhotosSection />

      <TrustFunnelEndorsementsSection />

      <TrustFunnelNewsUpdatesSection
        roadPreviewPosts={roadPreviewPosts}
        upcomingPublicEvents={upcomingPublicEvents}
      />

      <TrustFunnelFinalActionSection />
    </div>
  );
}
