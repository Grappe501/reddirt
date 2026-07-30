/**
 * Score a campaign photo against live website surfaces.
 * Proposals only — never invents geography; Unknown blocks geo surfaces.
 */

import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import type { PhotoEvidenceOverlay } from "@/lib/campaign-media/evidence-types";
import { applyPhotoEvidenceOverlay } from "@/lib/campaign-media/apply-evidence-overlay";
import {
  albumEligiblePreview,
  type WebsiteSurfaceId,
  type WebsiteSurfaceInventory,
} from "@/lib/campaign-media/website-surface-catalog";

export type FitRecommendedFlags = {
  homepageCandidate?: boolean;
  featuredPhoto?: boolean;
  heroLevel?: "HERO" | "FEATURE" | "SUPPORTING" | "UNREVIEWED";
  tierIntent?: "Gold" | "Silver" | "Archive" | "";
  approvedForPublic?: boolean;
  publicationStatus?: "DRAFT" | "IN_REVIEW" | "APPROVED" | "PUBLISHED";
};

export type WebsiteFitRecommendation = {
  surface: WebsiteSurfaceId;
  score: number;
  ready: boolean;
  recommendedFlags: FitRecommendedFlags;
  rationale: string;
  blockers: string[];
};

export type WebsiteFitResult = {
  photoId: string;
  rankings: WebsiteFitRecommendation[];
  best: WebsiteFitRecommendation | null;
  inventoryNote: string;
};

function confirmedCounty(photo: CampaignPhotoRecord): boolean {
  const c = photo.campaign.county?.trim();
  return Boolean(c && c !== "Unknown");
}

function journeyVerb(proof: string): boolean {
  return /\b(listened|learned|visited|spoke|engaged|met|worked|traveled)\b/i.test(proof);
}

function mergeHypothetical(
  base: CampaignPhotoRecord,
  proposed?: PhotoEvidenceOverlay | null,
): CampaignPhotoRecord {
  if (!proposed) return base;
  return applyPhotoEvidenceOverlay(base, proposed);
}

function scoreSurface(
  surface: WebsiteSurfaceId,
  photo: CampaignPhotoRecord,
  inventory: WebsiteSurfaceInventory,
): WebsiteFitRecommendation {
  const blockers: string[] = [];
  const countyOk = confirmedCounty(photo);
  const proof = (photo.campaign as { whatThisProves?: string }).whatThisProves ?? "";
  // whatThisProves lives on overlay merge — check notes/caption too
  const proves =
    String((photo as CampaignPhotoRecord & { whatThisProves?: string }).whatThisProves ?? "") ||
    photo.notes ||
    photo.accessibility.caption ||
    "";

  let score = 0;
  const flags: FitRecommendedFlags = {};

  if (photo.campaign.approvedForPublic === false) {
    blockers.push("Held off public (Approved unchecked).");
  }

  switch (surface) {
    case "homepageGallery": {
      if (!countyOk) blockers.push("County Unknown — confirm before homepage.");
      if (inventory.curatedHomepageIds.includes(photo.id)) {
        score += 25;
        flags.homepageCandidate = true;
        flags.heroLevel = photo.heroLevel === "HERO" ? "HERO" : "FEATURE";
        flags.tierIntent = "Gold";
      }
      if (photo.campaign.featuredPhoto) score += 20;
      if (photo.heroLevel === "HERO") score += 25;
      if (photo.heroLevel === "FEATURE") score += 15;
      if (countyOk) score += 15;
      if (journeyVerb(proves || proof)) score += 10;
      if (inventory.homepageGalleryLive < 8) score += 10;
      if (inventory.homepageGalleryLive >= 12) score -= 5;
      flags.homepageCandidate = true;
      flags.heroLevel = flags.heroLevel ?? "FEATURE";
      flags.tierIntent = flags.tierIntent ?? (score >= 55 ? "Gold" : "Silver");
      flags.approvedForPublic = true;
      flags.publicationStatus = "APPROVED";
      if (!countyOk) score = Math.min(score, 35);
      break;
    }
    case "acrossArkansas":
    case "journey": {
      if (!countyOk) blockers.push("Confirmed county required for Across Arkansas / Journey.");
      else {
        score += 25;
        if (!inventory.countiesWithAlbums.includes(photo.campaign.county!)) score += 15;
        if (inventory.thinCounties.includes(photo.campaign.county!)) score += 10;
      }
      if (journeyVerb(proves || proof)) score += 15;
      if (inventory.acrossArkansasLive < 6) score += 10;
      flags.homepageCandidate = true;
      flags.heroLevel = "FEATURE";
      flags.tierIntent = "Silver";
      flags.approvedForPublic = true;
      flags.publicationStatus = "APPROVED";
      break;
    }
    case "countyAlbums": {
      if (!countyOk) blockers.push("Confirmed county required for county albums.");
      else {
        score += 40;
        if (inventory.thinCounties.includes(photo.campaign.county!)) score += 20;
        if (!inventory.countiesWithAlbums.includes(photo.campaign.county!)) score += 25;
      }
      flags.approvedForPublic = true;
      flags.publicationStatus = "APPROVED";
      flags.tierIntent = "Silver";
      if (albumEligiblePreview(photo) && countyOk) score += 10;
      break;
    }
    case "fromTheRoad": {
      if (!countyOk) blockers.push("Confirmed county required for From the Road covers.");
      else {
        score += 30;
        if (photo.campaign.featuredPhoto || photo.heroLevel === "FEATURE" || photo.heroLevel === "HERO") {
          score += 20;
        }
        if (inventory.fromTheRoadCovers < 12) score += 10;
      }
      flags.featuredPhoto = true;
      flags.heroLevel = "FEATURE";
      flags.approvedForPublic = true;
      flags.publicationStatus = "APPROVED";
      break;
    }
    case "meetKelly": {
      if (!countyOk) blockers.push("Prefer confirmed county for Meet Kelly.");
      const people = photo.campaign.peopleVisible?.length ?? 0;
      if (people > 0) score += 20;
      if (photo.heroLevel === "FEATURE" || photo.heroLevel === "HERO") score += 15;
      if (countyOk) score += 15;
      score += 5; // always a soft suggestion path
      flags.homepageCandidate = true;
      flags.heroLevel = "FEATURE";
      flags.tierIntent = "Gold";
      blockers.push("Meet Kelly ID is curated — apply flags only; ID change needs operator.");
      break;
    }
    case "hero": {
      score = photo.heroLevel === "HERO" ? 40 : 10;
      flags.heroLevel = "HERO";
      flags.homepageCandidate = true;
      flags.tierIntent = "Gold";
      blockers.push("Hero still is null by doctrine until a Gold still is human-selected.");
      break;
    }
    case "kellySpeaks": {
      score = 5;
      blockers.push("Photo still — use Videos / Video Prep for Kelly Speaks collections.");
      break;
    }
    default:
      blockers.push("Unknown surface.");
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const ready = blockers.filter((b) => !b.includes("Meet Kelly") && !b.includes("Hero still")).length === 0 && score >= 40;

  const rationaleParts = [
    `${surface} score ${score}/100`,
    countyOk ? `county ${photo.campaign.county}` : "county Unknown",
    inventory.thinCounties.includes(photo.campaign.county ?? "")
      ? "fills thin county album"
      : null,
  ].filter(Boolean);

  return {
    surface,
    score,
    ready,
    recommendedFlags: flags,
    rationale: rationaleParts.join(" · "),
    blockers,
  };
}

const RANK_ORDER: WebsiteSurfaceId[] = [
  "countyAlbums",
  "fromTheRoad",
  "acrossArkansas",
  "journey",
  "homepageGallery",
  "meetKelly",
  "hero",
  "kellySpeaks",
];

export function scorePhotoWebsiteFit(input: {
  photo: CampaignPhotoRecord;
  proposedOverlay?: PhotoEvidenceOverlay | null;
  inventory: WebsiteSurfaceInventory;
}): WebsiteFitResult {
  const merged = mergeHypothetical(input.photo, input.proposedOverlay);
  // Attach whatThisProves from overlay onto a soft field for journey verb check
  const withProof = {
    ...merged,
    whatThisProves: input.proposedOverlay?.whatThisProves,
  } as CampaignPhotoRecord & { whatThisProves?: string };

  const rankings = RANK_ORDER.map((surface) =>
    scoreSurface(surface, withProof, input.inventory),
  ).sort((a, b) => b.score - a.score || a.surface.localeCompare(b.surface));

  const best = rankings.find((r) => r.score >= 30 && r.surface !== "kellySpeaks") ?? rankings[0] ?? null;

  return {
    photoId: input.photo.id,
    rankings,
    best,
    inventoryNote: `Live inventory: ${input.inventory.homepageGalleryLive} homepage · ${input.inventory.countyAlbumCount} county albums · ${input.inventory.unknownCountyCount} unknown county`,
  };
}
