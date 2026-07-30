/**
 * Photo readiness matrix — next-actions for Evidence Photos / photo_prep AI.
 * Prefer Unknown; never invents geography.
 */
import "server-only";

import { listCampaignPhotosLive } from "@/lib/campaign-media/list-campaign-photos-live";
import { loadPhotoEvidenceStore } from "@/lib/campaign-media/evidence-store";
import { listPhotoDerivatives } from "@/lib/campaign-media/media-derivatives";
import { listPhotoAssemblies, listPhotoEditProjects } from "@/lib/campaign-media/photo-edit-store";
import { publicPublishBlockedByConsent } from "@/lib/campaign-media/photo-consent-hold";

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
  approvedForPublic: boolean;
  consentBlock: string | null;
  readinessScore: number;
  nextAction: string;
};

export type PhotoReadinessMatrix = {
  ok: true;
  generatedAt: string;
  total: number;
  needsFocus: number;
  needsProEdit: number;
  needsPromote: number;
  rows: PhotoReadinessRow[];
};

function scoreRow(r: Omit<PhotoReadinessRow, "readinessScore" | "nextAction">): {
  readinessScore: number;
  nextAction: string;
} {
  let readinessScore = 0;
  if (r.confirmedCounty) readinessScore += 25;
  if (r.hasFocus) readinessScore += 15;
  if (r.derivativeCount > 0) readinessScore += 10;
  if (r.projectCount > 0) readinessScore += 10;
  if (r.assemblyCount > 0) readinessScore += 20;
  if (r.hasPublicOverride) readinessScore += 10;
  if (r.approvedForPublic) readinessScore += 10;

  let nextAction = "Identify geography (Prefer Unknown) + whatThisProves.";
  if (!r.confirmedCounty) nextAction = "Confirm a real county (Unknown stays Unknown).";
  else if (!r.hasFocus) nextAction = "Click still to set focus for cover crops / Pro Edit.";
  else if (r.projectCount === 0 && r.assemblyCount === 0) {
    nextAction = "Pro Edit: Propose look + slots → Preview → Confirm render.";
  } else if (r.projectCount > 0 && r.assemblyCount === 0) {
    nextAction = "Preview look, then Confirm render for multi-aspect pack.";
  } else if (r.assemblyCount > 0 && !r.hasPublicOverride) {
    nextAction = "Promote a Pro assembly (confirm) — never auto-promotes.";
  } else if (r.consentBlock) nextAction = `Consent hold: ${r.consentBlock}`;
  else if (!r.approvedForPublic) nextAction = "Approve for public when placement-ready.";
  else nextAction = "Ship / place when curated — Prefer Unknown geography already set.";

  return { readinessScore, nextAction };
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
    const hasPublicOverride = Boolean(overlay?.publicSrcOverride);
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
    rows: sliced,
  };
}
