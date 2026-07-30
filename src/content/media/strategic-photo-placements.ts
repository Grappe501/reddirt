/**
 * Strategic public placement for confirmed campaign photos.
 * Evidence Workbench flags drive where stills appear — never invent geography.
 *
 * Server-only consumers: pass photos from listCampaignPhotosLive for freshness.
 */

import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import { buildCountyAlbums, isAlbumEligible } from "@/lib/campaign-media/county-albums";

export type StrategicPhotoSurface =
  | "homepageGallery"
  | "acrossArkansas"
  | "meetKelly"
  | "journey"
  | "fromTheRoad"
  | "countyAlbums";

function hasConfirmedCounty(photo: CampaignPhotoRecord): boolean {
  const c = photo.campaign.county?.trim();
  return Boolean(c && c !== "Unknown");
}

function isPublicApproved(photo: CampaignPhotoRecord): boolean {
  if (photo.campaign.approvedForPublic === false) return false;
  if (photo.publicationStatus === "PUBLISHED" || photo.publicationStatus === "APPROVED") return true;
  return photo.campaign.approvedForPublic === true;
}

function isHomepageEligible(photo: CampaignPhotoRecord): boolean {
  if (photo.publicationStatus === "ARCHIVED") return false;
  if (photo.campaign.approvedForPublic === false) return false;
  if (photo.heroLevel !== "FEATURE" && photo.heroLevel !== "HERO") return false;
  if (!photo.campaign.homepageCandidate) return false;
  return isPublicApproved(photo);
}

function isPublicTrailEligible(photo: CampaignPhotoRecord): boolean {
  return isAlbumEligible(photo);
}

function scoreForHomepage(photo: CampaignPhotoRecord): number {
  let s = 0;
  if (photo.campaign.featuredPhoto) s += 40;
  if (photo.heroLevel === "HERO") s += 30;
  if (photo.heroLevel === "FEATURE") s += 20;
  if (hasConfirmedCounty(photo)) s += 10;
  if (photo.publicationStatus === "PUBLISHED") s += 5;
  if (photo.campaign.approvedForPublic) s += 5;
  return s;
}

export function listEvidenceHomepageCandidatesFrom(
  photos: CampaignPhotoRecord[],
  limit = 12,
): CampaignPhotoRecord[] {
  return photos
    .filter(isHomepageEligible)
    .sort((a, b) => scoreForHomepage(b) - scoreForHomepage(a) || a.id.localeCompare(b.id))
    .slice(0, limit);
}

export function listEvidenceAcrossArkansasPhotosFrom(
  photos: CampaignPhotoRecord[],
  limit = 8,
): CampaignPhotoRecord[] {
  return photos
    .filter((p) => isHomepageEligible(p) && hasConfirmedCounty(p))
    .sort((a, b) => scoreForHomepage(b) - scoreForHomepage(a) || a.id.localeCompare(b.id))
    .slice(0, limit);
}

export function listCountyAlbumCoverPhotosFrom(
  photos: CampaignPhotoRecord[],
  limit = 24,
): CampaignPhotoRecord[] {
  return buildCountyAlbums(photos)
    .map((a) => a.cover)
    .slice(0, limit);
}

export function listStrategicFromTheRoadPhotosFrom(
  photos: CampaignPhotoRecord[],
  limit = 48,
): CampaignPhotoRecord[] {
  const covers = listCountyAlbumCoverPhotosFrom(photos, limit);
  const seen = new Set(covers.map((p) => p.id));
  const extra = photos
    .filter(isPublicTrailEligible)
    .filter((p) => !seen.has(p.id))
    .sort((a, b) => scoreForHomepage(b) - scoreForHomepage(a) || a.id.localeCompare(b.id));
  return [...covers, ...extra].slice(0, limit);
}

export function strategicPlacementNotes(): { surface: StrategicPhotoSurface; how: string }[] {
  return [
    {
      surface: "homepageGallery",
      how: "Homepage candidate + FEATURE/HERO + Approved for public (or APPROVED/PUBLISHED) → `/` gallery.",
    },
    {
      surface: "acrossArkansas",
      how: "Same as homepage with confirmed county → Across Arkansas + `/about/journey`.",
    },
    {
      surface: "meetKelly",
      how: "Curated Meet Kelly still, or promote a strong FEATURE with confirmed county as homepage candidate.",
    },
    {
      surface: "countyAlbums",
      how: "Confirmed county + not blocked. Check Approved for public (or APPROVED/PUBLISHED). Explicitly uncheck Approved to hold a still off albums.",
    },
    {
      surface: "fromTheRoad",
      how: "County album covers appear on `/from-the-road` after Save / Rebuild folders.",
    },
    {
      surface: "journey",
      how: "Across Arkansas evidence set powers `/about/journey` stills beside the trail video.",
    },
  ];
}
