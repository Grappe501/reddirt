/**
 * Propose ordered curated homepage ID diffs (no silent apply).
 */

import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import {
  HOMEPAGE_ACROSS_ARKANSAS_PHOTO_IDS,
  HOMEPAGE_CAMPAIGN_PHOTO_IDS,
  HOMEPAGE_HERO_PHOTO_ID,
  HOMEPAGE_MEET_KELLY_PHOTO_ID,
} from "@/content/media/homepage-campaign-photos";
import { loadPhotoEvidenceStore } from "@/lib/campaign-media/evidence-store";
import { upsertCuratedPlacementProposal } from "@/lib/campaign-media/curated-placement-store";
import type {
  CuratedIdListDiff,
  CuratedPlacementProposal,
} from "@/lib/campaign-media/curated-placement-types";
import { isAlbumEligible } from "@/lib/campaign-media/county-albums";
import { listCampaignPhotosLive } from "@/lib/campaign-media/list-campaign-photos-live";
import { scorePhotoWebsiteFit } from "@/lib/campaign-media/website-fit-scorer";
import { buildWebsiteSurfaceInventory } from "@/lib/campaign-media/website-surface-catalog";

/** Launch Gold seed IDs (from LAUNCH_PHOTOGRAPHY_TIERS) — soft ranking boost only. */
export const GOLD_SEED_PHOTO_IDS = [
  "mena-polk-meet-greet-20260411",
  "war-memorial-stadium-concourse-20260320",
  "toad-suck-daze-toad-race-20260501",
  "johnson-county-peach-festival-parade-20260718",
  "watermelon-festival-booth-service-20260725",
  "afl-cio-pre-event-networking-20260629",
  "stone-porch-door-conversation-20260301",
  "elks-lodge-breakfast-table-20260228",
] as const;

const GALLERY_MAX = 10;
const ACROSS_MAX = 6;

function isUnknown(county: string | undefined | null): boolean {
  const c = String(county ?? "").trim();
  return !c || c === "Unknown";
}

function diffLists(
  surface: CuratedIdListDiff["surface"],
  current: string[],
  proposed: string[],
  rationale: string,
): CuratedIdListDiff {
  const curSet = new Set(current);
  const propSet = new Set(proposed);
  return {
    surface,
    current: [...current],
    proposed: [...proposed],
    added: proposed.filter((id) => !curSet.has(id)),
    removed: current.filter((id) => !propSet.has(id)),
    reordered:
      current.join("|") !== proposed.join("|") &&
      proposed.every((id) => curSet.has(id)) &&
      current.every((id) => propSet.has(id)),
    rationale,
  };
}

function eligibleForCuratedGallery(photo: CampaignPhotoRecord): boolean {
  if (photo.campaign.approvedForPublic === false) return false;
  if (photo.heroLevel !== "FEATURE" && photo.heroLevel !== "HERO") return false;
  // Must be homepage-capable (flag or already curated)
  if (!photo.campaign.homepageCandidate && !HOMEPAGE_CAMPAIGN_PHOTO_IDS.includes(photo.id as never)) {
    // Allow strong album-eligible FEATURE with known county as proposal candidates
    if (!isAlbumEligible(photo) || isUnknown(photo.campaign.county)) return false;
  }
  return true;
}

function rankPhoto(
  photo: CampaignPhotoRecord,
  surface: "homepageGallery" | "acrossArkansas" | "meetKelly" | "hero",
  inventory: ReturnType<typeof buildWebsiteSurfaceInventory>,
  overlayTier: Map<string, string>,
): number {
  const fit = scorePhotoWebsiteFit({
    photo,
    inventory,
  });
  const surfaceRank = fit.rankings.find((r) => r.surface === surface);
  let score = surfaceRank?.score ?? fit.best?.score ?? 0;

  if (GOLD_SEED_PHOTO_IDS.includes(photo.id as (typeof GOLD_SEED_PHOTO_IDS)[number])) score += 18;
  if (overlayTier.get(photo.id) === "Gold") score += 12;
  if (overlayTier.get(photo.id) === "Silver") score += 4;
  if (!isUnknown(photo.campaign.county)) score += 8;
  else score -= 12;
  if (photo.campaign.featuredPhoto) score += 6;
  if (photo.heroLevel === "HERO") score += 10;
  if (HOMEPAGE_CAMPAIGN_PHOTO_IDS.includes(photo.id as never)) score += 5;
  return score;
}

function pickOrdered(
  candidates: CampaignPhotoRecord[],
  surface: "homepageGallery" | "acrossArkansas" | "meetKelly" | "hero",
  inventory: ReturnType<typeof buildWebsiteSurfaceInventory>,
  overlayTier: Map<string, string>,
  max: number,
  preferKnownCounty: boolean,
): string[] {
  const scored = candidates
    .filter((p) => eligibleForCuratedGallery(p))
    .filter((p) => (preferKnownCounty ? !isUnknown(p.campaign.county) : true))
    .map((p) => ({ id: p.id, score: rankPhoto(p, surface, inventory, overlayTier) }))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));

  const out: string[] = [];
  const counties = new Set<string>();
  for (const row of scored) {
    if (out.length >= max) break;
    const photo = candidates.find((c) => c.id === row.id);
    if (!photo) continue;
    const county = photo.campaign.county;
    // Soft diversity: avoid flooding one county in Across/gallery
    if (
      county &&
      county !== "Unknown" &&
      counties.has(county) &&
      out.length >= Math.floor(max / 2) &&
      surface !== "meetKelly"
    ) {
      continue;
    }
    if (county && county !== "Unknown") counties.add(county);
    out.push(row.id);
  }

  // Fill remaining without county diversity if short
  if (out.length < max) {
    for (const row of scored) {
      if (out.length >= max) break;
      if (out.includes(row.id)) continue;
      out.push(row.id);
    }
  }
  return out;
}

export function getCurrentCuratedPlacementSnapshot(): {
  homepageIds: string[];
  acrossIds: string[];
  meetKellyId: string | null;
  heroId: string | null;
} {
  return {
    homepageIds: [...HOMEPAGE_CAMPAIGN_PHOTO_IDS],
    acrossIds: [...HOMEPAGE_ACROSS_ARKANSAS_PHOTO_IDS],
    meetKellyId: HOMEPAGE_MEET_KELLY_PHOTO_ID,
    heroId: HOMEPAGE_HERO_PHOTO_ID,
  };
}

export function proposeCuratedPlacement(input?: {
  allowHero?: boolean;
  galleryMax?: number;
  acrossMax?: number;
  persist?: boolean;
}): CuratedPlacementProposal {
  const allowHero = input?.allowHero === true;
  const galleryMax = Math.min(Math.max(input?.galleryMax ?? GALLERY_MAX, 6), 12);
  const acrossMax = Math.min(Math.max(input?.acrossMax ?? ACROSS_MAX, 4), 8);
  const live = listCampaignPhotosLive();
  const inventory = buildWebsiteSurfaceInventory(live);
  const store = loadPhotoEvidenceStore();
  const overlayTier = new Map<string, string>();
  for (const [id, o] of Object.entries(store.photos)) {
    if (o.tierIntent) overlayTier.set(id, o.tierIntent);
  }

  const current = getCurrentCuratedPlacementSnapshot();
  const warnings: string[] = [];
  const nextActions: string[] = [];

  const galleryProposed = pickOrdered(
    live,
    "homepageGallery",
    inventory,
    overlayTier,
    galleryMax,
    false,
  );
  // Prefer keeping current curated that still qualify, then fill with proposals
  const galleryMerged: string[] = [];
  for (const id of current.homepageIds) {
    if (galleryMerged.length >= galleryMax) break;
    if (galleryProposed.includes(id) || live.some((p) => p.id === id && eligibleForCuratedGallery(p))) {
      galleryMerged.push(id);
    }
  }
  for (const id of galleryProposed) {
    if (galleryMerged.length >= galleryMax) break;
    if (!galleryMerged.includes(id)) galleryMerged.push(id);
  }

  const acrossPool = live.filter((p) => !isUnknown(p.campaign.county));
  let acrossProposed = pickOrdered(acrossPool, "acrossArkansas", inventory, overlayTier, acrossMax, true);
  if (acrossProposed.length < 3) {
    warnings.push("Across Arkansas proposal is thin — confirm more county geography first.");
  }
  // Keep stable current across ids that still qualify
  const acrossMerged: string[] = [];
  for (const id of current.acrossIds) {
    if (acrossMerged.length >= acrossMax) break;
    if (acrossProposed.includes(id) || acrossPool.some((p) => p.id === id && eligibleForCuratedGallery(p))) {
      acrossMerged.push(id);
    }
  }
  for (const id of acrossProposed) {
    if (acrossMerged.length >= acrossMax) break;
    if (!acrossMerged.includes(id)) acrossMerged.push(id);
  }
  acrossProposed = acrossMerged;

  // Meet Kelly: prefer Gold seed mena still if still eligible, else best meetKelly score among gallery
  const meetCandidates = live.filter((p) => eligibleForCuratedGallery(p));
  const meetRanked = meetCandidates
    .map((p) => ({ id: p.id, score: rankPhoto(p, "meetKelly", inventory, overlayTier) }))
    .sort((a, b) => b.score - a.score);
  const meetKellyId =
    meetRanked.find((r) => r.id === "mena-polk-meet-greet-20260411")?.id ??
    meetRanked[0]?.id ??
    current.meetKellyId;
  if (meetKellyId && !galleryMerged.includes(meetKellyId)) {
    // Keep type-safe: Meet Kelly must be in gallery list
    galleryMerged[galleryMerged.length - 1] = meetKellyId;
    warnings.push("Meet Kelly id forced into gallery list for type safety.");
  }

  let heroId: string | null = null;
  if (allowHero) {
    const heroRanked = meetCandidates
      .filter((p) => p.heroLevel === "HERO" || overlayTier.get(p.id) === "Gold")
      .filter((p) => !isUnknown(p.campaign.county))
      .map((p) => ({ id: p.id, score: rankPhoto(p, "hero", inventory, overlayTier) }))
      .sort((a, b) => b.score - a.score);
    heroId = heroRanked[0]?.id ?? null;
    if (heroId && !galleryMerged.includes(heroId)) {
      galleryMerged.unshift(heroId);
      if (galleryMerged.length > galleryMax) galleryMerged.pop();
    }
    if (!heroId) {
      warnings.push("allowHero set but no Gold/HERO known-county still qualified — hero stays null.");
    }
  } else {
    heroId = null;
    if (current.heroId) {
      warnings.push("Hero remains null by doctrine unless Propose with allowHero.");
    }
  }

  const diffs: CuratedIdListDiff[] = [
    diffLists(
      "homepageGallery",
      current.homepageIds,
      galleryMerged,
      `Ordered up to ${galleryMax} FEATURE/HERO homepage stills (Gold seed + fit score + county diversity).`,
    ),
    diffLists(
      "acrossArkansas",
      current.acrossIds,
      acrossProposed,
      `Ordered up to ${acrossMax} known-county stills for Across Arkansas band.`,
    ),
    diffLists(
      "meetKelly",
      current.meetKellyId ? [current.meetKellyId] : [],
      meetKellyId ? [meetKellyId] : [],
      "Single Meet Kelly preview still (prefer Mena/Polk Gold seed when eligible).",
    ),
    diffLists(
      "hero",
      current.heroId ? [current.heroId] : [],
      heroId ? [heroId] : [],
      allowHero
        ? "Hero only when allowHero + Gold/HERO + known county."
        : "Hero stays null unless allowHero explicitly requested.",
    ),
  ];

  nextActions.push("Review current vs proposed on Placement tab.");
  nextActions.push("Apply with confirmCurate:true writes homepage-campaign-photos.ts (+ undo snapshot).");
  nextActions.push("Or copy curated-placement-stub.md manually — never silent HOMEPAGE_* mutate.");

  const now = new Date().toISOString();
  const proposal: CuratedPlacementProposal = {
    id: `cplace-${Date.now().toString(36)}`,
    createdAt: now,
    updatedAt: now,
    status: "pending",
    allowHero,
    diffs,
    meetKellyId,
    heroId,
    warnings,
    nextActions,
  };

  if (input?.persist !== false) upsertCuratedPlacementProposal(proposal);
  return proposal;
}

/**
 * P1 — Insert one finished photo into a curated surface proposal (pending only).
 * Never silent-applies HOMEPAGE_* — operator must confirmCurate on Publish/Placement.
 */
export function proposeCuratedPlacementForPhoto(input: {
  photoId: string;
  surface: "homepageGallery" | "acrossArkansas" | "meetKelly" | "hero";
  persist?: boolean;
}): {
  ok: boolean;
  message: string;
  proposal: CuratedPlacementProposal | null;
  warnings: string[];
} {
  const photoId = String(input.photoId ?? "").trim();
  const warnings: string[] = [];
  if (!photoId) {
    return { ok: false, message: "photoId required.", proposal: null, warnings: ["Missing photoId."] };
  }

  const live = listCampaignPhotosLive();
  const photo = live.find((p) => p.id === photoId);
  if (!photo) {
    return {
      ok: false,
      message: `Photo not found live: ${photoId}`,
      proposal: null,
      warnings: ["Still not in live registry/drafts."],
    };
  }

  const current = getCurrentCuratedPlacementSnapshot();
  const surface = input.surface;
  let gallery = [...current.homepageIds];
  let across = [...current.acrossIds];
  let meetKellyId = current.meetKellyId;
  let heroId: string | null = current.heroId;
  const allowHero = surface === "hero";

  if (surface === "homepageGallery") {
    gallery = [photoId, ...gallery.filter((id) => id !== photoId)].slice(0, GALLERY_MAX);
    if (!eligibleForCuratedGallery(photo)) {
      warnings.push(
        "Photo may not meet FEATURE/HERO + homepage rules yet — proposal still written for review.",
      );
    }
  } else if (surface === "acrossArkansas") {
    across = [photoId, ...across.filter((id) => id !== photoId)].slice(0, ACROSS_MAX);
    if (isUnknown(photo.campaign.county)) {
      warnings.push("Journey/Across prefers known county — Prefer Unknown stays Unknown until confirmed.");
    }
    if (!gallery.includes(photoId) && eligibleForCuratedGallery(photo)) {
      gallery = [photoId, ...gallery.filter((id) => id !== photoId)].slice(0, GALLERY_MAX);
      warnings.push("Also inserted into homepage gallery list for type-safe Across membership.");
    }
  } else if (surface === "meetKelly") {
    meetKellyId = photoId;
    if (!gallery.includes(photoId)) {
      gallery = [photoId, ...gallery.filter((id) => id !== photoId)].slice(0, GALLERY_MAX);
    }
  } else if (surface === "hero") {
    heroId = photoId;
    if (!gallery.includes(photoId)) {
      gallery = [photoId, ...gallery.filter((id) => id !== photoId)].slice(0, GALLERY_MAX);
    }
  }

  const diffs: CuratedIdListDiff[] = [
    diffLists(
      "homepageGallery",
      current.homepageIds,
      gallery,
      `Finish-for-web insert ${photoId} into homepage gallery (pending confirmCurate).`,
    ),
    diffLists(
      "acrossArkansas",
      current.acrossIds,
      across,
      `Finish-for-web insert ${photoId} into Across Arkansas (pending confirmCurate).`,
    ),
    diffLists(
      "meetKelly",
      current.meetKellyId ? [current.meetKellyId] : [],
      meetKellyId ? [meetKellyId] : [],
      "Meet Kelly single still from Finish surface.",
    ),
    diffLists(
      "hero",
      current.heroId ? [current.heroId] : [],
      allowHero && heroId ? [heroId] : [],
      allowHero ? "Hero proposed from Finish (confirmCurate required)." : "Hero unchanged.",
    ),
  ];

  const now = new Date().toISOString();
  const proposal: CuratedPlacementProposal = {
    id: `cplace-finish-${Date.now().toString(36)}`,
    createdAt: now,
    updatedAt: now,
    status: "pending",
    allowHero,
    diffs,
    meetKellyId,
    heroId: allowHero ? heroId : null,
    warnings,
    nextActions: [
      "Review proposal on Publish → Placement.",
      "Apply with confirmCurate:true — never silent HOMEPAGE_* mutate.",
    ],
  };

  if (input.persist !== false) upsertCuratedPlacementProposal(proposal);
  return {
    ok: true,
    message: `Curate proposal ${proposal.id} · ${surface} ← ${photoId} (pending).`,
    proposal,
    warnings,
  };
}
