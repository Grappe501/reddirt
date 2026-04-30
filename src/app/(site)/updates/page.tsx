import type { Metadata } from "next";
import { NewsHubPlaceholderCard, NewsHubSupportingPage } from "@/components/news/NewsHubSupportingPage";
import { pageMeta } from "@/lib/seo/metadata";
import { brandMediaFromLegacySite } from "@/config/brand-media";

export const metadata: Metadata = pageMeta({
  title: "Campaign updates",
  description:
    "Official updates from the Kelly Grappe for Secretary of State campaign — field notes, announcements, and voter education as they are published.",
  path: "/updates",
  imageSrc: brandMediaFromLegacySite.statewideBanner,
});

export default function CampaignUpdatesPage() {
  return (
    <NewsHubSupportingPage
      eyebrow="News · Official"
      title="Campaign Updates"
      intro="Official updates from the campaign trail, organizing work, and voter education efforts."
    >
      {/*
        TODO: Wire to CMS, Substack digest, or DB-backed `SyncedPost` / campaign posts when curated for this surface.
        TODO: Not Google Calendar — public events stay on /events.
      */}
      <NewsHubPlaceholderCard
        title="Updates on the way"
        body="Updates will appear here as they are published."
      />
      <p className="mx-auto mt-8 max-w-xl text-center font-body text-sm text-kelly-text/60">
        Day-of trail photos and social hubs remain on{" "}
        <a href="/from-the-road" className="font-semibold text-kelly-navy underline-offset-2 hover:underline">
          From the Road
        </a>
        .
      </p>
    </NewsHubSupportingPage>
  );
}
