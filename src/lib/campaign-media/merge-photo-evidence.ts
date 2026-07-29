import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import { UNKNOWN } from "@/content/media/campaign-photo-types";
import { loadPhotoEvidenceStore } from "@/lib/campaign-media/evidence-store";
import type { PhotoEvidenceOverlay } from "@/lib/campaign-media/evidence-types";

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

  const notes =
    overlay.whatThisProves?.trim()
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
  const store = loadPhotoEvidenceStore();
  return applyOverlay(photo, store.photos[photo.id]);
}

export function mergeCampaignPhotosWithEvidence(photos: CampaignPhotoRecord[]): CampaignPhotoRecord[] {
  const store = loadPhotoEvidenceStore();
  return photos.map((p) => applyOverlay(p, store.photos[p.id]));
}
