/**
 * Speech confirm/publish batch — approve / hold / publish / homepage.
 * Unknown-county discipline on public-raising actions; undo via before-snapshot.
 */

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { CAMPAIGN_MEDIA_REGISTRY } from "@/content/media/campaign-media-registry";
import {
  loadSpeechEvidenceStore,
  saveSpeechEvidenceStore,
} from "@/lib/campaign-media/evidence-store";
import type { SpeechEvidenceOverlay } from "@/lib/campaign-media/evidence-types";

export const BATCH_SPEECH_PUBLISH_ACTIONS = [
  "approve",
  "hold",
  "publish",
  "homepage_on",
  "homepage_off",
] as const;

export type BatchSpeechPublishAction = (typeof BATCH_SPEECH_PUBLISH_ACTIONS)[number];

export const BATCH_SPEECH_PUBLISH_RUNS_REL = "data/campaign-media/batch-speech-publish-runs.json";

export type BatchSpeechPublishRun = {
  id: string;
  createdAt: string;
  action: BatchSpeechPublishAction;
  speechIds: string[];
  appliedIds: string[];
  skippedEmptyCounty: number;
  errorCount: number;
  beforeById?: Record<string, SpeechEvidenceOverlay | null>;
  undoneAt?: string;
};

export type BatchSpeechPublishRunsStore = {
  version: 1;
  updatedAt: string;
  purpose: string;
  runs: BatchSpeechPublishRun[];
};

export type BatchSpeechPublishResult = {
  ok: boolean;
  action: BatchSpeechPublishAction;
  applied: number;
  skipped: number;
  skippedEmptyCounty: number;
  errors: Array<{ speechId: string; error: string }>;
  appliedIds: string[];
  runId: string | null;
  message: string;
};

const MAX_BATCH = 40;

function abs(rel: string): string {
  return path.join(process.cwd(), rel);
}

function emptyRuns(): BatchSpeechPublishRunsStore {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    purpose:
      "Evidence Workbench batch speech publish/hold runs (audit #4). Never silent Approve; Unknown not invented.",
    runs: [],
  };
}

export function loadBatchSpeechPublishRuns(): BatchSpeechPublishRunsStore {
  const p = abs(BATCH_SPEECH_PUBLISH_RUNS_REL);
  if (!existsSync(p)) return emptyRuns();
  try {
    const raw = JSON.parse(readFileSync(p, "utf8")) as Partial<BatchSpeechPublishRunsStore>;
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

function saveRuns(store: BatchSpeechPublishRunsStore): void {
  const target = abs(BATCH_SPEECH_PUBLISH_RUNS_REL);
  mkdirSync(path.dirname(target), { recursive: true });
  const next: BatchSpeechPublishRunsStore = { ...store, version: 1, updatedAt: new Date().toISOString() };
  const tmp = `${target}.${process.pid}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  renameSync(tmp, target);
}

function effectiveCounties(
  baseCounties: string[] | undefined,
  overlay?: SpeechEvidenceOverlay,
): string[] {
  const fromOverlay = overlay?.counties?.map((c) => c.trim()).filter(Boolean) ?? [];
  if (fromOverlay.length) return fromOverlay;
  return (baseCounties ?? []).map((c) => c.trim()).filter(Boolean);
}

function hasConfirmedCounty(counties: string[]): boolean {
  return counties.some((c) => c && c !== "Unknown");
}

function patchForAction(
  existing: SpeechEvidenceOverlay | undefined,
  action: BatchSpeechPublishAction,
): SpeechEvidenceOverlay {
  const next: SpeechEvidenceOverlay = { ...(existing ?? {}) };
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
    case "publish":
      next.approvedForPublic = true;
      next.publicationStatus = "PUBLISHED";
      break;
    case "hold":
      next.approvedForPublic = false;
      next.homepageCandidate = false;
      break;
    case "homepage_on":
      next.homepageCandidate = true;
      break;
    case "homepage_off":
      next.homepageCandidate = false;
      break;
    default: {
      const _never: never = action;
      void _never;
    }
  }
  next.updatedAt = new Date().toISOString();
  return next;
}

export function speechActionWantsPublicSurface(action: BatchSpeechPublishAction): boolean {
  return action === "approve" || action === "publish" || action === "homepage_on";
}

export function previewBatchSpeechPublish(input: {
  speechIds: string[];
  action: BatchSpeechPublishAction;
}): {
  actionable: number;
  emptyCounty: number;
  missing: number;
} {
  const ids = [...new Set(input.speechIds.map((id) => String(id).trim()).filter(Boolean))].slice(
    0,
    MAX_BATCH,
  );
  const store = loadSpeechEvidenceStore();
  let emptyCounty = 0;
  let missing = 0;
  let actionable = 0;
  for (const speechId of ids) {
    const base = CAMPAIGN_MEDIA_REGISTRY.find((m) => m.id === speechId);
    if (!base) {
      missing += 1;
      continue;
    }
    const overlay = store.speeches[speechId];
    const counties = effectiveCounties(base.counties, overlay);
    if (speechActionWantsPublicSurface(input.action) && !hasConfirmedCounty(counties)) {
      emptyCounty += 1;
      continue;
    }
    actionable += 1;
  }
  return { actionable, emptyCounty, missing };
}

export function applySpeechPublishBatch(input: {
  speechIds: string[];
  action: string;
  allowEmptyCounty?: boolean;
}): BatchSpeechPublishResult {
  const action = String(input.action ?? "").trim() as BatchSpeechPublishAction;
  if (!(BATCH_SPEECH_PUBLISH_ACTIONS as readonly string[]).includes(action)) {
    return {
      ok: false,
      action: "hold",
      applied: 0,
      skipped: 0,
      skippedEmptyCounty: 0,
      errors: [],
      appliedIds: [],
      runId: null,
      message: "Unsupported speech publish action.",
    };
  }

  const ids = [...new Set(input.speechIds.map((id) => String(id).trim()).filter(Boolean))].slice(
    0,
    MAX_BATCH,
  );
  const store = loadSpeechEvidenceStore();
  const errors: Array<{ speechId: string; error: string }> = [];
  const appliedIds: string[] = [];
  const beforeById: Record<string, SpeechEvidenceOverlay | null> = {};
  let skippedEmptyCounty = 0;
  let skipped = 0;

  for (const speechId of ids) {
    const base = CAMPAIGN_MEDIA_REGISTRY.find((m) => m.id === speechId);
    if (!base) {
      errors.push({ speechId, error: "Not in media registry." });
      skipped += 1;
      continue;
    }
    const existing = store.speeches[speechId];
    const counties = effectiveCounties(base.counties, existing);
    if (
      speechActionWantsPublicSurface(action) &&
      !input.allowEmptyCounty &&
      !hasConfirmedCounty(counties)
    ) {
      skippedEmptyCounty += 1;
      skipped += 1;
      continue;
    }
    beforeById[speechId] = existing ? { ...existing } : null;
    store.speeches[speechId] = patchForAction(existing, action);
    appliedIds.push(speechId);
  }

  let runId: string | null = null;
  if (appliedIds.length) {
    saveSpeechEvidenceStore(store);
    runId = `spub-${Date.now().toString(36)}`;
    const runs = loadBatchSpeechPublishRuns();
    runs.runs = [
      {
        id: runId,
        createdAt: new Date().toISOString(),
        action,
        speechIds: ids,
        appliedIds,
        skippedEmptyCounty,
        errorCount: errors.length,
        beforeById,
      },
      ...runs.runs,
    ].slice(0, 40);
    saveRuns(runs);
  }

  return {
    ok: appliedIds.length > 0,
    action,
    applied: appliedIds.length,
    skipped,
    skippedEmptyCounty,
    errors,
    appliedIds,
    runId,
    message: `Speech ${action}: applied ${appliedIds.length} · skipped empty-county ${skippedEmptyCounty} · errors ${errors.length}`,
  };
}

export function getUndoableBatchSpeechPublishRuns(): BatchSpeechPublishRun[] {
  return loadBatchSpeechPublishRuns().runs.filter((r) => !r.undoneAt && r.beforeById);
}

export function undoBatchSpeechPublishRun(
  runId: string,
): { ok: boolean; message: string; restored?: number; runId?: string | null } {
  const tid = String(runId ?? "").trim();
  if (!tid) return { ok: false, message: "runId required." };
  const runs = loadBatchSpeechPublishRuns();
  const run = runs.runs.find((r) => r.id === tid);
  if (!run) return { ok: false, message: `Run not found: ${tid}` };
  if (run.undoneAt) return { ok: false, message: "Run already undone." };
  if (!run.beforeById) return { ok: false, message: "Run has no before snapshot." };

  const store = loadSpeechEvidenceStore();
  let restored = 0;
  for (const [speechId, before] of Object.entries(run.beforeById)) {
    if (before == null) {
      delete store.speeches[speechId];
    } else {
      store.speeches[speechId] = before;
    }
    restored += 1;
  }
  saveSpeechEvidenceStore(store);
  run.undoneAt = new Date().toISOString();
  saveRuns(runs);
  return {
    ok: true,
    message: `Undid speech publish run ${tid} · restored ${restored}`,
    restored,
    runId: tid,
  };
}

export function undoLastBatchSpeechPublish(): {
  ok: boolean;
  message: string;
  restored?: number;
  runId?: string | null;
} {
  const undoable = getUndoableBatchSpeechPublishRuns();
  if (!undoable.length) return { ok: false, message: "No undoable speech publish run." };
  return undoBatchSpeechPublishRun(undoable[0].id);
}
