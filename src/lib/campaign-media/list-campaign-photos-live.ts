import "server-only";

import { CAMPAIGN_PHOTO_REGISTRY } from "@/content/media/campaign-photo-registry";
import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import { applyPhotoEvidenceOverlay } from "@/lib/campaign-media/apply-evidence-overlay";
import { loadPhotoEvidenceStore, loadPhotoIngestDrafts } from "@/lib/campaign-media/evidence-store";
import type { PhotoEvidenceStore } from "@/lib/campaign-media/evidence-types";

/**
 * Fresh merge from disk (not webpack static JSON). Use on RSC / admin / album refresh.
 */
export function listCampaignPhotosLive(store?: PhotoEvidenceStore): CampaignPhotoRecord[] {
  const evidence = store ?? loadPhotoEvidenceStore();
  const drafts = loadPhotoIngestDrafts();
  const byId = new Map<string, CampaignPhotoRecord>();
  for (const p of CAMPAIGN_PHOTO_REGISTRY) {
    byId.set(p.id, p);
  }
  for (const d of drafts.photos) {
    if (!byId.has(d.id)) byId.set(d.id, d);
  }
  return Array.from(byId.values()).map((p) => applyPhotoEvidenceOverlay(p, evidence.photos?.[p.id]));
}

export function getCampaignPhotoByIdLive(
  id: string,
  store?: PhotoEvidenceStore,
): CampaignPhotoRecord | null {
  const evidence = store ?? loadPhotoEvidenceStore();
  const drafts = loadPhotoIngestDrafts();
  const base =
    CAMPAIGN_PHOTO_REGISTRY.find((p) => p.id === id) ?? drafts.photos.find((p) => p.id === id) ?? null;
  if (!base) return null;
  return applyPhotoEvidenceOverlay(base, evidence.photos?.[id]);
}
