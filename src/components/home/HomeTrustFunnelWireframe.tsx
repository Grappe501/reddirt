/**
 * Homepage section orchestrator — LIVE CANON shell for `/`
 * (KELLY-PUBLIC-WEBSITE-48H-LAUNCH-SPRINT-1.0 narrative order).
 * @see docs/website/HOMEPAGE_48H_LAUNCH_SPRINT_MAP.md
 *
 * Orphaned alternate stacks (`HomeHeroSection`, admin homepage merge) are out of path —
 * this wireframe + TrustFunnel* sections are the live `/` surface.
 *
 * Meet Kelly full story + personality hero-strip live on `/about` — not remounted here.
 * Hero CTAs still point to Meet Kelly (`/about`).
 */
import type { RoadPostCard } from "@/lib/content/content-hub-queries";
import type { PublicCampaignEvent } from "@/lib/calendar/public-event-types";
import { TrustFunnelFourPillarsSection } from "@/components/home/trust-funnel/TrustFunnelFourPillarsSection";
import { TrustFunnelHero } from "@/components/home/trust-funnel/TrustFunnelHero";
import { TrustFunnelCampaignPhotosSection } from "@/components/home/trust-funnel/TrustFunnelCampaignPhotosSection";
import { TrustFunnelPrimaryMessageSection } from "@/components/home/trust-funnel/TrustFunnelPrimaryMessageSection";
import { TrustFunnelKellyAcrossArkansasSection } from "@/components/home/trust-funnel/TrustFunnelKellyAcrossArkansasSection";
import { TrustFunnelEndorsementsSection } from "@/components/home/trust-funnel/TrustFunnelEndorsementsSection";
import { TrustFunnelNewsUpdatesSection } from "@/components/home/trust-funnel/TrustFunnelNewsUpdatesSection";
import { TrustFunnelFinalActionSection } from "@/components/home/trust-funnel/TrustFunnelFinalActionSection";

export type HomeTrustFunnelWireframeProps = {
  roadPreviewPosts: RoadPostCard[];
  upcomingPublicEvents: PublicCampaignEvent[];
};

export function HomeTrustFunnelWireframe({ roadPreviewPosts, upcomingPublicEvents }: HomeTrustFunnelWireframeProps) {
  return (
    <div className="bg-white">
      <TrustFunnelHero />

      <TrustFunnelFourPillarsSection />

      <TrustFunnelPrimaryMessageSection />

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
