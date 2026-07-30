/**
 * Homepage campaign video curation for 48h launch sprint.
 * Only registry IDs listed here may mount on `/`.
 * @see docs/website/HOMEPAGE_48H_LAUNCH_SPRINT_MAP.md
 */

import type { CampaignMediaRecord } from "@/content/media/campaign-media-types";
import { getCampaignMediaById, listPublishedCampaignMedia } from "@/content/media/campaign-media-registry";

/** Primary message — after Government That Works. */
export const HOMEPAGE_PRIMARY_MESSAGE_VIDEO_ID = "office-belongs-to-the-people" as const;

/** Kelly Across Arkansas momentum story. */
export const HOMEPAGE_ACROSS_ARKANSAS_VIDEO_ID = "ripples-hot-springs-village" as const;

export const HOMEPAGE_VIDEO_IDS = [
  HOMEPAGE_PRIMARY_MESSAGE_VIDEO_ID,
  HOMEPAGE_ACROSS_ARKANSAS_VIDEO_ID,
] as const;

function resolveHomepageVideo(id: string): CampaignMediaRecord | null {
  const byId = getCampaignMediaById(id);
  if (byId?.publicationStatus === "PUBLISHED" && byId.homepageEligible) return byId;
  return listPublishedCampaignMedia().find((m) => m.id === id && m.homepageEligible) ?? null;
}

export function getHomepagePrimaryMessageVideo(): CampaignMediaRecord | null {
  return resolveHomepageVideo(HOMEPAGE_PRIMARY_MESSAGE_VIDEO_ID);
}

export function getHomepageAcrossArkansasVideo(): CampaignMediaRecord | null {
  return resolveHomepageVideo(HOMEPAGE_ACROSS_ARKANSAS_VIDEO_ID);
}
