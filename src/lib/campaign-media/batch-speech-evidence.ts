/**
 * Batch speech evidence overlays — field-level apply across many videos.
 * Never invents geography; only writes fields the operator supplies.
 */

import { CAMPAIGN_MEDIA_REGISTRY } from "@/content/media/campaign-media-registry";
import {
  loadSpeechEvidenceStore,
  saveSpeechEvidenceStore,
} from "@/lib/campaign-media/evidence-store";
import type { SpeechEvidenceOverlay } from "@/lib/campaign-media/evidence-types";
import { parsePublicationStatus } from "@/lib/campaign-media/evidence-validation";

export const BATCH_SPEECH_FIELD_KEYS = [
  "counties",
  "city",
  "venue",
  "eventDate",
  "eventName",
  "whatThisProves",
  "approvedForPublic",
  "homepageCandidate",
  "publicationStatus",
  "doNotClaim",
] as const;

export type BatchSpeechFieldKey = (typeof BATCH_SPEECH_FIELD_KEYS)[number];

export type BatchSpeechEvidencePatch = {
  counties?: string[];
  city?: string;
  venue?: string;
  eventDate?: string;
  eventName?: string;
  whatThisProves?: string;
  approvedForPublic?: boolean;
  homepageCandidate?: boolean;
  publicationStatus?: SpeechEvidenceOverlay["publicationStatus"];
  doNotClaim?: string[];
};

export type BatchSpeechEvidenceResult = {
  ok: boolean;
  applied: number;
  skipped: number;
  errors: Array<{ speechId: string; error: string }>;
  appliedIds: string[];
  message: string;
};

const MAX_BATCH = 40;

function normalizeApplyFields(fields: string[]): BatchSpeechFieldKey[] {
  const allowed = new Set<string>(BATCH_SPEECH_FIELD_KEYS);
  const out: BatchSpeechFieldKey[] = [];
  for (const raw of fields) {
    const key = String(raw).trim() as BatchSpeechFieldKey;
    if (!allowed.has(key)) continue;
    if (!out.includes(key)) out.push(key);
  }
  return out;
}

function mergeOverlay(
  existing: SpeechEvidenceOverlay | undefined,
  patch: BatchSpeechEvidencePatch,
  applyFields: BatchSpeechFieldKey[],
): SpeechEvidenceOverlay {
  const next: SpeechEvidenceOverlay = { ...(existing ?? {}) };
  for (const key of applyFields) {
    switch (key) {
      case "counties":
        if (patch.counties !== undefined) next.counties = patch.counties;
        break;
      case "city":
        if (patch.city !== undefined) next.city = patch.city;
        break;
      case "venue":
        if (patch.venue !== undefined) next.venue = patch.venue;
        break;
      case "eventDate":
        if (patch.eventDate !== undefined) next.eventDate = patch.eventDate;
        break;
      case "eventName":
        if (patch.eventName !== undefined) next.eventName = patch.eventName;
        break;
      case "whatThisProves":
        if (patch.whatThisProves !== undefined) next.whatThisProves = patch.whatThisProves;
        break;
      case "approvedForPublic":
        if (patch.approvedForPublic !== undefined) next.approvedForPublic = patch.approvedForPublic;
        break;
      case "homepageCandidate":
        if (patch.homepageCandidate !== undefined) next.homepageCandidate = patch.homepageCandidate;
        break;
      case "publicationStatus":
        if (patch.publicationStatus !== undefined) next.publicationStatus = patch.publicationStatus;
        break;
      case "doNotClaim":
        if (patch.doNotClaim !== undefined) next.doNotClaim = patch.doNotClaim;
        break;
      default: {
        const _never: never = key;
        void _never;
      }
    }
  }
  next.updatedAt = new Date().toISOString();
  return next;
}

export function buildSpeechBatchPatchFromLoose(patch: Record<string, unknown>): BatchSpeechEvidencePatch {
  const out: BatchSpeechEvidencePatch = {};
  if (Array.isArray(patch.counties)) {
    out.counties = patch.counties.map((c) => String(c).trim()).filter(Boolean);
  } else if (typeof patch.counties === "string") {
    out.counties = patch.counties
      .split(/[,;]/)
      .map((c) => c.trim())
      .filter(Boolean);
  }
  if (typeof patch.city === "string") out.city = patch.city.trim();
  if (typeof patch.venue === "string") out.venue = patch.venue.trim();
  if (typeof patch.eventDate === "string") out.eventDate = patch.eventDate.trim();
  if (typeof patch.eventName === "string") out.eventName = patch.eventName.trim();
  if (typeof patch.whatThisProves === "string") out.whatThisProves = patch.whatThisProves.trim();
  if (typeof patch.approvedForPublic === "boolean") out.approvedForPublic = patch.approvedForPublic;
  if (typeof patch.homepageCandidate === "boolean") out.homepageCandidate = patch.homepageCandidate;
  const status = parsePublicationStatus(String(patch.publicationStatus ?? ""));
  if (status) out.publicationStatus = status;
  if (Array.isArray(patch.doNotClaim)) {
    out.doNotClaim = patch.doNotClaim.map((c) => String(c).trim()).filter(Boolean);
  } else if (typeof patch.doNotClaim === "string") {
    out.doNotClaim = patch.doNotClaim
      .split(/\n/)
      .map((c) => c.trim())
      .filter(Boolean);
  }
  return out;
}

export function applySpeechEvidenceBatch(input: {
  speechIds: string[];
  applyFields: string[];
  patch: BatchSpeechEvidencePatch;
}): BatchSpeechEvidenceResult {
  const ids = [...new Set(input.speechIds.map((id) => String(id).trim()).filter(Boolean))].slice(
    0,
    MAX_BATCH,
  );
  const applyFields = normalizeApplyFields(input.applyFields);
  if (!ids.length) {
    return {
      ok: false,
      applied: 0,
      skipped: 0,
      errors: [],
      appliedIds: [],
      message: "No speech ids.",
    };
  }
  if (!applyFields.length) {
    return {
      ok: false,
      applied: 0,
      skipped: ids.length,
      errors: [],
      appliedIds: [],
      message: "No valid apply fields.",
    };
  }

  const store = loadSpeechEvidenceStore();
  const errors: Array<{ speechId: string; error: string }> = [];
  const appliedIds: string[] = [];
  let skipped = 0;

  for (const speechId of ids) {
    const base = CAMPAIGN_MEDIA_REGISTRY.find((m) => m.id === speechId);
    if (!base) {
      errors.push({ speechId, error: "Not in media registry." });
      skipped += 1;
      continue;
    }
    store.speeches[speechId] = mergeOverlay(store.speeches[speechId], input.patch, applyFields);
    appliedIds.push(speechId);
  }

  if (appliedIds.length) saveSpeechEvidenceStore(store);

  return {
    ok: appliedIds.length > 0,
    applied: appliedIds.length,
    skipped,
    errors,
    appliedIds,
    message: `Speech batch saved ${appliedIds.length} · skipped ${skipped} · fields ${applyFields.join(",")}`,
  };
}
