/**
 * Campaign media import resolver — one authoritative record per YouTube video.
 * Never creates a second registry row for a duplicate URL/id.
 */

import type { CampaignMediaRecord } from "@/content/media/campaign-media-types";
import { CAMPAIGN_MEDIA_REGISTRY, getCampaignMediaByYoutubeId } from "@/content/media/campaign-media-registry";
import { extractCanonicalYoutubeVideoId } from "@/lib/media/youtube-id";

export type CampaignMediaImportResolution =
  | {
      action: "OPEN_EXISTING";
      youtubeVideoId: string;
      media: CampaignMediaRecord;
      message: string;
    }
  | {
      action: "CREATE_NEW_CANDIDATE";
      youtubeVideoId: string;
      media: null;
      message: string;
    }
  | {
      action: "INVALID_INPUT";
      youtubeVideoId: null;
      media: null;
      message: string;
    };

/**
 * Paste URL or id → extract canonical id → search registry.
 * Exists → OPEN_EXISTING (update path). Not found → CREATE_NEW_CANDIDATE (caller may create once).
 */
export function resolveCampaignMediaImport(input: string): CampaignMediaImportResolution {
  const youtubeVideoId = extractCanonicalYoutubeVideoId(input);
  if (!youtubeVideoId) {
    return {
      action: "INVALID_INPUT",
      youtubeVideoId: null,
      media: null,
      message: "Could not extract a YouTube video id from that URL or value.",
    };
  }

  const media = getCampaignMediaByYoutubeId(youtubeVideoId);
  if (media) {
    return {
      action: "OPEN_EXISTING",
      youtubeVideoId,
      media,
      message: `Duplicate detected — open existing record ${media.id} (${youtubeVideoId}). Do not create a second record.`,
    };
  }

  return {
    action: "CREATE_NEW_CANDIDATE",
    youtubeVideoId,
    media: null,
    message: `Not in registry — safe to create one new record for ${youtubeVideoId}.`,
  };
}

/** True when this YouTube id is already registered (after canonical extraction). */
export function isDuplicateCampaignYoutubeId(input: string): boolean {
  const id = extractCanonicalYoutubeVideoId(input);
  if (!id) return false;
  return CAMPAIGN_MEDIA_REGISTRY.some((m) => m.youtubeVideoId === id);
}
