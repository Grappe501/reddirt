/**
 * Photo readiness matrix — next-actions for Evidence Photos / photo_prep AI.
 * Prefer Unknown; never invents geography.
 * P0: red path when zero assemblies or promoted but not shipped.
 */
import "server-only";

import { listCampaignPhotosLive } from "@/lib/campaign-media/list-campaign-photos-live";
import { loadPhotoEvidenceStore } from "@/lib/campaign-media/evidence-store";
import { listPhotoDerivatives } from "@/lib/campaign-media/media-derivatives";
import { listPhotoAssemblies, listPhotoEditProjects } from "@/lib/campaign-media/photo-edit-store";
import { publicPublishBlockedByConsent } from "@/lib/campaign-media/photo-consent-hold";
import { CAMPAIGN_SHIPPED_URL_PREFIX } from "@/lib/campaign-media/ship-promoted-derivatives";

export type PhotoReadinessRow = {
  photoId: string;
  title: string;
  county: string;
  confirmedCounty: boolean;
  hasFocus: boolean;
  derivativeCount: number;
  projectCount: number;
  assemblyCount: number;
  hasPublicOverride: boolean;
  /** Override under campaign-shipped (Netlify-safe). */
  isShipped: boolean;
  /** Override still under gitignored campaign-derivatives. */
  needsShip: boolean;
  approvedForPublic: boolean;
  consentBlock: string | null;
  readinessScore: number;
  nextAction: string;
  /** Operator attention — zero assemblies or unshipped derivative override. */
  attention: "ok" | "warn" | "block";
};

export type PhotoReadinessMatrix = {
  ok: true;
  generatedAt: string;
  total: number;
  needsFocus: number;
  needsProEdit: number;
  needsPromote: number;
  needsShip: number;
  blocked: number;
  rows: PhotoReadinessRow[];
};

function scoreRow(r: Omit<PhotoReadinessRow, "readinessScore" | "nextAction" | "attention">): {
  readinessScore: number;
  nextAction: string;
  attention: PhotoReadinessRow["attention"];
} {
  let readinessScore = 0;
  if (r.confirmedCounty) readinessScore += 25;
  if (r.hasFocus) readinessScore += 15;
  if (r.derivativeCount > 0) readinessScore += 10;
  if (r.projectCount > 0) readinessScore += 10;
  if (r.assemblyCount > 0) readinessScore += 20;
  if (r.isShipped) readinessScore += 15;
  else if (r.hasPublicOverride) readinessScore += 5;
  if (r.approvedForPublic) readinessScore += 10;

  let nextAction = "Identify geography (Prefer Unknown) + whatThisProves.";
  let attention: PhotoReadinessRow["attention"] = "ok";

  if (!r.confirmedCounty) {
    nextAction = "Confirm a real county (Unknown stays Unknown).";
    attention = "warn";
  } else if (!r.hasFocus) {
    nextAction = "Focus: click still → then Finish for web.";
    attention = "warn";
  } else if (r.assemblyCount === 0) {
    nextAction = "Finish for web (Apply → Confirm → Promote → Ship).";
    attention = "block";
  } else if (r.needsShip) {
    nextAction = "Ship promoted binary (Finish for web) — Netlify 404s on derivatives.";
    attention = "block";
  } else if (r.assemblyCount > 0 && !r.hasPublicOverride) {
    nextAction = "Finish for web or Promote + Ship (confirm) — never silent.";
    attention = "warn";
  } else if (r.consentBlock) {
    nextAction = `Consent hold: ${r.consentBlock}`;
    attention = "block";
  } else if (!r.approvedForPublic) {
    nextAction = "Approve for public when placement-ready.";
    attention = "warn";
  } else if (r.isShipped) {
    nextAction = "Shipped — place on Publish desk when curated.";
    attention = "ok";
  } else {
    nextAction = "Ship / place when curated — Prefer Unknown geography already set.";
  }

  return { readinessScore, nextAction, attention };
}

export function getPhotoReadinessMatrix(input?: {
  limit?: number;
  photoIds?: string[];
}): PhotoReadinessMatrix {
  const limit = Math.min(Math.max(Number(input?.limit) || 40, 1), 120);
  const filterIds = input?.photoIds?.map((id) => String(id).trim()).filter(Boolean);
  const store = loadPhotoEvidenceStore();
  const live = listCampaignPhotosLive();
  const pool = filterIds?.length
    ? live.filter((p) => filterIds.includes(p.id))
    : live;

  const rows: PhotoReadinessRow[] = [];
  for (const photo of pool.slice(0, 500)) {
    const overlay = store.photos[photo.id] ?? null;
    const county = String(photo.campaign?.county ?? overlay?.county ?? "Unknown").trim() || "Unknown";
    const confirmedCounty = county !== "Unknown" && county.length > 0;
    const hasFocus =
      typeof overlay?.focusX === "number" &&
      typeof overlay?.focusY === "number" &&
      Number.isFinite(overlay.focusX) &&
      Number.isFinite(overlay.focusY);
    const derivativeCount = listPhotoDerivatives(photo.id).length;
    const projectCount = listPhotoEditProjects(photo.id).length;
    const assemblyCount = listPhotoAssemblies(photo.id).filter(
      (a) => !a.note?.includes("[archived"),
    ).length;
    const override = String(overlay?.publicSrcOverride ?? "").trim();
    const hasPublicOverride = Boolean(override);
    const isShipped = override.startsWith(`${CAMPAIGN_SHIPPED_URL_PREFIX}/${photo.id}/`);
    const needsShip =
      override.startsWith(`/media/campaign-derivatives/${photo.id}/`) ||
      (hasPublicOverride && !isShipped && override.includes("campaign-derivatives"));
    const approvedForPublic = Boolean(
      overlay?.approvedForPublic ?? photo.campaign?.approvedForPublic,
    );
    const consentBlock = publicPublishBlockedByConsent({
      photoId: photo.id,
      notes: photo.notes,
      approvedForPublic,
      homepageCandidate: Boolean(overlay?.homepageCandidate ?? photo.campaign?.homepageCandidate),
      publicationStatus: overlay?.publicationStatus,
      consentConfirmed: false,
    });

    const base = {
      photoId: photo.id,
      title: String(photo.accessibility?.caption ?? photo.id).slice(0, 120),
      county,
      confirmedCounty,
      hasFocus,
      derivativeCount,
      projectCount,
      assemblyCount,
      hasPublicOverride,
      isShipped,
      needsShip,
      approvedForPublic,
      consentBlock,
    };
    const scored = scoreRow(base);
    rows.push({ ...base, ...scored });
  }

  rows.sort((a, b) => a.readinessScore - b.readinessScore || a.photoId.localeCompare(b.photoId));
  const sliced = rows.slice(0, limit);

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    total: rows.length,
    needsFocus: rows.filter((r) => !r.hasFocus).length,
    needsProEdit: rows.filter((r) => r.assemblyCount === 0).length,
    needsPromote: rows.filter((r) => r.assemblyCount > 0 && !r.hasPublicOverride).length,
    needsShip: rows.filter((r) => r.needsShip).length,
    blocked: rows.filter((r) => r.attention === "block").length,
    rows: sliced,
  };
}
