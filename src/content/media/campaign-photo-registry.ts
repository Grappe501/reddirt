/**
 * Canonical file-backed campaign photo registry (launch-first).
 * Do not invent counties, events, or people — use "Unknown" until confirmed.
 *
 * Existing trail stills remain in `campaign-trail-photos.ts` until individually
 * promoted here with real captions/alt/county metadata.
 */

import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";

/**
 * Structured photo assets ready for county pages / Journey / Meet Kelly.
 * Empty until Steve uploads and we register each image.
 */
export const CAMPAIGN_PHOTO_REGISTRY: CampaignPhotoRecord[] = [];

export function listCampaignPhotos(): CampaignPhotoRecord[] {
  return CAMPAIGN_PHOTO_REGISTRY;
}

export function listPublishedCampaignPhotos(): CampaignPhotoRecord[] {
  return CAMPAIGN_PHOTO_REGISTRY.filter((p) => p.publicationStatus === "PUBLISHED");
}

export function getCampaignPhotoById(id: string): CampaignPhotoRecord | null {
  return CAMPAIGN_PHOTO_REGISTRY.find((p) => p.id === id) ?? null;
}

export function listCampaignPhotosByCounty(county: string): CampaignPhotoRecord[] {
  const c = county.trim().toLowerCase();
  if (!c) return [];
  return CAMPAIGN_PHOTO_REGISTRY.filter((p) => {
    if (p.campaign.county === "Unknown") return false;
    return p.campaign.county.toLowerCase() === c || p.campaign.county.toLowerCase().includes(c);
  });
}

export function listHeroCandidates(): CampaignPhotoRecord[] {
  return CAMPAIGN_PHOTO_REGISTRY.filter(
    (p) => p.heroLevel === "HERO" && (p.publicationStatus === "APPROVED" || p.publicationStatus === "PUBLISHED"),
  );
}

export function assertCampaignPhotoRegistryInvariants(
  records: CampaignPhotoRecord[] = CAMPAIGN_PHOTO_REGISTRY,
): void {
  const ids = new Set<string>();
  for (const p of records) {
    if (ids.has(p.id)) throw new Error(`Duplicate photo id: ${p.id}`);
    ids.add(p.id);
    if (!p.src.trim()) throw new Error(`Photo missing src: ${p.id}`);
    if (p.publicationStatus === "PUBLISHED") {
      if (!p.accessibility.altText.trim()) throw new Error(`Published photo missing alt: ${p.id}`);
      if (!p.accessibility.caption.trim()) throw new Error(`Published photo missing caption: ${p.id}`);
    }
    if (p.campaign.peopleVisible.some((name) => !name.trim())) {
      throw new Error(`Empty peopleVisible entry: ${p.id}`);
    }
  }
}
