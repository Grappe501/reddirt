/**
 * Promote a non-destructive derivative into public delivery (src override + optional placement flags).
 * Registry originals under campaign-photos stay untouched.
 */

import { existsSync } from "node:fs";
import path from "node:path";
import { CAMPAIGN_PHOTO_REGISTRY } from "@/content/media/campaign-photo-registry";
import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import { applyPhotoEvidenceOverlay } from "@/lib/campaign-media/apply-evidence-overlay";
import { isAlbumEligible } from "@/lib/campaign-media/county-albums";
import {
  loadPhotoEvidenceStore,
  loadPhotoIngestDrafts,
  savePhotoEvidenceStore,
} from "@/lib/campaign-media/evidence-store";
import type { PhotoEvidenceOverlay } from "@/lib/campaign-media/evidence-types";
import { parseHeroLevel } from "@/lib/campaign-media/evidence-validation";
import {
  listPhotoDerivatives,
  type PhotoDerivativeRecord,
} from "@/lib/campaign-media/media-derivatives";
import { publicPublishBlockedByConsent } from "@/lib/campaign-media/photo-consent-hold";

function placementPreviewFor(photo: CampaignPhotoRecord): string[] {
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
    surfaces.push(
      "Not on public surfaces yet — confirm county; FEATURE stills with geo appear on albums unless held",
    );
  }
  return surfaces;
}

export function isAllowedPublicSrcOverride(photoId: string, src: string): boolean {
  const s = String(src ?? "").trim();
  if (!s.startsWith(`/media/campaign-derivatives/${photoId}/`)) return false;
  if (s.includes("..") || s.includes("//")) return false;
  return true;
}

function resolveBase(photoId: string) {
  return (
    CAMPAIGN_PHOTO_REGISTRY.find((p) => p.id === photoId) ??
    loadPhotoIngestDrafts().photos.find((p) => p.id === photoId) ??
    null
  );
}

export type PromotePhotoDerivativeInput = {
  photoId: string;
  /** Derivative ledger id or publicSrc path. */
  derivativeId?: string;
  publicSrc?: string;
  /** Set overlay publicSrcOverride to this derivative. */
  setAsPublicSrc?: boolean;
  homepageCandidate?: boolean;
  featuredPhoto?: boolean;
  heroLevel?: string;
  approvedForPublic?: boolean;
  consentConfirmed?: boolean;
};

export type PromotePhotoDerivativeResult = {
  ok: boolean;
  message: string;
  overlay?: PhotoEvidenceOverlay;
  placementPreview?: string[];
  publicSrc?: string;
  registrySrc?: string;
};

function findDerivative(photoId: string, input: PromotePhotoDerivativeInput): PhotoDerivativeRecord | null {
  const rows = listPhotoDerivatives(photoId);
  if (input.derivativeId) {
    const byId = rows.find((r) => r.id === input.derivativeId);
    if (byId) return byId;
  }
  if (input.publicSrc) {
    const bySrc = rows.find((r) => r.publicSrc === input.publicSrc);
    if (bySrc) return bySrc;
    // Pro Edit assemblies: allow promote by path when file exists under allowed override root.
    const src = String(input.publicSrc).trim();
    if (isAllowedPublicSrcOverride(photoId, src)) {
      const absPath = path.join(process.cwd(), "public", src.replace(/^\//, ""));
      if (existsSync(absPath)) {
        return {
          id: `${photoId}--promote-path--${Date.now().toString(36)}`,
          sourcePhotoId: photoId,
          sourceSrc: src,
          kind: "web_max",
          publicSrc: src,
          relativePath: path.join("public", src.replace(/^\//, "")).split(path.sep).join("/"),
          width: 0,
          height: 0,
          bytes: 0,
          format: "jpeg",
          createdAt: new Date().toISOString(),
          note: "Promoted via allowed Pro/assembly publicSrc path.",
        };
      }
    }
  }
  return null;
}

export function promotePhotoDerivative(input: PromotePhotoDerivativeInput): PromotePhotoDerivativeResult {
  const photoId = String(input.photoId ?? "").trim();
  if (!photoId) return { ok: false, message: "photoId required." };

  const base = resolveBase(photoId);
  if (!base) return { ok: false, message: `Unknown photo id: ${photoId}` };

  const setAsPublicSrc = input.setAsPublicSrc !== false;
  const derivative = findDerivative(photoId, input);
  if (setAsPublicSrc && !derivative) {
    return { ok: false, message: "Derivative not found for this photo (create it first)." };
  }
  if (derivative && !isAllowedPublicSrcOverride(photoId, derivative.publicSrc)) {
    return { ok: false, message: "Derivative path is not allowed for this photo." };
  }
  if (derivative) {
    const abs = path.join(process.cwd(), "public", derivative.publicSrc.replace(/^\//, ""));
    if (!existsSync(abs)) {
      return { ok: false, message: `Derivative file missing on disk: ${derivative.publicSrc}` };
    }
  }

  const store = loadPhotoEvidenceStore();
  const prev = store.photos[photoId] ?? {};
  const next: PhotoEvidenceOverlay = { ...prev };

  if (setAsPublicSrc && derivative) {
    next.publicSrcOverride = derivative.publicSrc;
    next.promotedDerivativeId = derivative.id;
    next.promotedAt = new Date().toISOString();
  }

  if (input.homepageCandidate !== undefined) next.homepageCandidate = Boolean(input.homepageCandidate);
  if (input.featuredPhoto !== undefined) next.featuredPhoto = Boolean(input.featuredPhoto);
  if (input.approvedForPublic !== undefined) next.approvedForPublic = Boolean(input.approvedForPublic);
  if (input.heroLevel !== undefined) {
    const h = parseHeroLevel(String(input.heroLevel));
    if (!h) return { ok: false, message: `Invalid heroLevel: ${input.heroLevel}` };
    next.heroLevel = h;
  }
  next.updatedAt = new Date().toISOString();

  const consentBlock = publicPublishBlockedByConsent({
    photoId,
    notes: base.notes,
    approvedForPublic: Boolean(next.approvedForPublic),
    homepageCandidate: Boolean(next.homepageCandidate),
    publicationStatus: next.publicationStatus,
    consentConfirmed: Boolean(input.consentConfirmed),
  });
  if (consentBlock) return { ok: false, message: consentBlock };

  store.photos[photoId] = next;
  savePhotoEvidenceStore(store);

  const live = applyPhotoEvidenceOverlay(base, next);
  const placementPreview = placementPreviewFor(live);

  const bits: string[] = [];
  if (setAsPublicSrc && derivative) bits.push(`public src → ${derivative.publicSrc}`);
  if (input.homepageCandidate) bits.push("homepage candidate");
  if (input.featuredPhoto) bits.push("featured");
  if (input.heroLevel) bits.push(`hero ${input.heroLevel}`);
  if (input.approvedForPublic) bits.push("approved for public");

  return {
    ok: true,
    message: `Promoted ${photoId}: ${bits.join(" · ") || "overlay updated"}.`,
    overlay: next,
    placementPreview,
    publicSrc: live.src,
    registrySrc: base.src,
  };
}

export function clearPhotoPublicSrcOverride(photoId: string): PromotePhotoDerivativeResult {
  const id = String(photoId ?? "").trim();
  if (!id) return { ok: false, message: "photoId required." };
  const base = resolveBase(id);
  if (!base) return { ok: false, message: `Unknown photo id: ${id}` };

  const store = loadPhotoEvidenceStore();
  const prev = store.photos[id];
  if (!prev?.publicSrcOverride && !prev?.promotedDerivativeId) {
    return { ok: true, message: `No public src override on ${id}.`, registrySrc: base.src, publicSrc: base.src };
  }

  const next: PhotoEvidenceOverlay = { ...prev };
  delete next.publicSrcOverride;
  delete next.promotedDerivativeId;
  delete next.promotedAt;
  next.updatedAt = new Date().toISOString();
  store.photos[id] = next;
  savePhotoEvidenceStore(store);

  const live = applyPhotoEvidenceOverlay(base, next);
  return {
    ok: true,
    message: `Cleared public src override for ${id} — back to registry original.`,
    overlay: next,
    placementPreview: placementPreviewFor(live),
    publicSrc: live.src,
    registrySrc: base.src,
  };
}

export function previewPromotePlacement(input: {
  photoId: string;
  homepageCandidate?: boolean;
  featuredPhoto?: boolean;
  heroLevel?: string;
  approvedForPublic?: boolean;
  publicSrcOverride?: string;
}): { ok: true; placementPreview: string[]; hypotheticalSrc: string } | { ok: false; error: string } {
  const base = resolveBase(input.photoId);
  if (!base) return { ok: false, error: `Unknown photo id: ${input.photoId}` };
  const store = loadPhotoEvidenceStore();
  const prev = store.photos[input.photoId] ?? {};
  const draft: PhotoEvidenceOverlay = { ...prev };
  if (input.publicSrcOverride) {
    if (!isAllowedPublicSrcOverride(input.photoId, input.publicSrcOverride)) {
      return { ok: false, error: "publicSrcOverride not allowed for this photo." };
    }
    draft.publicSrcOverride = input.publicSrcOverride;
  }
  if (input.homepageCandidate !== undefined) draft.homepageCandidate = input.homepageCandidate;
  if (input.featuredPhoto !== undefined) draft.featuredPhoto = input.featuredPhoto;
  if (input.approvedForPublic !== undefined) draft.approvedForPublic = input.approvedForPublic;
  if (input.heroLevel) {
    const h = parseHeroLevel(input.heroLevel);
    if (!h) return { ok: false, error: `Invalid heroLevel: ${input.heroLevel}` };
    draft.heroLevel = h;
  }
  const live = applyPhotoEvidenceOverlay(base, draft);
  return { ok: true, placementPreview: placementPreviewFor(live), hypotheticalSrc: live.src };
}
