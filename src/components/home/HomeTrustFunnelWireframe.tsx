/**
 * Homepage section orchestrator — LIVE CANON shell for `/`
 * (KELLY-PUBLIC-WEBSITE-48H-LAUNCH-SPRINT-1.0 narrative order).
 * @see docs/website/HOMEPAGE_48H_LAUNCH_SPRINT_MAP.md
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
import { getHomepageMeetKellyPhoto } from "@/content/media/homepage-campaign-photos";

export type HomeTrustFunnelWireframeProps = {
  roadPreviewPosts: RoadPostCard[];
  upcomingPublicEvents: PublicCampaignEvent[];
};

export function HomeTrustFunnelWireframe({ roadPreviewPosts, upcomingPublicEvents }: HomeTrustFunnelWireframeProps) {
  const meetKellyPhoto = getHomepageMeetKellyPhoto();

  return (
    <div className="bg-white">
      <TrustFunnelHero />

      <TrustFunnelFourPillarsSection />

      <TrustFunnelPrimaryMessageSection />

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
