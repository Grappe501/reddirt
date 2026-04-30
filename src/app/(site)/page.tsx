import type { Metadata } from "next";
import { HomeDonateFloatingGate } from "@/components/home/HomeDonateFloatingGate";
import { HomeTrustFunnelWireframe } from "@/components/home/HomeTrustFunnelWireframe";
import { siteConfig } from "@/config/site";
import { pageMeta } from "@/lib/seo/metadata";
import { brandMediaFromLegacySite } from "@/config/brand-media";
import { listRoadPreviewPosts } from "@/lib/content/content-hub-queries";
import { listUpcomingPublicCampaignEventsForHomepage } from "@/lib/calendar/public-events";

export const metadata: Metadata = pageMeta({
  title: "Home",
  description: siteConfig.description,
  path: "/",
  imageSrc: brandMediaFromLegacySite.statewideBanner,
});

export default async function HomePage() {
  const [roadPreviewPosts, upcomingPublicEvents] = await Promise.all([
    listRoadPreviewPosts(6),
    listUpcomingPublicCampaignEventsForHomepage(6),
  ]);

  return (
    <>
      <HomeDonateFloatingGate />
      <HomeTrustFunnelWireframe roadPreviewPosts={roadPreviewPosts} upcomingPublicEvents={upcomingPublicEvents} />
    </>
  );
}
