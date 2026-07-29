/**
 * Pass 9 — Batch publish controls (approve / hold / homepage / featured).
 * Consent-aware; refreshes county albums once after a successful write.
 */

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { CAMPAIGN_PHOTO_REGISTRY } from "@/content/media/campaign-photo-registry";
import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import {
  loadPhotoEvidenceStore,
  loadPhotoIngestDrafts,
  savePhotoEvidenceStore,
} from "@/lib/campaign-media/evidence-store";
import type { PhotoEvidenceOverlay } from "@/lib/campaign-media/evidence-types";
import { listCampaignPhotosLive } from "@/lib/campaign-media/list-campaign-photos-live";
import {
  photoRequiresConsentHold,
  publicPublishBlockedByConsent,
} from "@/lib/campaign-media/photo-consent-hold";
import { refreshCountyAlbumIndex } from "@/lib/campaign-media/refresh-county-albums";

export const BATCH_PUBLISH_ACTIONS = [
  "approve",
  "hold",
  "homepage_on",
  "homepage_off",
  "featured_on",
  "featured_off",
] as const;

export type BatchPublishAction = (typeof BATCH_PUBLISH_ACTIONS)[number];

export const BATCH_PUBLISH_RUNS_REL = "data/campaign-media/batch-publish-runs.json";

export type BatchPublishRun = {
  id: string;
  createdAt: string;
  action: BatchPublishAction;
  photoIds: string[];
  appliedIds: string[];
  skippedConsent: number;
  skippedUnknownCounty: number;
  errorCount: number;
  albumNote?: string;
  /** Pass 10 — prior overlays for applied ids (null = no overlay existed). */
  beforeById?: Record<string, PhotoEvidenceOverlay | null>;
  undoneAt?: string;
};

export type BatchPublishRunsStore = {
  version: 1;
  updatedAt: string;
  purpose: string;
  runs: BatchPublishRun[];
};

export type BatchPublishResult = {
  ok: boolean;
  action: BatchPublishAction;
  applied: number;
  skipped: number;
  skippedConsent: number;
  skippedUnknownCounty: number;
  errors: Array<{ photoId: string; error: string }>;
  appliedIds: string[];
  albumNote: string;
  runId: string | null;
  message: string;
};

const MAX_BATCH = 80;

function abs(rel: string): string {
  return path.join(process.cwd(), rel);
}

function emptyRuns(): BatchPublishRunsStore {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    purpose: "Evidence Workbench batch publish/hold runs (Pass 9). Originals never deleted.",
    runs: [],
  };
}

export function loadBatchPublishRuns(): BatchPublishRunsStore {
  const p = abs(BATCH_PUBLISH_RUNS_REL);
  if (!existsSync(p)) return emptyRuns();
  try {
    const raw = JSON.parse(readFileSync(p, "utf8")) as Partial<BatchPublishRunsStore>;
    return {
      ...emptyRuns(),
      ...raw,
      version: 1,
      runs: Array.isArray(raw.runs) ? raw.runs : [],
    };
  } catch {
    return emptyRuns();
  }
}

function saveRuns(store: BatchPublishRunsStore): void {
  const target = abs(BATCH_PUBLISH_RUNS_REL);
  mkdirSync(path.dirname(target), { recursive: true });
  const next: BatchPublishRunsStore = { ...store, version: 1, updatedAt: new Date().toISOString() };
  const tmp = `${target}.${process.pid}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  renameSync(tmp, target);
}

function resolveBasePhoto(photoId: string): CampaignPhotoRecord | null {
  return (
    CAMPAIGN_PHOTO_REGISTRY.find((p) => p.id === photoId) ??
    loadPhotoIngestDrafts().photos.find((p) => p.id === photoId) ??
    null
  );
}

function effectiveCounty(base: CampaignPhotoRecord, overlay?: PhotoEvidenceOverlay): string {
  const c = (overlay?.county ?? base.campaign.county ?? "Unknown").trim();
  return c || "Unknown";
}

function patchForAction(
  existing: PhotoEvidenceOverlay | undefined,
  action: BatchPublishAction,
): PhotoEvidenceOverlay {
  const next: PhotoEvidenceOverlay = { ...(existing ?? {}) };
  switch (action) {
    case "approve":
      next.approvedForPublic = true;
      if (
        !next.publicationStatus ||
        next.publicationStatus === "DRAFT" ||
        next.publicationStatus === "IN_REVIEW"
      ) {
        next.publicationStatus = "APPROVED";
      }
      break;
    case "hold":
      next.approvedForPublic = false;
      next.homepageCandidate = false;
      next.featuredPhoto = false;
      break;
    case "homepage_on":
      next.homepageCandidate = true;
      break;
    case "homepage_off":
      next.homepageCandidate = false;
      break;
    case "featured_on":
      next.featuredPhoto = true;
      break;
    case "featured_off":
      next.featuredPhoto = false;
      break;
    default: {
      const _never: never = action;
      void _never;
    }
  }
  next.updatedAt = new Date().toISOString();
  return next;
}

export function actionWantsPublicSurface(action: BatchPublishAction): boolean {
  return action === "approve" || action === "homepage_on" || action === "featured_on";
}

export function previewBatchPublish(input: {
  photoIds: string[];
  action: BatchPublishAction;
}): {
  actionable: number;
  needsConsent: number;
  unknownCounty: number;
  missing: number;
} {
  const ids = [...new Set(input.photoIds.map((id) => String(id).trim()).filter(Boolean))].slice(
    0,
    MAX_BATCH,
  );
  const store = loadPhotoEvidenceStore();
  let needsConsent = 0;
  let unknownCounty = 0;
  let missing = 0;
  let actionable = 0;
  for (const photoId of ids) {
    const base = resolveBasePhoto(photoId);
    if (!base) {
      missing += 1;
      continue;
    }
    const overlay = store.photos[photoId];
    if (actionWantsPublicSurface(input.action) && effectiveCounty(base, overlay) === "Unknown") {
      unknownCounty += 1;
      continue;
    }
    if (
      actionWantsPublicSurface(input.action) &&
      photoRequiresConsentHold(photoId, base.notes)
    ) {
      needsConsent += 1;
    }
    actionable += 1;
  }
  return { actionable, needsConsent, unknownCounty, missing };
}

/**
 * Apply a publish/hold preset to many stills. Skips Unknown-county for public-raising actions.
 */
export function applyPhotoPublishBatch(input: {
  photoIds: string[];
  action: string;
  consentConfirmed?: boolean;
  refreshAlbums?: boolean;
  /** When true, allow approve/homepage/featured even if county is Unknown (still consent-gated). */
  allowUnknownCounty?: boolean;
}): BatchPublishResult {
  const action = String(input.action ?? "").trim() as BatchPublishAction;
  if (!(BATCH_PUBLISH_ACTIONS as readonly string[]).includes(action)) {
    return {
      ok: false,
      action: "hold",
      applied: 0,
      skipped: 0,
      skippedConsent: 0,
      skippedUnknownCounty: 0,
      errors: [],
      appliedIds: [],
      albumNote: "",
      runId: null,
      message: `Unsupported action. Use: ${BATCH_PUBLISH_ACTIONS.join(", ")}`,
    };
  }

  const ids = [...new Set(input.photoIds.map((id) => String(id).trim()).filter(Boolean))].slice(
    0,
    MAX_BATCH,
  );
  if (!ids.length) {
    return {
      ok: false,
      action,
      applied: 0,
      skipped: 0,
      skippedConsent: 0,
      skippedUnknownCounty: 0,
      errors: [],
      appliedIds: [],
      albumNote: "",
      runId: null,
      message: "No photo ids provided.",
    };
  }

  const store = loadPhotoEvidenceStore();
  const errors: Array<{ photoId: string; error: string }> = [];
  const appliedIds: string[] = [];
  const beforeById: Record<string, PhotoEvidenceOverlay | null> = {};
  let skipped = 0;
  let skippedConsent = 0;
  let skippedUnknownCounty = 0;

  for (const photoId of ids) {
    const base = resolveBasePhoto(photoId);
    if (!base) {
      skipped += 1;
      errors.push({ photoId, error: "Unknown photo id." });
      continue;
    }

    const existing = store.photos[photoId];
    if (
      actionWantsPublicSurface(action) &&
      !input.allowUnknownCounty &&
      effectiveCounty(base, existing) === "Unknown"
    ) {
      skipped += 1;
      skippedUnknownCounty += 1;
      errors.push({
        photoId,
        error: "County is Unknown — confirm geography before approve/homepage/featured.",
      });
      continue;
    }

    const next = patchForAction(existing, action);
    const consentBlock = publicPublishBlockedByConsent({
      photoId,
      notes: base.notes,
      approvedForPublic: Boolean(next.approvedForPublic),
      homepageCandidate: Boolean(next.homepageCandidate),
      publicationStatus: next.publicationStatus,
      consentConfirmed: Boolean(input.consentConfirmed),
    });
    if (consentBlock) {
      skipped += 1;
      skippedConsent += 1;
      errors.push({ photoId, error: consentBlock });
      continue;
    }

    beforeById[photoId] = existing ? { ...existing } : null;
    store.photos[photoId] = next;
    appliedIds.push(photoId);
  }

  if (appliedIds.length) {
    savePhotoEvidenceStore(store);
  }

  let albumNote = "";
  if (appliedIds.length && input.refreshAlbums !== false) {
    try {
      const livePhotos = listCampaignPhotosLive(store);
      const result = refreshCountyAlbumIndex({
        materializeFolders: true,
        photos: livePhotos,
        photoStore: store,
      });
      albumNote =
        ` Albums refreshed once: ${result.countyCount} counties / ${result.photoCount} photos` +
        (result.missingSources ? ` (${result.missingSources} missing source file(s))` : "") +
        ".";
    } catch (err) {
      albumNote = ` Album refresh failed: ${err instanceof Error ? err.message : "unknown error"}`;
    }
  }

  const runId = appliedIds.length
    ? `bpub-${action}-${Date.now().toString(36)}`
    : null;
  if (runId) {
    const runs = loadBatchPublishRuns();
    runs.runs = [
      {
        id: runId,
        createdAt: new Date().toISOString(),
        action,
        photoIds: ids,
        appliedIds,
        skippedConsent,
        skippedUnknownCounty,
        errorCount: errors.length,
        albumNote: albumNote.trim() || undefined,
        beforeById,
      },
      ...runs.runs,
    ].slice(0, 50);
    saveRuns(runs);
  }

  const ok = appliedIds.length > 0;
  const labels: Record<BatchPublishAction, string> = {
    approve: "Approved for public",
    hold: "Held off public albums",
    homepage_on: "Homepage candidate on",
    homepage_off: "Homepage candidate off",
    featured_on: "Featured on",
    featured_off: "Featured off",
  };

  return {
    ok,
    action,
    applied: appliedIds.length,
    skipped,
    skippedConsent,
    skippedUnknownCounty,
    errors: errors.slice(0, 20),
    appliedIds,
    albumNote,
    runId,
    message: ok
      ? `${labels[action]} → ${appliedIds.length} photo(s)` +
        (skipped ? ` (${skipped} skipped)` : "") +
        albumNote
      : `Batch ${action} failed — ${errors[0]?.error ?? "nothing applied."}`,
  };
}

export function getUndoableBatchPublishRuns(): BatchPublishRun[] {
  return loadBatchPublishRuns()
    .runs.filter((r) => !r.undoneAt && r.beforeById && Object.keys(r.beforeById).length > 0)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

/**
 * Restore overlays from a publish run snapshot. Refreshes albums once.
 */
export function undoBatchPublishRun(
  runId: string,
  opts?: { refreshAlbums?: boolean },
): {
  ok: boolean;
  message: string;
  restored: number;
  runId: string | null;
} {
  const id = String(runId ?? "").trim();
  if (!id) return { ok: false, message: "runId required.", restored: 0, runId: null };
  const runsStore = loadBatchPublishRuns();
  const run = runsStore.runs.find((r) => r.id === id);
  if (!run) return { ok: false, message: `Run not found: ${id}`, restored: 0, runId: null };
  if (run.undoneAt) {
    return { ok: false, message: `Run already undone at ${run.undoneAt}.`, restored: 0, runId: id };
  }
  if (!run.beforeById || !Object.keys(run.beforeById).length) {
    return {
      ok: false,
      message: "This run has no before-snapshot (pre–Pass 10) — cannot undo safely.",
      restored: 0,
      runId: id,
    };
  }

  const store = loadPhotoEvidenceStore();
  let restored = 0;
  for (const photoId of run.appliedIds) {
    if (!(photoId in run.beforeById)) continue;
    const prev = run.beforeById[photoId];
    if (prev == null) {
      delete store.photos[photoId];
    } else {
      store.photos[photoId] = { ...prev, updatedAt: new Date().toISOString() };
    }
    restored += 1;
  }
  if (restored) savePhotoEvidenceStore(store);

  let albumNote = "";
  if (restored && opts?.refreshAlbums !== false) {
    try {
      const livePhotos = listCampaignPhotosLive(store);
      const result = refreshCountyAlbumIndex({
        materializeFolders: true,
        photos: livePhotos,
        photoStore: store,
      });
      albumNote = ` Albums refreshed once: ${result.countyCount} counties / ${result.photoCount} photos.`;
    } catch (err) {
      albumNote = ` Album refresh failed: ${err instanceof Error ? err.message : "unknown"}`;
    }
  }

  run.undoneAt = new Date().toISOString();
  saveRuns(runsStore);

  return {
    ok: restored > 0,
    restored,
    runId: id,
    message:
      restored > 0
        ? `Undid ${run.action} for ${restored} photo(s) (${id}).${albumNote}`
        : `Nothing restored for ${id}.`,
  };
}

export function undoLastBatchPublish(opts?: { refreshAlbums?: boolean }) {
  const undoable = getUndoableBatchPublishRuns();
  const latest = undoable[0];
  if (!latest) {
    return {
      ok: false,
      message: "No undoable publish run (need a Pass 10+ run with before-snapshot).",
      restored: 0,
      runId: null as string | null,
    };
  }
  return undoBatchPublishRun(latest.id, opts);
}
