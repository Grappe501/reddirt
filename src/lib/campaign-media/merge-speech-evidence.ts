import type { CampaignMediaRecord } from "@/content/media/campaign-media-types";
import type { SpeechEvidenceOverlay, SpeechEvidenceStore } from "@/lib/campaign-media/evidence-types";
import { applySpeechEvidenceOverlay } from "@/lib/campaign-media/apply-evidence-overlay";
import speechEvidenceJson from "../../../data/campaign-media/speech-evidence.json";

/**
 * Client-safe read: static JSON import (no node:fs).
 */
function speechStore(): SpeechEvidenceStore {
  return speechEvidenceJson as SpeechEvidenceStore;
}

export { applySpeechEvidenceOverlay };

/** Merge speech-evidence.json onto a media record (after publish overlay). */
export function mergeCampaignMediaWithSpeechEvidence(media: CampaignMediaRecord): CampaignMediaRecord {
  return applySpeechEvidenceOverlay(media, speechStore().speeches?.[media.id]);
}

export function mergeCampaignMediaWithSpeechEvidenceStore(
  media: CampaignMediaRecord,
  overlay: SpeechEvidenceOverlay | undefined,
): CampaignMediaRecord {
  return applySpeechEvidenceOverlay(media, overlay);
}
