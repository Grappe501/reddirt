/**
 * Pure overlay apply — no fs / no static JSON (safe for client + server).
 */

import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import { UNKNOWN } from "@/content/media/campaign-photo-types";
import type { CampaignMediaRecord } from "@/content/media/campaign-media-types";
import type { PhotoEvidenceOverlay, SpeechEvidenceOverlay } from "@/lib/campaign-media/evidence-types";

function safePublicSrcOverride(photoId: string, override: string | undefined): string | null {
  const s = String(override ?? "").trim();
  if (!s) return null;
  const prefix = `/media/campaign-derivatives/${photoId}/`;
  if (!s.startsWith(prefix)) return null;
  if (s.includes("..") || s.includes("//")) return null;
  return s;
}

export function applyPhotoEvidenceOverlay(
  base: CampaignPhotoRecord,
  overlay: PhotoEvidenceOverlay | undefined,
): CampaignPhotoRecord {
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

  const srcOverride = safePublicSrcOverride(base.id, overlay.publicSrcOverride);

  return {
    ...base,
    src: srcOverride ?? base.src,
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
      approvedForPublic:
        overlay.approvedForPublic !== undefined
          ? overlay.approvedForPublic
          : base.campaign.approvedForPublic,
    },
    notes,
    updatedAt: overlay.updatedAt ?? base.updatedAt,
  };
}

export function applySpeechEvidenceOverlay(
  base: CampaignMediaRecord,
  overlay: SpeechEvidenceOverlay | undefined,
): CampaignMediaRecord {
  if (!overlay) return base;
  const counties =
    overlay.counties && overlay.counties.length > 0
      ? overlay.counties.map((c) => c.trim()).filter(Boolean)
      : base.counties;
  const description = overlay.whatThisProves?.trim()
    ? `${base.description}\n\nProof: ${overlay.whatThisProves.trim()}`
    : base.description;
  return {
    ...base,
    counties,
    description,
    publicationStatus: overlay.publicationStatus ?? base.publicationStatus,
    homepageEligible:
      overlay.homepageCandidate !== undefined
        ? Boolean(overlay.homepageCandidate)
        : base.homepageEligible,
    approvedForPublic:
      overlay.approvedForPublic !== undefined
        ? Boolean(overlay.approvedForPublic)
        : base.approvedForPublic,
  };
}
