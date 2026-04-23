import type { CampaignTrailPhoto } from "@/content/media/campaign-trail-photos";
import { kellymediaWebPicks } from "@/content/media/kellymedia-web-picks.generated";

/**
 * Editorial tags for synced trail stills. The sync script overwrites `campaign-trail-photos.ts`;
 * keep this file updated when new images are mostly animals / farm life (not “with Arkansans” moments).
 */
/** Land / livestock — Forevermost Farms section only (not general “trail” pool). */
const FARM_LIFE_TRAIL_PHOTO_IDS = new Set<string>([
  "016-img-7957",
  "017-img-7958",
  "020-img-7962",
]);

/** LEARNS / education organizing — paired with initiatives-petitions copy, not Forevermost. */
const INITIATIVES_PETITIONS_TRAIL_PHOTO_IDS = ["015-img-7956"] as const;

const FOREVERMOST_ORDER = ["016-img-7957", "017-img-7958", "020-img-7962"] as const;

/**
 * Social templates, UI screenshots, text-heavy composites — not usable as “trail” or “in the field” photography.
 * Reserved story stills (e.g. ballot/education) that are placed manually on Meet Kelly only.
 */
const EXCLUDE_FROM_PEOPLE_TRAIL_IDS = new Set<string>([
  "021-insta-social-sos-teamplate",
  "003-img-6860",
  "015-img-7956",
  /** Reserved for `/understand` only — bridge between “What we’re hearing” and Movement spine. */
  "009-img-7948",
  /** Reserved for `/what-we-believe` — Kelly with organizers and neighbors at the Capitol. */
  "013-img-7954",
]);

/** Handshake / county-room moment — sole editorial still on `/understand`; not in slot rotation. */
export const UNDERSTAND_MOVEMENT_BRIDGE_PHOTO_ID = "009-img-7948" as const;

/** Grassroots crowd at the Capitol — editorial still between commitments and quote on `/what-we-believe`. */
export const WHAT_WE_BELIEVE_CROWD_PHOTO_ID = "013-img-7954" as const;

export function isFarmLifeTrailPhoto(id: string): boolean {
  return FARM_LIFE_TRAIL_PHOTO_IDS.has(id);
}

/** General campaign / trail sections: crowds, events, neighbors — not farm-animal focus. */
export function withoutFarmLifeTrailPhotos(photos: readonly CampaignTrailPhoto[]): CampaignTrailPhoto[] {
  return photos.filter((p) => !FARM_LIFE_TRAIL_PHOTO_IDS.has(p.id));
}

/** Use beside Forevermost Farms / farm copy only. */
export function onlyFarmLifeTrailPhotos(photos: readonly CampaignTrailPhoto[]): CampaignTrailPhoto[] {
  return photos.filter((p) => FARM_LIFE_TRAIL_PHOTO_IDS.has(p.id));
}

/** Ordered stills for the Forevermost block (full-width stack). */
export function forevermostFarmTrailPhotos(photos: readonly CampaignTrailPhoto[]): CampaignTrailPhoto[] {
  const rank = new Map<string, number>(FOREVERMOST_ORDER.map((id, i) => [id, i]));
  return photos
    .filter((p) => rank.has(p.id))
    .sort((a, b) => (rank.get(a.id)! - rank.get(b.id)!));
}

/** LEARNS / petition / education rally imagery — initiatives section on Meet Kelly. */
export function initiativesPetitionTrailPhotos(photos: readonly CampaignTrailPhoto[]): CampaignTrailPhoto[] {
  const want = new Set<string>(INITIATIVES_PETITIONS_TRAIL_PHOTO_IDS);
  return photos.filter((p) => want.has(p.id));
}

/**
 * People/events/trail contexts: no farm-animal focus, no template graphics.
 * Pair with `trailPhotosForSlot` so each page draws a non-overlapping slice as the library grows.
 */
export function peopleTrailPool(photos: readonly CampaignTrailPhoto[]): CampaignTrailPhoto[] {
  const base = withoutFarmLifeTrailPhotos(photos).filter((p) => !EXCLUDE_FROM_PEOPLE_TRAIL_IDS.has(p.id));
  const fromKellymedia: CampaignTrailPhoto[] = kellymediaWebPicks.map((p) => ({
    id: p.id,
    src: p.src,
    alt: p.alt,
  }));
  return [...fromKellymedia, ...base];
}
