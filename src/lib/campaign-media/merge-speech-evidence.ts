import type { CampaignMediaRecord } from "@/content/media/campaign-media-types";
import type { SpeechEvidenceOverlay, SpeechEvidenceStore } from "@/lib/campaign-media/evidence-types";
import speechEvidenceJson from "../../../data/campaign-media/speech-evidence.json";

/**
 * Client-safe read: static JSON import (no node:fs).
 */
function speechStore(): SpeechEvidenceStore {
  return speechEvidenceJson as SpeechEvidenceStore;
}

function applyOverlay(base: CampaignMediaRecord, overlay: SpeechEvidenceOverlay | undefined): CampaignMediaRecord {
  if (!overlay) return base;
  const counties =
    overlay.counties && overlay.counties.length > 0
      ? overlay.counties.map((c) => c.trim()).filter(Boolean)
      : base.counties;
  return {
    ...base,
    counties,
    description: overlay.whatThisProves?.trim()
      ? `${base.description}\n\nProof: ${overlay.whatThisProves.trim()}`
      : base.description,
  };
}

/** Merge speech-evidence.json onto a media record (after publish overlay). */
export function mergeCampaignMediaWithSpeechEvidence(media: CampaignMediaRecord): CampaignMediaRecord {
  return applyOverlay(media, speechStore().speeches?.[media.id]);
}
