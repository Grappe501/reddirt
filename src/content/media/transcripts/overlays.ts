/**
 * Committed public transcript overlays.
 * Editors publish → write `{youtubeId}.json` here → register in COMMITTED_TRANSCRIPT_OVERLAYS → deploy.
 * Runtime never auto-publishes.
 */

import type { CampaignTranscript } from "@/content/media/campaign-media-types";

/**
 * Explicit map so Next production builds include overlays without relying on cwd fs.
 * Add entries when a transcript is published and the JSON file is committed.
 */
export const COMMITTED_TRANSCRIPT_OVERLAYS: Record<string, CampaignTranscript> = {
  // Intentionally empty until editorial publish + commit.
};

export function getCommittedTranscriptOverlay(youtubeVideoId: string): CampaignTranscript | null {
  const t = COMMITTED_TRANSCRIPT_OVERLAYS[youtubeVideoId];
  if (!t || t.status !== "PUBLISHED" || !t.plainText?.trim()) return null;
  return t;
}
