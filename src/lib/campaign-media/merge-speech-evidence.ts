import type { CampaignMediaRecord } from "@/content/media/campaign-media-types";
import { loadSpeechEvidenceStore } from "@/lib/campaign-media/evidence-store";
import type { SpeechEvidenceOverlay } from "@/lib/campaign-media/evidence-types";

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
  const store = loadSpeechEvidenceStore();
  return applyOverlay(media, store.speeches[media.id]);
}
