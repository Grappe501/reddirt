import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import { UNKNOWN } from "@/content/media/campaign-photo-types";
import type { PhotoEvidenceOverlay, PhotoEvidenceStore } from "@/lib/campaign-media/evidence-types";
import photoEvidenceJson from "../../../data/campaign-media/photo-evidence.json";

/**
 * Client-safe read: static JSON import (no node:fs).
 * Admin writes still go through evidence-store (server-only).
 */
function photoStore(): PhotoEvidenceStore {
  return photoEvidenceJson as PhotoEvidenceStore;
}

function applyOverlay(base: CampaignPhotoRecord, overlay: PhotoEvidenceOverlay | undefined): CampaignPhotoRecord {
  if (!overlay) return base;

  const county = overlay.county?.trim() || base.campaign.county;
  const city = overlay.city?.trim() || base.campaign.city;
  const venue = overlay.venue?.trim() || base.campaign.venue;
  const eventDate = overlay.eventDate?.trim() || base.campaign.eventDate;
  const eventName = overlay.eventName?.trim() || base.campaign.eventName;
  const photographer = overlay.photographer?.trim() || base.campaign.photographer;
  const peopleVisible =
    overlay.peopleVisible && overlay.peopleVisible.length > 0
      ? overlay.peopleVisible.filter((p) => p.trim())
      : base.campaign.peopleVisible;

  const notes = overlay.whatThisProves?.trim()
    ? [base.notes, `Proof: ${overlay.whatThisProves.trim()}`].filter(Boolean).join("\n")
    : base.notes;

  return {
    ...base,
    heroLevel: overlay.heroLevel ?? base.heroLevel,
    publicationStatus: overlay.publicationStatus ?? base.publicationStatus,
    campaign: {
      ...base.campaign,
      county: county || UNKNOWN,
      city: city || UNKNOWN,
      venue: venue || UNKNOWN,
      eventDate: eventDate || UNKNOWN,
      eventName: eventName || UNKNOWN,
      photographer: photographer || UNKNOWN,
      peopleVisible,
      homepageCandidate: overlay.homepageCandidate ?? base.campaign.homepageCandidate,
      featuredPhoto: overlay.featuredPhoto ?? base.campaign.featuredPhoto,
    },
    notes,
    updatedAt: overlay.updatedAt ?? base.updatedAt,
  };
}

/** Merge photo-evidence.json overlay onto a registry record. */
export function mergeCampaignPhotoWithEvidence(photo: CampaignPhotoRecord): CampaignPhotoRecord {
  return applyOverlay(photo, photoStore().photos?.[photo.id]);
}

export function mergeCampaignPhotosWithEvidence(photos: CampaignPhotoRecord[]): CampaignPhotoRecord[] {
  const store = photoStore();
  return photos.map((p) => applyOverlay(p, store.photos?.[p.id]));
}
