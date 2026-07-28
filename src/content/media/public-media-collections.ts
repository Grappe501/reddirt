/**
 * Public media destination groupings for /kelly-speaks (launch pass).
 * Homepage featured IDs stay reusable; Shorts stay secondary.
 */

import type { CampaignMediaRecord } from "@/content/media/campaign-media-types";
import { listPublishedCampaignMedia } from "@/content/media/campaign-media-registry";
import {
  HOMEPAGE_ACROSS_ARKANSAS_VIDEO_ID,
  HOMEPAGE_PRIMARY_MESSAGE_VIDEO_ID,
} from "@/content/media/homepage-campaign-videos";

export type PublicMediaCollectionId =
  | "featured-messages"
  | "across-arkansas"
  | "speeches-events"
  | "short-moments";

export type PublicMediaCollection = {
  id: PublicMediaCollectionId;
  title: string;
  intro: string;
  items: CampaignMediaRecord[];
};

const SHORT_FORMAT = "SHORT";

export function listPublicMediaCollections(): PublicMediaCollection[] {
  const published = listPublishedCampaignMedia();
  const byId = new Map(published.map((m) => [m.id, m]));

  const featuredIds = [HOMEPAGE_PRIMARY_MESSAGE_VIDEO_ID];
  const acrossIds = [HOMEPAGE_ACROSS_ARKANSAS_VIDEO_ID];

  const featured = featuredIds.map((id) => byId.get(id)).filter(Boolean) as CampaignMediaRecord[];
  const across = acrossIds.map((id) => byId.get(id)).filter(Boolean) as CampaignMediaRecord[];

  const used = new Set([...featured, ...across].map((m) => m.id));
  const shorts = published.filter((m) => m.format === SHORT_FORMAT);
  const speeches = published.filter((m) => m.format !== SHORT_FORMAT && !used.has(m.id));

  return [
    {
      id: "featured-messages",
      title: "Featured Messages",
      intro: "Core campaign statements — start here to hear Kelly’s governing message.",
      items: featured,
    },
    {
      id: "across-arkansas",
      title: "Kelly Across Arkansas",
      intro: "Trail and community momentum stories.",
      items: across,
    },
    {
      id: "speeches-events",
      title: "Speeches and Events",
      intro: "Forums, addresses, and longer campaign appearances.",
      items: speeches,
    },
    {
      id: "short-moments",
      title: "Short Campaign Moments",
      intro: "Short-form clips. They support the story — they do not dominate it.",
      items: shorts,
    },
  ];
}

export function summarizePublicMediaInventory() {
  const published = listPublishedCampaignMedia();
  const shorts = published.filter((m) => m.format === SHORT_FORMAT);
  const longForm = published.filter((m) => m.format !== SHORT_FORMAT);
  return {
    publishedTotal: published.length,
    longForm: longForm.length,
    shorts: shorts.length,
  };
}
