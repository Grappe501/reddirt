import "server-only";

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
  if (photo.campaign.homepageCandidate && (photo.heroLevel === "FEATURE" || photo.heroLevel === "HERO")) {
    surfaces.push("Homepage gallery (candidate)");
  }
  if (countyOk && isAlbumEligible(photo)) {
    surfaces.push("County albums /campaign-photos");
    surfaces.push("From the Road county strip");
  }
  if (countyOk && photo.campaign.homepageCandidate) {
    surfaces.push("Across Arkansas / Journey");
  }
  if (surfaces.length === 0) {
    surfaces.push("Not on public surfaces yet — confirm county; FEATURE stills with geo appear on albums unless held");
  }
  return surfaces;
}
