/**
 * File-backed homepage campaign photo curation (Slice 2).
 * Curated IDs stay first; Evidence Workbench homepage candidates append after Save.
 * @see docs/website/HOMEPAGE_PHOTOS_SLICE_2_ERNIE_BRIEF.md
 * @see content/media/strategic-photo-placements.ts
 */

import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import { getCampaignPhotoById, listCampaignPhotos } from "@/content/media/campaign-photo-registry";
import {
  listEvidenceAcrossArkansasPhotos,
  listEvidenceHomepageCandidates,
} from "@/content/media/strategic-photo-placements";

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

const HOMEPAGE_GALLERY_MAX = 12;
const ACROSS_ARKANSAS_MAX = 8;

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

function mergeUnique(
  primary: CampaignPhotoRecord[],
  extras: CampaignPhotoRecord[],
  max: number,
): CampaignPhotoRecord[] {
  const seen = new Set(primary.map((p) => p.id));
  const out = [...primary];
  for (const photo of extras) {
    if (seen.has(photo.id)) continue;
    seen.add(photo.id);
    out.push(photo);
    if (out.length >= max) break;
  }
  return out.slice(0, max);
}

export function listHomepageCampaignPhotos(): CampaignPhotoRecord[] {
  return mergeUnique(
    selectHomepagePhotos(HOMEPAGE_CAMPAIGN_PHOTO_IDS),
    listEvidenceHomepageCandidates(HOMEPAGE_GALLERY_MAX),
    HOMEPAGE_GALLERY_MAX,
  );
}

export function listHomepageAcrossArkansasPhotos(): CampaignPhotoRecord[] {
  return mergeUnique(
    selectHomepagePhotos(HOMEPAGE_ACROSS_ARKANSAS_PHOTO_IDS),
    listEvidenceAcrossArkansasPhotos(ACROSS_ARKANSAS_MAX),
    ACROSS_ARKANSAS_MAX,
  );
}

export type AcrossArkansasPresencePlace = {
  /** Short community label for the quiet presence line */
  label: string;
  county: string;
  kind: "photo" | "video";
};

/**
 * Confirmed places represented on the homepage Across Arkansas band.
 * Photo counties from curated stills; Hot Springs Village from the published trail video.
 * Do not invent places — Unknown stills are omitted.
 */
export function listAcrossArkansasPresencePlaces(): AcrossArkansasPresencePlace[] {
  const places: AcrossArkansasPresencePlace[] = [];
  const seen = new Set<string>();

  for (const photo of listHomepageAcrossArkansasPhotos()) {
    const county = photo.campaign.county;
    if (!county || county === "Unknown") continue;
    const city = photo.campaign.city !== "Unknown" ? photo.campaign.city : null;
    const label = city ? `${city} · ${county} County` : `${county} County`;
    const key = county.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    places.push({ label, county, kind: "photo" });
  }

  // Garland — published Across Arkansas video (no confirmed photo yet)
  if (!seen.has("garland")) {
    places.push({
      label: "Hot Springs Village · Garland County",
      county: "Garland",
      kind: "video",
    });
  }

  return places;
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
export { homepagePhotoCountyHref, homepagePhotoObjectPositionClass } from "@/content/media/homepage-campaign-photo-display";

