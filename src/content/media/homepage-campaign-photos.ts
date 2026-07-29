/**
 * File-backed homepage campaign photo curation (Slice 2).
 * Only IDs listed here may surface on `/` as homepage candidates.
 * @see docs/website/HOMEPAGE_PHOTOS_SLICE_2_ERNIE_BRIEF.md
 */

import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import { getCampaignPhotoById, listCampaignPhotos } from "@/content/media/campaign-photo-registry";
import { resolveRegistryCountyFromLabel } from "@/lib/county/resolve-county-label";

/** Ordered curated set for Latest Campaign Photos (6–10 FEATURE stills). */
export const HOMEPAGE_CAMPAIGN_PHOTO_IDS = [
  "afl-cio-pre-event-networking-20260629",
  "mena-polk-meet-greet-20260411",
  "war-memorial-stadium-concourse-20260320",
  "toad-suck-daze-toad-race-20260501",
  "johnson-county-peach-festival-parade-20260718",
  "watermelon-festival-booth-service-20260725",
  "stone-porch-door-conversation-20260301",
  "elks-lodge-breakfast-table-20260228",
] as const;

/**
 * Stills paired with the Kelly Across Arkansas momentum video.
 * Prefer confirmed geography; include labor trail still with Unknown geo only when labeled honestly.
 */
export const HOMEPAGE_ACROSS_ARKANSAS_PHOTO_IDS = [
  "mena-polk-meet-greet-20260411",
  "war-memorial-stadium-concourse-20260320",
  "toad-suck-daze-toad-race-20260501",
  "johnson-county-peach-festival-parade-20260718",
  "watermelon-festival-booth-service-20260725",
] as const;

export type HomepageCampaignPhotoId = (typeof HOMEPAGE_CAMPAIGN_PHOTO_IDS)[number];

/** Meet Kelly preview still — Mena/Polk meet-and-greet improves the concise bio band. */
export const HOMEPAGE_MEET_KELLY_PHOTO_ID: HomepageCampaignPhotoId = "mena-polk-meet-greet-20260411";

/** No curated still meets HERO quality for replacing the trust-funnel hero media. */
export const HOMEPAGE_HERO_PHOTO_ID: HomepageCampaignPhotoId | null = null;

function selectHomepagePhotos(ids: readonly string[]): CampaignPhotoRecord[] {
  const byId = new Map(listCampaignPhotos().map((p) => [p.id, p]));
  const out: CampaignPhotoRecord[] = [];
  for (const id of ids) {
    const photo = byId.get(id);
    if (!photo) continue;
    if (photo.heroLevel !== "FEATURE" && photo.heroLevel !== "HERO") continue;
    if (!photo.campaign.homepageCandidate) continue;
    out.push(photo);
  }
  return out;
}

export function listHomepageCampaignPhotos(): CampaignPhotoRecord[] {
  return selectHomepagePhotos(HOMEPAGE_CAMPAIGN_PHOTO_IDS);
}

export function listHomepageAcrossArkansasPhotos(): CampaignPhotoRecord[] {
  return selectHomepagePhotos(HOMEPAGE_ACROSS_ARKANSAS_PHOTO_IDS);
}

export function getHomepageMeetKellyPhoto(): CampaignPhotoRecord | null {
  const photo = getCampaignPhotoById(HOMEPAGE_MEET_KELLY_PHOTO_ID);
  if (!photo?.campaign.homepageCandidate) return null;
  return photo;
}

export function getHomepageHeroPhoto(): CampaignPhotoRecord | null {
  if (!HOMEPAGE_HERO_PHOTO_ID) return null;
  const photo = getCampaignPhotoById(HOMEPAGE_HERO_PHOTO_ID);
  if (!photo?.campaign.homepageCandidate) return null;
  return photo;
}

/** County pages may link only when county is confirmed (not Unknown). */
export function homepagePhotoCountyHref(photo: CampaignPhotoRecord): string | null {
  const county = photo.campaign.county;
  if (!county || county === "Unknown") return null;
  const reg = resolveRegistryCountyFromLabel(county);
  if (!reg?.slug) return null;
  return `/counties/${reg.slug}`;
}

/**
 * Intentional crop for homepage / gallery cards.
 * Portraits bias slightly toward the upper third (faces / conversation).
 */
export function homepagePhotoObjectPositionClass(photo: CampaignPhotoRecord): string {
  if (photo.basic.orientation === "PORTRAIT") return "object-[50%_20%]";
  if (photo.id.includes("stadium") || photo.id.includes("concourse")) return "object-[50%_35%]";
  return "object-center";
}
