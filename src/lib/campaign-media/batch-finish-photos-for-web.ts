/**
 * V2.3 — Batch Finish for web (max 12, one confirm).
 * Prefer Unknown; never silent; refuse stills lacking focus or consent when public.
 */
import "server-only";

import { BATCH_FINISH_MAX } from "@/lib/campaign-media/batch-finish-constants";
import type { EvidenceFinishSurface } from "@/lib/campaign-media/evidence-edit-intents";
import { loadPhotoEvidenceStore } from "@/lib/campaign-media/evidence-store";
import {
  finishPhotoForWeb,
  type FinishPhotoForWebResult,
} from "@/lib/campaign-media/finish-photo-for-web";
import type { NormalizedCropRect } from "@/lib/campaign-media/focus-crop";
import { listCampaignPhotosLive } from "@/lib/campaign-media/list-campaign-photos-live";
import {
  photoRequiresConsentHold,
  publicPublishBlockedByConsent,
} from "@/lib/campaign-media/photo-consent-hold";
import type { PhotoStudioBurnIn } from "@/lib/campaign-media/photo-edit-types";
import type { PhotoExportSlot, PhotoLookPreset } from "@/lib/campaign-media/photo-look-presets";

export { BATCH_FINISH_MAX } from "@/lib/campaign-media/batch-finish-constants";

export type BatchFinishItemResult = {
  photoId: string;
  ok: boolean;
  message: string;
  refused?: boolean;
  refuseReason?: string;
  publicSrc?: string;
  curateProposalId?: string;
  steps?: string[];
  warnings?: string[];
};

export type BatchFinishPhotosForWebResult = {
  ok: boolean;
  message: string;
  finishSurface: EvidenceFinishSurface;
  finished: BatchFinishItemResult[];
  refused: BatchFinishItemResult[];
  failed: BatchFinishItemResult[];
  curateProposalIds: string[];
  warnings: string[];
  processed: number;
  cappedFrom?: number;
};

function uniqueIds(raw: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const id of raw) {
    const t = String(id ?? "").trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

function preflightPhoto(input: {
  photoId: string;
  finishSurface: EvidenceFinishSurface;
  consentConfirmed: boolean;
  homepageCandidate: boolean;
  approvedForPublic: boolean;
}): BatchFinishItemResult | null {
  const photoId = input.photoId;
  const live = listCampaignPhotosLive().find((p) => p.id === photoId);
  if (!live) {
    return {
      photoId,
      ok: false,
      refused: true,
      refuseReason: "Photo not found.",
      message: "Photo not found.",
    };
  }

  const overlay = loadPhotoEvidenceStore().photos[photoId] ?? null;
  const hasFocus =
    typeof overlay?.focusX === "number" &&
    typeof overlay?.focusY === "number" &&
    Number.isFinite(overlay.focusX) &&
    Number.isFinite(overlay.focusY);
  if (!hasFocus) {
    return {
      photoId,
      ok: false,
      refused: true,
      refuseReason: "Missing focus — click still on Edit desk first.",
      message: "Missing focus.",
    };
  }

  if (input.finishSurface !== "social") {
    const notes = String(live.notes ?? "");
    if (photoRequiresConsentHold(photoId, notes) && !input.consentConfirmed) {
      const block = publicPublishBlockedByConsent({
        photoId,
        notes,
        approvedForPublic:
          input.approvedForPublic || Boolean(overlay?.approvedForPublic ?? live.campaign?.approvedForPublic),
        homepageCandidate:
          input.homepageCandidate ||
          Boolean(overlay?.homepageCandidate ?? live.campaign?.homepageCandidate) ||
          input.finishSurface === "homepage" ||
          input.finishSurface === "journey",
        publicationStatus: overlay?.publicationStatus,
        consentConfirmed: false,
      });
      if (block || photoRequiresConsentHold(photoId, notes)) {
        return {
          photoId,
          ok: false,
          refused: true,
          refuseReason:
            block ??
            "Consent hold — confirm Steve/family consent before batch Finish for public surfaces.",
          message: "Consent hold.",
        };
      }
    }
  }

  return null;
}

/**
 * Confirm-gated batch Finish. Caps at BATCH_FINISH_MAX.
 * Refuses stills without focus (and consent-hold stills without consentConfirmed on public surfaces).
 */
export async function batchFinishPhotosForWeb(input: {
  photoIds: string[];
  confirmFinish: boolean;
  look?: PhotoLookPreset;
  exportSlots?: PhotoExportSlot[];
  useFocus?: boolean;
  sharpen?: boolean;
  homepageCandidate?: boolean;
  featuredPhoto?: boolean;
  heroLevel?: string;
  approvedForPublic?: boolean;
  consentConfirmed?: boolean;
  finishSurface?: EvidenceFinishSurface;
  proposeCurate?: boolean;
  burnIn?: PhotoStudioBurnIn | null;
  /** Rare — usually per-photo from project; applied only when single id or identical intent. */
  cropRect?: NormalizedCropRect | null;
}): Promise<BatchFinishPhotosForWebResult> {
  const warnings: string[] = [];
  const finishSurface: EvidenceFinishSurface = input.finishSurface ?? "homepage";
  const consentConfirmed = Boolean(input.consentConfirmed);
  const homepageCandidate =
    input.homepageCandidate ?? (finishSurface === "homepage" || finishSurface === "journey");
  const approvedForPublic = Boolean(input.approvedForPublic);

  if (!input.confirmFinish) {
    return {
      ok: false,
      message: "confirmFinish:true required — refuse silent batch Finish.",
      finishSurface,
      finished: [],
      refused: [],
      failed: [],
      curateProposalIds: [],
      warnings: ["Silent batch Finish blocked."],
      processed: 0,
    };
  }

  const allIds = uniqueIds(input.photoIds ?? []);
  if (!allIds.length) {
    return {
      ok: false,
      message: "photoIds[] required.",
      finishSurface,
      finished: [],
      refused: [],
      failed: [],
      curateProposalIds: [],
      warnings: ["No photoIds."],
      processed: 0,
    };
  }

  let cappedFrom: number | undefined;
  let ids = allIds;
  if (ids.length > BATCH_FINISH_MAX) {
    cappedFrom = ids.length;
    ids = ids.slice(0, BATCH_FINISH_MAX);
    warnings.push(`Capped to ${BATCH_FINISH_MAX} (from ${cappedFrom}).`);
  }

  const refused: BatchFinishItemResult[] = [];
  const eligible: string[] = [];
  for (const photoId of ids) {
    const block = preflightPhoto({
      photoId,
      finishSurface,
      consentConfirmed,
      homepageCandidate: Boolean(homepageCandidate),
      approvedForPublic,
    });
    if (block) refused.push(block);
    else eligible.push(photoId);
  }

  if (!eligible.length) {
    return {
      ok: false,
      message: `Batch Finish refused — ${refused.length} still(s) blocked (focus/consent). Fix Edit desk, then retry.`,
      finishSurface,
      finished: [],
      refused,
      failed: [],
      curateProposalIds: [],
      warnings,
      processed: 0,
      cappedFrom,
    };
  }

  // Hard gate: if ANY selected still lacks focus/consent, refuse the whole batch (operator clarity).
  if (refused.length > 0) {
    return {
      ok: false,
      message: `Batch Finish blocked — ${refused.length} of ${ids.length} lack focus or consent. Deselect them or fix, then confirm again.`,
      finishSurface,
      finished: [],
      refused,
      failed: [],
      curateProposalIds: [],
      warnings: [
        ...warnings,
        ...refused.map((r) => `${r.photoId}: ${r.refuseReason ?? r.message}`),
      ],
      processed: 0,
      cappedFrom,
    };
  }

  const finished: BatchFinishItemResult[] = [];
  const failed: BatchFinishItemResult[] = [];
  const curateProposalIds: string[] = [];

  for (const photoId of eligible) {
    const overlay = loadPhotoEvidenceStore().photos[photoId] ?? null;
    let result: FinishPhotoForWebResult;
    try {
      result = await finishPhotoForWeb({
        photoId,
        confirmFinish: true,
        look: input.look,
        exportSlots: input.exportSlots,
        useFocus: input.useFocus ?? true,
        focusX: overlay?.focusX,
        focusY: overlay?.focusY,
        sharpen: input.sharpen,
        homepageCandidate: input.homepageCandidate,
        featuredPhoto: input.featuredPhoto,
        heroLevel: input.heroLevel,
        approvedForPublic: input.approvedForPublic,
        consentConfirmed,
        finishSurface,
        proposeCurate: input.proposeCurate,
        burnIn: input.burnIn,
        cropRect: eligible.length === 1 ? input.cropRect : undefined,
      });
    } catch (err) {
      failed.push({
        photoId,
        ok: false,
        message: err instanceof Error ? err.message : "Finish threw.",
      });
      continue;
    }

    const item: BatchFinishItemResult = {
      photoId,
      ok: result.ok,
      message: result.message,
      publicSrc: result.publicSrc,
      curateProposalId: result.curateProposalId,
      steps: result.steps,
      warnings: result.warnings,
    };
    if (result.ok) {
      finished.push(item);
      if (result.curateProposalId) curateProposalIds.push(result.curateProposalId);
      if (result.warnings?.length) warnings.push(...result.warnings.map((w) => `${photoId}: ${w}`));
    } else {
      failed.push(item);
    }
  }

  const ok = finished.length > 0 && failed.length === 0;
  const partial = finished.length > 0 && failed.length > 0;
  return {
    ok: ok || partial,
    message: [
      `Batch Finish · ${finishSurface} · ${finished.length} finished`,
      failed.length ? `${failed.length} failed` : null,
      curateProposalIds.length ? `${curateProposalIds.length} curate proposal(s) pending` : null,
      "Commit overlays + campaign-shipped to deploy.",
    ]
      .filter(Boolean)
      .join(" · "),
    finishSurface,
    finished,
    refused,
    failed,
    curateProposalIds,
    warnings,
    processed: finished.length + failed.length,
    cappedFrom,
  };
}
