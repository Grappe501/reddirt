import "server-only";

import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import { trailPhotosForSlot } from "@/content/media/campaign-trail-assignments";
import type { CampaignTrailPhoto } from "@/content/media/campaign-trail-photos";
import { listCountyAlbumsLive } from "@/lib/campaign-media/county-albums-live";

/** One still per county, plus the leftover people-trail slice. */
const FROM_THE_ROAD_TOTAL_MAX = 30;

function toTrail(photo: CampaignPhotoRecord): CampaignTrailPhoto {
  const caption = photo.accessibility.caption?.trim();
  return {
    id: photo.id,
    src: photo.src,
    alt: photo.accessibility.altText,
    caption: caption || undefined,
  };
}

/** Prefer a landscape frame when the county has one — reads better in the woven grid. */
function pickCountyStill(photos: CampaignPhotoRecord[]): CampaignPhotoRecord | null {
  if (photos.length === 0) return null;
  return photos.find((p) => (p.basic.width ?? 0) >= (p.basic.height ?? 1)) ?? photos[0];
}

/**
 * From the Road trail gallery: existing people stills, then one photo from each
 * confirmed county album so the section shows Arkansas, not three leftover frames.
 */
export function buildFromTheRoadTrailGallery(): CampaignTrailPhoto[] {
  const trail = trailPhotosForSlot("fromTheRoad", { fromTheRoadMax: 12 });
  const seen = new Set(trail.map((p) => p.src));
  const countyStills: CampaignTrailPhoto[] = [];

  const albums = [...listCountyAlbumsLive()].sort((a, b) => a.shortName.localeCompare(b.shortName));
  for (const album of albums) {
    const pick = pickCountyStill(album.events.flatMap((e) => e.photos));
    if (!pick || seen.has(pick.src)) continue;
    seen.add(pick.src);
    countyStills.push(toTrail(pick));
  }

  return [...trail, ...countyStills].slice(0, FROM_THE_ROAD_TOTAL_MAX);
}
