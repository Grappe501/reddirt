/**
 * Website surface catalog for Turbo Ingest fit scoring.
 * Mirrors the selectors RSC pages actually use — not HTML scraping.
 */

import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import {
  HOMEPAGE_ACROSS_ARKANSAS_PHOTO_IDS,
  HOMEPAGE_CAMPAIGN_PHOTO_IDS,
  HOMEPAGE_HERO_PHOTO_ID,
  HOMEPAGE_MEET_KELLY_PHOTO_ID,
} from "@/content/media/homepage-campaign-photos";
import {
  listCountyAlbumCoverPhotosFrom,
  listEvidenceAcrossArkansasPhotosFrom,
  listEvidenceHomepageCandidatesFrom,
  type StrategicPhotoSurface,
} from "@/content/media/strategic-photo-placements";
import { buildCountyAlbums, isAlbumEligible } from "@/lib/campaign-media/county-albums";

export type WebsiteSurfaceId = StrategicPhotoSurface | "hero" | "kellySpeaks";

export type WebsiteSurfaceInventory = {
  updatedAt: string;
  livePhotoCount: number;
  unknownCountyCount: number;
  homepageGalleryLive: number;
  acrossArkansasLive: number;
  countyAlbumCount: number;
  countiesWithAlbums: string[];
  thinCounties: string[];
  fromTheRoadCovers: number;
  curatedHomepageIds: string[];
  curatedAcrossIds: string[];
  meetKellyId: string;
  heroId: string | null;
  surfaces: Array<{
    id: WebsiteSurfaceId;
    label: string;
    how: string;
    filled: number;
    capacityHint: number;
  }>;
};

const SURFACE_COPY: Array<{
  id: WebsiteSurfaceId;
  label: string;
  how: string;
  capacityHint: number;
}> = [
  {
    id: "homepageGallery",
    label: "Homepage gallery",
    how: "homepageCandidate + FEATURE/HERO + approved → `/` Latest Campaign Photos.",
    capacityHint: 12,
  },
  {
    id: "acrossArkansas",
    label: "Across Arkansas",
    how: "Homepage-eligible + confirmed county → homepage Across Arkansas band.",
    capacityHint: 8,
  },
  {
    id: "journey",
    label: "Journey /about/journey",
    how: "Meet Kelly biographical journey page — not the Across Arkansas trail stills.",
    capacityHint: 8,
  },
  {
    id: "countyAlbums",
    label: "County albums",
    how: "Confirmed county + album-eligible → `/campaign-photos`.",
    capacityHint: 75,
  },
  {
    id: "fromTheRoad",
    label: "From the Road",
    how: "County album covers strip on `/from-the-road`.",
    capacityHint: 24,
  },
  {
    id: "meetKelly",
    label: "Meet Kelly",
    how: "Curated Meet Kelly still — proposal only; operator changes ID.",
    capacityHint: 1,
  },
  {
    id: "hero",
    label: "Trust-funnel hero",
    how: "Currently null — HERO proposals need human Gold call.",
    capacityHint: 1,
  },
  {
    id: "kellySpeaks",
    label: "Kelly Speaks (video)",
    how: "Speech registry collections on `/kelly-speaks` — video prep path.",
    capacityHint: 24,
  },
];

export function buildWebsiteSurfaceInventory(photos: CampaignPhotoRecord[]): WebsiteSurfaceInventory {
  const albums = buildCountyAlbums(photos);
  const countiesWithAlbums = albums.map((a) => a.countyDisplayName || a.shortName);
  const thinCounties = albums.filter((a) => a.photoCount < 3).map((a) => a.countyDisplayName || a.shortName);
  const homepageLive = listEvidenceHomepageCandidatesFrom(photos, 24);
  const acrossLive = listEvidenceAcrossArkansasPhotosFrom(photos, 24);
  const covers = listCountyAlbumCoverPhotosFrom(photos, 48);
  const unknownCountyCount = photos.filter(
    (p) => !p.campaign.county?.trim() || p.campaign.county === "Unknown",
  ).length;

  const filledBy: Record<WebsiteSurfaceId, number> = {
    homepageGallery: homepageLive.length,
    acrossArkansas: acrossLive.length,
    journey: acrossLive.length,
    countyAlbums: albums.length,
    fromTheRoad: covers.length,
    meetKelly: HOMEPAGE_MEET_KELLY_PHOTO_ID ? 1 : 0,
    hero: HOMEPAGE_HERO_PHOTO_ID ? 1 : 0,
    kellySpeaks: 0,
  };

  return {
    updatedAt: new Date().toISOString(),
    livePhotoCount: photos.length,
    unknownCountyCount,
    homepageGalleryLive: homepageLive.length,
    acrossArkansasLive: acrossLive.length,
    countyAlbumCount: albums.length,
    countiesWithAlbums,
    thinCounties: thinCounties.slice(0, 20),
    fromTheRoadCovers: covers.length,
    curatedHomepageIds: [...HOMEPAGE_CAMPAIGN_PHOTO_IDS],
    curatedAcrossIds: [...HOMEPAGE_ACROSS_ARKANSAS_PHOTO_IDS],
    meetKellyId: HOMEPAGE_MEET_KELLY_PHOTO_ID,
    heroId: HOMEPAGE_HERO_PHOTO_ID,
    surfaces: SURFACE_COPY.map((s) => ({
      ...s,
      filled: filledBy[s.id] ?? 0,
    })),
  };
}

export function albumEligiblePreview(photo: CampaignPhotoRecord): boolean {
  return isAlbumEligible(photo);
}
