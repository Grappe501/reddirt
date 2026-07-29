/**
 * County → event photo albums from confirmed campaign photo geography.
 * Unknown county never appears. Event Unknown groups as "Open trail".
 */

import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import { listCampaignPhotos } from "@/content/media/campaign-photo-registry";
import { resolveRegistryCountyFromLabel } from "@/lib/county/resolve-county-label";

export type CountyAlbumEvent = {
  /** Stable slug within the county */
  eventSlug: string;
  /** Display title */
  eventName: string;
  city: string | null;
  photos: CampaignPhotoRecord[];
};

export type CountyAlbum = {
  countySlug: string;
  countyDisplayName: string;
  shortName: string;
  photoCount: number;
  eventCount: number;
  cover: CampaignPhotoRecord;
  events: CountyAlbumEvent[];
};

function slugifyEvent(name: string): string {
  const s = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
  return s || "open-trail";
}

function isConfirmedGeo(photo: CampaignPhotoRecord): boolean {
  const county = photo.campaign.county?.trim();
  return Boolean(county && county !== "Unknown");
}

/** Photos approved for public album surfaces (or FEATURE homepage candidates). */
function isAlbumEligible(photo: CampaignPhotoRecord): boolean {
  if (!isConfirmedGeo(photo)) return false;
  if (photo.publicationStatus === "ARCHIVED") return false;
  // Prefer explicit public approval from overlay/registry; allow FEATURE homepage candidates too
  if (photo.publicationStatus === "PUBLISHED" || photo.publicationStatus === "APPROVED") return true;
  if (photo.campaign.homepageCandidate || photo.campaign.featuredPhoto) return true;
  if (photo.heroLevel === "FEATURE" || photo.heroLevel === "HERO") return true;
  return false;
}

export function buildCountyAlbums(photos: CampaignPhotoRecord[] = listCampaignPhotos()): CountyAlbum[] {
  const byCounty = new Map<
    string,
    {
      countySlug: string;
      countyDisplayName: string;
      shortName: string;
      events: Map<string, CountyAlbumEvent>;
    }
  >();

  for (const photo of photos) {
    if (!isAlbumEligible(photo)) continue;
    const reg = resolveRegistryCountyFromLabel(photo.campaign.county);
    if (!reg) continue;

    const countySlug = reg.slug;
    let bucket = byCounty.get(countySlug);
    if (!bucket) {
      bucket = {
        countySlug,
        countyDisplayName: reg.displayName,
        shortName: reg.displayName.replace(/\s+County$/i, ""),
        events: new Map(),
      };
      byCounty.set(countySlug, bucket);
    }

    const rawEvent = photo.campaign.eventName?.trim();
    const eventName = !rawEvent || rawEvent === "Unknown" ? "Open trail" : rawEvent;
    const eventSlug = slugifyEvent(eventName);
    let ev = bucket.events.get(eventSlug);
    if (!ev) {
      ev = {
        eventSlug,
        eventName,
        city:
          photo.campaign.city && photo.campaign.city !== "Unknown" ? photo.campaign.city : null,
        photos: [],
      };
      bucket.events.set(eventSlug, ev);
    } else if (!ev.city && photo.campaign.city && photo.campaign.city !== "Unknown") {
      ev.city = photo.campaign.city;
    }
    ev.photos.push(photo);
  }

  const albums: CountyAlbum[] = [];
  for (const bucket of byCounty.values()) {
    const events = Array.from(bucket.events.values())
      .map((e) => ({
        ...e,
        photos: e.photos.sort((a, b) => a.campaign.eventDate.localeCompare(b.campaign.eventDate)),
      }))
      .sort((a, b) => b.photos.length - a.photos.length || a.eventName.localeCompare(b.eventName));

    const allPhotos = events.flatMap((e) => e.photos);
    if (allPhotos.length === 0) continue;
    const cover =
      allPhotos.find((p) => p.campaign.featuredPhoto || p.heroLevel === "FEATURE") ?? allPhotos[0];

    albums.push({
      countySlug: bucket.countySlug,
      countyDisplayName: bucket.countyDisplayName,
      shortName: bucket.shortName,
      photoCount: allPhotos.length,
      eventCount: events.length,
      cover,
      events,
    });
  }

  return albums.sort((a, b) => b.photoCount - a.photoCount || a.shortName.localeCompare(b.shortName));
}

export function getCountyAlbumBySlug(countySlug: string): CountyAlbum | null {
  const raw = countySlug.trim().toLowerCase().replace(/\/$/, "");
  const variants = [raw, raw.replace(/-county$/, ""), `${raw.replace(/-county$/, "")}-county`];
  const albums = buildCountyAlbums();
  for (const v of variants) {
    const hit = albums.find((a) => a.countySlug === v);
    if (hit) return hit;
  }
  return null;
}

export function listCountyAlbumSlugs(): string[] {
  return buildCountyAlbums().map((a) => a.countySlug);
}

/** Relative folder path for materializing county/event albums on disk. */
export function countyAlbumFolderRel(countySlug: string, eventSlug: string): string {
  return `public/media/county-albums/${countySlug}/${eventSlug}`;
}
