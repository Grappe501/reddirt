/**
 * Strategic public placement for confirmed campaign photos.
 * Evidence Workbench flags drive where stills appear — never invent geography.
 *
 * | Flag / signal                         | Surfaces |
 * |---------------------------------------|----------|
 * | homepageCandidate + FEATURE/HERO      | `/` Latest Campaign Photos, Meet Kelly band |
 * | confirmed county (not Unknown)        | `/campaign-photos`, `/campaign-photos/[county]` |
 * | featuredPhoto / album cover           | County album covers, Across Arkansas band |
 * | approvedForPublic / PUBLISHED         | Albums + From the Road county strip |
 * | curated trail pool (legacy stills)    | aboutStory, getInvolved, priorities, events, … |
 */

import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import { listCampaignPhotos } from "@/content/media/campaign-photo-registry";
import { buildCountyAlbums } from "@/lib/campaign-media/county-albums";

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

function isHomepageEligible(photo: CampaignPhotoRecord): boolean {
  if (photo.publicationStatus === "ARCHIVED") return false;
  if (photo.heroLevel !== "FEATURE" && photo.heroLevel !== "HERO") return false;
  return Boolean(photo.campaign.homepageCandidate);
}

function isPublicTrailEligible(photo: CampaignPhotoRecord): boolean {
  if (!hasConfirmedCounty(photo)) return false;
  if (photo.publicationStatus === "ARCHIVED") return false;
  if (photo.publicationStatus === "PUBLISHED" || photo.publicationStatus === "APPROVED") return true;
  if (photo.campaign.homepageCandidate || photo.campaign.featuredPhoto) return true;
  if (photo.heroLevel === "FEATURE" || photo.heroLevel === "HERO") return true;
  return false;
}

function scoreForHomepage(photo: CampaignPhotoRecord): number {
  let s = 0;
  if (photo.campaign.featuredPhoto) s += 40;
  if (photo.heroLevel === "HERO") s += 30;
  if (photo.heroLevel === "FEATURE") s += 20;
  if (hasConfirmedCounty(photo)) s += 10;
  if (photo.publicationStatus === "PUBLISHED") s += 5;
  return s;
}

/**
 * Evidence-confirmed homepage candidates beyond the static curated ID list.
 * Deduped by id; caller merges with curated order.
 */
export function listEvidenceHomepageCandidates(limit = 12): CampaignPhotoRecord[] {
  return listCampaignPhotos()
    .filter(isHomepageEligible)
    .sort((a, b) => scoreForHomepage(b) - scoreForHomepage(a) || a.id.localeCompare(b.id))
    .slice(0, limit);
}

/** Confirmed-geo stills for Across Arkansas / journey momentum bands. */
export function listEvidenceAcrossArkansasPhotos(limit = 8): CampaignPhotoRecord[] {
  return listCampaignPhotos()
    .filter((p) => isHomepageEligible(p) && hasConfirmedCounty(p))
    .sort((a, b) => scoreForHomepage(b) - scoreForHomepage(a) || a.id.localeCompare(b.id))
    .slice(0, limit);
}

/** County album covers for From the Road and related presence strips. */
export function listCountyAlbumCoverPhotos(limit = 24): CampaignPhotoRecord[] {
  return buildCountyAlbums()
    .map((a) => a.cover)
    .slice(0, limit);
}

/** Broader public trail stills with confirmed county (for From the Road weave-in). */
export function listStrategicFromTheRoadPhotos(limit = 48): CampaignPhotoRecord[] {
  const covers = listCountyAlbumCoverPhotos(limit);
  const seen = new Set(covers.map((p) => p.id));
  const extra = listCampaignPhotos()
    .filter(isPublicTrailEligible)
    .filter((p) => !seen.has(p.id))
    .sort((a, b) => scoreForHomepage(b) - scoreForHomepage(a) || a.id.localeCompare(b.id));
  return [...covers, ...extra].slice(0, limit);
}

export function strategicPlacementNotes(): { surface: StrategicPhotoSurface; how: string }[] {
  return [
    {
      surface: "homepageGallery",
      how: "Mark Homepage candidate + FEATURE/HERO, then Save — still joins `/` Latest Campaign Photos.",
    },
    {
      surface: "acrossArkansas",
      how: "Homepage candidate with confirmed county — Across Arkansas band + `/about/journey`.",
    },
    {
      surface: "meetKelly",
      how: "Curated Meet Kelly still, or promote a strong FEATURE with confirmed county as homepage candidate.",
    },
    {
      surface: "countyAlbums",
      how: "Confirmed county + Approved for public (or FEATURE) — `/campaign-photos` county → event albums.",
    },
    {
      surface: "fromTheRoad",
      how: "County album covers + public trail stills appear on `/from-the-road` after Save / Rebuild folders.",
    },
    {
      surface: "journey",
      how: "Same Across Arkansas evidence set powers `/about/journey` stills beside the trail video.",
    },
  ];
}
