import "server-only";

import {
  HOMEPAGE_ACROSS_ARKANSAS_PHOTO_IDS,
  HOMEPAGE_CAMPAIGN_PHOTO_IDS,
  HOMEPAGE_HERO_PHOTO_ID,
  HOMEPAGE_MEET_KELLY_PHOTO_ID,
} from "@/content/media/homepage-campaign-photos";
import {
  HOMEPAGE_ACROSS_ARKANSAS_VIDEO_ID,
  HOMEPAGE_PRIMARY_MESSAGE_VIDEO_ID,
} from "@/content/media/homepage-campaign-videos";
import {
  buildCountyAlbums,
  getCountyAlbumBySlug,
  isAlbumEligible,
  listCountyAlbumSlugs,
  type CountyAlbum,
} from "@/lib/campaign-media/county-albums";
import { listCampaignPhotosLive } from "@/lib/campaign-media/list-campaign-photos-live";
import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";

export function listCountyAlbumsLive(): CountyAlbum[] {
  return buildCountyAlbums(listCampaignPhotosLive());
}

export function getCountyAlbumBySlugLive(countySlug: string): CountyAlbum | null {
  return getCountyAlbumBySlug(countySlug, listCampaignPhotosLive());
}

export function listCountyAlbumSlugsLive(): string[] {
  return listCountyAlbumSlugs(listCampaignPhotosLive());
}

export function photoPublicSurfacesPreview(photo: CampaignPhotoRecord): string[] {
  const surfaces: string[] = [];
  const countyOk =
    Boolean(photo.campaign.county?.trim()) && photo.campaign.county !== "Unknown";
  const denied = photo.campaign.approvedForPublic === false;

  if (denied) {
    return ["Held off public surfaces (Approved for public unchecked)"];
  }
  if (photo.id === HOMEPAGE_MEET_KELLY_PHOTO_ID) {
    surfaces.push("Meet Kelly (curated live)");
  }
  if (photo.id === HOMEPAGE_HERO_PHOTO_ID) {
    surfaces.push("Trust-funnel hero (curated live)");
  }
  if ((HOMEPAGE_CAMPAIGN_PHOTO_IDS as readonly string[]).includes(photo.id)) {
    surfaces.push("Homepage gallery (curated live)");
  } else if (
    photo.campaign.homepageCandidate &&
    (photo.heroLevel === "FEATURE" || photo.heroLevel === "HERO")
  ) {
    surfaces.push("Homepage gallery (candidate)");
  }
  if ((HOMEPAGE_ACROSS_ARKANSAS_PHOTO_IDS as readonly string[]).includes(photo.id)) {
    surfaces.push("Across Arkansas / Journey (curated live)");
  } else if (countyOk && photo.campaign.homepageCandidate) {
    surfaces.push("Across Arkansas / Journey (candidate)");
  }
  if (countyOk && isAlbumEligible(photo)) {
    surfaces.push("County albums /campaign-photos");
    surfaces.push("From the Road county strip");
  }
  if (surfaces.length === 0) {
    surfaces.push(
      "Not on public surfaces yet — confirm county; FEATURE stills with geo appear on albums unless held",
    );
  }
  return surfaces;
}

/** Read-only Kelly Speaks / homepage video surface preview. */
export function speechPublicSurfacesPreview(input: {
  speechId: string;
  approvedForPublic?: boolean;
  homepageCandidate?: boolean;
  counties?: string[];
}): string[] {
  const surfaces: string[] = [];
  const id = String(input.speechId ?? "").trim();
  if (!id) return ["No speech selected"];
  if (input.approvedForPublic === false) {
    return ["Held off public surfaces (Approved for public unchecked)"];
  }
  if (id === HOMEPAGE_PRIMARY_MESSAGE_VIDEO_ID) {
    surfaces.push("Homepage primary message (curated live)");
  }
  if (id === HOMEPAGE_ACROSS_ARKANSAS_VIDEO_ID) {
    surfaces.push("Homepage Across Arkansas video (curated live)");
  }
  surfaces.push("Kelly Speaks (/kelly-speaks) when published + eligible");
  if (input.homepageCandidate) surfaces.push("Homepage video candidate flag");
  const counties = (input.counties ?? []).filter((c) => c && c !== "Unknown");
  if (!counties.length) surfaces.push("Needs confirmed county before honest publish");
  return surfaces;
}
