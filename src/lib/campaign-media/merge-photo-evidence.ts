import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import { UNKNOWN } from "@/content/media/campaign-photo-types";
import type { PhotoEvidenceOverlay, PhotoEvidenceStore } from "@/lib/campaign-media/evidence-types";
import { applyPhotoEvidenceOverlay } from "@/lib/campaign-media/apply-evidence-overlay";
import photoEvidenceJson from "../../../data/campaign-media/photo-evidence.json";

/**
 * Client-safe read: static JSON import (no node:fs).
 * Server/admin/album paths must use listCampaignPhotosLive (fs) instead.
 */
function photoStoreStatic(): PhotoEvidenceStore {
  return photoEvidenceJson as PhotoEvidenceStore;
}

export { applyPhotoEvidenceOverlay };

/** Merge photo-evidence.json overlay onto a registry record (static / client-safe). */
export function mergeCampaignPhotoWithEvidence(photo: CampaignPhotoRecord): CampaignPhotoRecord {
  return applyPhotoEvidenceOverlay(photo, photoStoreStatic().photos?.[photo.id]);
}

export function mergeCampaignPhotosWithEvidence(photos: CampaignPhotoRecord[]): CampaignPhotoRecord[] {
  const store = photoStoreStatic();
  return photos.map((p) => applyPhotoEvidenceOverlay(p, store.photos?.[p.id]));
}

export function mergeCampaignPhotosWithEvidenceStore(
  photos: CampaignPhotoRecord[],
  store: PhotoEvidenceStore,
): CampaignPhotoRecord[] {
  return photos.map((p) => applyPhotoEvidenceOverlay(p, store.photos?.[p.id]));
}

export function mergeCampaignPhotoWithEvidenceStore(
  photo: CampaignPhotoRecord,
  overlay: PhotoEvidenceOverlay | undefined,
): CampaignPhotoRecord {
  return applyPhotoEvidenceOverlay(photo, overlay);
}

/** @deprecated use UNKNOWN from campaign-photo-types */
export { UNKNOWN };
