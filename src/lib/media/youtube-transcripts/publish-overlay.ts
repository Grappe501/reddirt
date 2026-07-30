/**
 * Published transcript overlays — client-safe merge path.
 * Disk read/write helpers: publish-overlay-fs.ts (server-only).
 */

import type { CampaignMediaRecord } from "@/content/media/campaign-media-types";
import { getCommittedTranscriptOverlay } from "@/content/media/transcripts/overlays";
import { isPublicTranscript } from "@/lib/media/campaign-transcript";

export const PUBLISHED_TRANSCRIPTS_REL = "src/content/media/transcripts";

/**
 * Public runtime merge: committed overlays only (no node:fs).
 */
export function mergeMediaWithPublishedOverlay(media: CampaignMediaRecord): CampaignMediaRecord {
  const overlay = getCommittedTranscriptOverlay(media.youtubeVideoId);
  if (!overlay) return media;
  const merged = { ...media, transcript: overlay };
  if (!isPublicTranscript(merged) && media.publicationStatus !== "PUBLISHED") {
    return media;
  }
  if (media.publicationStatus !== "PUBLISHED") return media;
  return merged;
}
