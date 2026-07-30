"use server";

import { revalidatePath } from "next/cache";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { assertAdminApi } from "@/lib/admin/require-admin";
import {
  loadCalendarPresenceStore,
  loadPhotoEvidenceStore,
  loadPhotoIngestDrafts,
  loadSpeechEvidenceStore,
  saveCalendarPresenceStore,
  savePhotoEvidenceStore,
  saveSpeechEvidenceStore,
} from "@/lib/campaign-media/evidence-store";
import { assertLocalEvidenceWritesAllowed } from "@/lib/campaign-media/evidence-local-writes";
import { exportConfirmedCalendarToPresenceMatrix } from "@/lib/campaign-media/export-calendar-to-matrix";
import {
  normalizeCountyList,
  parseHeroLevel,
  parsePublicationStatus,
  parseTierIntent,
} from "@/lib/campaign-media/evidence-validation";
import { listCampaignPhotosLive } from "@/lib/campaign-media/list-campaign-photos-live";
import { publicPublishBlockedByConsent } from "@/lib/campaign-media/photo-consent-hold";
import { listDiskPhotoIngestCandidates } from "@/lib/campaign-media/photo-ingest";
import type {
  CalendarPresenceRow,
  CalendarPresenceStatus,
  PhotoEvidenceOverlay,
  SpeechEvidenceOverlay,
} from "@/lib/campaign-media/evidence-types";

async function gate(): Promise<{ ok: true } | { ok: false; error: string }> {
  const unauthorized = await assertAdminApi();
  if (unauthorized) {
    return { ok: false, error: "Unauthorized — log in at /admin/login." };
  }
  return assertLocalEvidenceWritesAllowed();
}

function str(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

function bool(form: FormData, key: string): boolean {
  const v = form.get(key);
  return v === "on" || v === "true" || v === "1";
}

function revalidateEvidenceSurfaces(): void {
  revalidatePath("/admin/evidence-workbench");
  revalidatePath("/campaign-photos");
  revalidatePath("/from-the-road");
  revalidatePath("/about/journey");
  revalidatePath("/about");
  revalidatePath("/");
  revalidatePath("/kelly-speaks");
}

export async function saveCalendarRowsAction(
  _prev: { ok: boolean; message: string } | null,
  formData: FormData,
): Promise<{ ok: boolean; message: string }> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };

  const raw = str(formData, "rowsJson");
  if (!raw) return { ok: false, message: "No calendar payload." };
  let rows: CalendarPresenceRow[];
  try {
    rows = JSON.parse(raw) as CalendarPresenceRow[];
  } catch {
    return { ok: false, message: "Invalid calendar JSON." };
  }

  const store = loadCalendarPresenceStore();
  const byId = new Map(store.rows.map((r) => [r.id, r]));
  let applied = 0;
  let skipped = 0;
  for (const patch of rows) {
    const cur = byId.get(patch.id);
    if (!cur) {
      skipped += 1;
      continue;
    }
    const places = Array.isArray(patch.places)
      ? patch.places
          .map((p) => ({
            city: String(p?.city ?? "").trim(),
            county: String(p?.county ?? "").trim(),
            venue: p?.venue ? String(p.venue).trim() : undefined,
            note: p?.note ? String(p.note).trim() : undefined,
          }))
          .filter((p) => p.city || p.county || p.venue)
      : cur.places;
    const primary = places?.[0];
    byId.set(patch.id, {
      ...cur,
      city: primary?.city ?? patch.city ?? cur.city,
      county: primary?.county ?? patch.county ?? cur.county,
      status: patch.status ?? cur.status,
      places: places?.length ? places : undefined,
      notes: patch.notes !== undefined ? String(patch.notes) : cur.notes,
    });
    applied += 1;
  }
  store.rows = Array.from(byId.values()).sort(
    (a, b) => a.date.localeCompare(b.date) || a.summary.localeCompare(b.summary),
  );
  saveCalendarPresenceStore(store);
  revalidatePath("/admin/evidence-workbench");
  return {
    ok: true,
    message: `Saved ${applied} calendar row(s)${skipped ? ` (${skipped} unknown id(s) skipped)` : ""}.`,
  };
}

export async function savePhotoEvidenceAction(
  _prev: { ok: boolean; message: string } | null,
  formData: FormData,
): Promise<{ ok: boolean; message: string }> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };

  const photoId = str(formData, "photoId");
  if (!photoId) return { ok: false, message: "Missing photo id." };

  const heroLevel = parseHeroLevel(str(formData, "heroLevel"));
  const publicationStatus = parsePublicationStatus(str(formData, "publicationStatus"));
  if (str(formData, "heroLevel") && !heroLevel) {
    return { ok: false, message: "Invalid hero level." };
  }
  if (str(formData, "publicationStatus") && !publicationStatus) {
    return { ok: false, message: "Invalid publication status." };
  }

  const peopleRaw = str(formData, "peopleVisible");
  const overlay: PhotoEvidenceOverlay = {
    county: str(formData, "county") || "Unknown",
    city: str(formData, "city") || "Unknown",
    venue: str(formData, "venue") || "Unknown",
    eventDate: str(formData, "eventDate") || "Unknown",
    eventName: str(formData, "eventName") || "Unknown",
    photographer: str(formData, "photographer") || "Unknown",
    peopleVisible: peopleRaw
      ? peopleRaw.split(",").map((p) => p.trim()).filter(Boolean)
      : [],
    whatThisProves: str(formData, "whatThisProves"),
    approvedForPublic: bool(formData, "approvedForPublic"),
    homepageCandidate: bool(formData, "homepageCandidate"),
    featuredPhoto: bool(formData, "featuredPhoto"),
    heroLevel,
    tierIntent: parseTierIntent(str(formData, "tierIntent")),
    publicationStatus,
    updatedAt: new Date().toISOString(),
  };

  const { CAMPAIGN_PHOTO_REGISTRY } = await import("@/content/media/campaign-photo-registry");
  const base =
    CAMPAIGN_PHOTO_REGISTRY.find((p) => p.id === photoId) ??
    loadPhotoIngestDrafts().photos.find((p) => p.id === photoId);
  if (!base) return { ok: false, message: `Unknown photo id: ${photoId}` };

  const consentBlock = publicPublishBlockedByConsent({
    photoId,
    notes: base.notes,
    approvedForPublic: Boolean(overlay.approvedForPublic),
    homepageCandidate: Boolean(overlay.homepageCandidate),
    publicationStatus: overlay.publicationStatus,
    consentConfirmed: bool(formData, "consentConfirmed"),
  });
  if (consentBlock) return { ok: false, message: consentBlock };

  const store = loadPhotoEvidenceStore();
  store.photos[photoId] = overlay;
  savePhotoEvidenceStore(store);

  let albumNote = "";
  try {
    const { refreshCountyAlbumIndex } = await import("@/lib/campaign-media/refresh-county-albums");
    const livePhotos = listCampaignPhotosLive(store);
    const result = refreshCountyAlbumIndex({ materializeFolders: true, photos: livePhotos, photoStore: store });
    albumNote = ` Albums: ${result.countyCount} counties / ${result.photoCount} photos` +
      (result.missingSources ? ` (${result.missingSources} missing source file(s))` : "") +
      ".";
  } catch {
    albumNote = " (album refresh skipped)";
  }

  if (overlay.county !== "Unknown" && overlay.city !== "Unknown") {
    const { rememberConfirmedEvidenceExample } = await import("@/lib/campaign-media/evidence-ai-memory");
    rememberConfirmedEvidenceExample({
      assetKind: "photo",
      assetId: photoId,
      county: overlay.county ?? "Unknown",
      city: overlay.city ?? "Unknown",
      venue: overlay.venue,
      eventName: overlay.eventName,
      peopleVisible: overlay.peopleVisible,
      whatThisProves: overlay.whatThisProves,
      captionOrTitle: base.accessibility.caption,
      updatedAt: new Date().toISOString(),
    });
  }

  revalidateEvidenceSurfaces();
  return { ok: true, message: `Saved photo evidence for ${photoId}.${albumNote}` };
}

export async function batchSavePhotoEvidenceAction(input: {
  photoIds: string[];
  applyFields: string[];
  patch: Record<string, unknown>;
  consentConfirmed?: boolean;
}): Promise<{
  ok: boolean;
  message: string;
  applied?: number;
  skipped?: number;
  errors?: Array<{ photoId: string; error: string }>;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };

  const { applyPhotoEvidenceBatch, buildBatchPatchFromLoose } = await import(
    "@/lib/campaign-media/batch-photo-evidence"
  );
  const result = applyPhotoEvidenceBatch({
    photoIds: input.photoIds,
    applyFields: input.applyFields,
    patch: buildBatchPatchFromLoose(input.patch),
    consentConfirmed: Boolean(input.consentConfirmed),
    refreshAlbums: true,
    rememberMemory: true,
  });

  if (result.applied > 0) revalidateEvidenceSurfaces();
  return {
    ok: result.ok,
    message: result.message,
    applied: result.applied,
    skipped: result.skipped,
    errors: result.errors.slice(0, 12),
  };
}

export async function batchPublishPhotosAction(input: {
  photoIds: string[];
  action: string;
  consentConfirmed?: boolean;
  allowUnknownCounty?: boolean;
}): Promise<{
  ok: boolean;
  message: string;
  applied?: number;
  skipped?: number;
  skippedConsent?: number;
  skippedUnknownCounty?: number;
  runId?: string | null;
  errors?: Array<{ photoId: string; error: string }>;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { applyPhotoPublishBatch } = await import("@/lib/campaign-media/batch-photo-publish");
  const result = applyPhotoPublishBatch({
    photoIds: input.photoIds,
    action: input.action,
    consentConfirmed: Boolean(input.consentConfirmed),
    allowUnknownCounty: Boolean(input.allowUnknownCounty),
    refreshAlbums: true,
  });
  if (result.applied > 0) revalidateEvidenceSurfaces();
  return {
    ok: result.ok,
    message: result.message,
    applied: result.applied,
    skipped: result.skipped,
    skippedConsent: result.skippedConsent,
    skippedUnknownCounty: result.skippedUnknownCounty,
    runId: result.runId,
    errors: result.errors.slice(0, 12),
  };
}

export async function previewBatchPublishPhotosAction(input: {
  photoIds: string[];
  action: string;
}): Promise<{
  ok: boolean;
  message: string;
  actionable?: number;
  needsConsent?: number;
  unknownCounty?: number;
  missing?: number;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { previewBatchPublish, BATCH_PUBLISH_ACTIONS } = await import(
    "@/lib/campaign-media/batch-photo-publish"
  );
  const action = String(input.action ?? "").trim();
  if (!(BATCH_PUBLISH_ACTIONS as readonly string[]).includes(action)) {
    return { ok: false, message: "Unsupported publish action." };
  }
  const preview = previewBatchPublish({
    photoIds: input.photoIds,
    action: action as (typeof BATCH_PUBLISH_ACTIONS)[number],
  });
  return {
    ok: true,
    message: `${preview.actionable} actionable · ${preview.needsConsent} need consent · ${preview.unknownCounty} unknown county · ${preview.missing} missing`,
    ...preview,
  };
}

export async function listEvidenceBatchOpsAction(): Promise<{
  ok: boolean;
  message: string;
  operations?: import("@/lib/campaign-media/evidence-batch-ops").EvidenceBatchOperation[];
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { listEvidenceBatchOperations } = await import("@/lib/campaign-media/evidence-batch-ops");
  const operations = listEvidenceBatchOperations(20);
  return {
    ok: true,
    message: operations.length ? `${operations.length} recent batch op(s)` : "No batch operations yet.",
    operations,
  };
}

export async function undoBatchPublishAction(input?: {
  runId?: string;
}): Promise<{ ok: boolean; message: string; restored?: number; runId?: string | null }> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { undoBatchPublishRun, undoLastBatchPublish } = await import(
    "@/lib/campaign-media/batch-photo-publish"
  );
  const runId = String(input?.runId ?? "").trim();
  const result = runId
    ? undoBatchPublishRun(runId, { refreshAlbums: true })
    : undoLastBatchPublish({ refreshAlbums: true });
  if (result.ok && (result.restored ?? 0) > 0) revalidateEvidenceSurfaces();
  return {
    ok: result.ok,
    message: result.message,
    restored: result.restored,
    runId: result.runId,
  };
}

export async function saveSpeechEvidenceAction(
  _prev: { ok: boolean; message: string } | null,
  formData: FormData,
): Promise<{ ok: boolean; message: string }> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };

  const speechId = str(formData, "speechId");
  if (!speechId) return { ok: false, message: "Missing speech id." };

  const publicationStatus = parsePublicationStatus(str(formData, "publicationStatus"));
  if (str(formData, "publicationStatus") && !publicationStatus) {
    return { ok: false, message: "Invalid publication status." };
  }

  const store = loadSpeechEvidenceStore();
  const prev = store.speeches[speechId] ?? {};
  const overlay: SpeechEvidenceOverlay = {
    counties: normalizeCountyList(str(formData, "counties")),
    city: str(formData, "city"),
    venue: str(formData, "venue"),
    eventDate: str(formData, "eventDate"),
    eventName: str(formData, "eventName"),
    whatThisProves: str(formData, "whatThisProves"),
    approvedForPublic: bool(formData, "approvedForPublic"),
    homepageCandidate: bool(formData, "homepageCandidate"),
    publicationStatus,
    // Preserve Pass 8 intel fields unless apply action rewrites them.
    speakerNotes: prev.speakerNotes,
    keyQuotes: prev.keyQuotes,
    doNotClaim: prev.doNotClaim,
    transcriptChapters: prev.transcriptChapters,
    transcriptIntelAt: prev.transcriptIntelAt,
    transcriptIntelPlanId: prev.transcriptIntelPlanId,
    updatedAt: new Date().toISOString(),
  };

  store.speeches[speechId] = overlay;
  saveSpeechEvidenceStore(store);

  const primaryCounty = overlay.counties?.[0]?.trim() || "";
  if (primaryCounty && primaryCounty !== "Unknown" && overlay.city && overlay.city !== "Unknown") {
    const { rememberConfirmedEvidenceExample } = await import("@/lib/campaign-media/evidence-ai-memory");
    const { CAMPAIGN_MEDIA_REGISTRY } = await import("@/content/media/campaign-media-registry");
    const base = CAMPAIGN_MEDIA_REGISTRY.find((m) => m.id === speechId);
    rememberConfirmedEvidenceExample({
      assetKind: "speech",
      assetId: speechId,
      county: primaryCounty,
      city: overlay.city,
      venue: overlay.venue,
      eventName: overlay.eventName,
      whatThisProves: overlay.whatThisProves,
      captionOrTitle: base?.title,
      updatedAt: new Date().toISOString(),
    });
  }

  revalidateEvidenceSurfaces();
  return { ok: true, message: `Saved speech evidence for ${speechId}.` };
}

export async function batchSaveSpeechEvidenceAction(input: {
  speechIds: string[];
  applyFields: string[];
  patch: Record<string, unknown>;
}): Promise<{
  ok: boolean;
  message: string;
  applied?: number;
  skipped?: number;
  errors?: Array<{ speechId: string; error: string }>;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { applySpeechEvidenceBatch, buildSpeechBatchPatchFromLoose } = await import(
    "@/lib/campaign-media/batch-speech-evidence"
  );
  const result = applySpeechEvidenceBatch({
    speechIds: input.speechIds,
    applyFields: input.applyFields,
    patch: buildSpeechBatchPatchFromLoose(input.patch),
  });
  if (result.applied > 0) revalidateEvidenceSurfaces();
  return {
    ok: result.ok,
    message: result.message,
    applied: result.applied,
    skipped: result.skipped,
    errors: result.errors.slice(0, 12),
  };
}

export async function batchPublishSpeechesAction(input: {
  speechIds: string[];
  action: string;
  allowEmptyCounty?: boolean;
}): Promise<{
  ok: boolean;
  message: string;
  applied?: number;
  skipped?: number;
  skippedEmptyCounty?: number;
  runId?: string | null;
  errors?: Array<{ speechId: string; error: string }>;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { applySpeechPublishBatch } = await import("@/lib/campaign-media/batch-speech-publish");
  const result = applySpeechPublishBatch({
    speechIds: input.speechIds,
    action: input.action,
    allowEmptyCounty: Boolean(input.allowEmptyCounty),
  });
  if (result.applied > 0) revalidateEvidenceSurfaces();
  return {
    ok: result.ok,
    message: result.message,
    applied: result.applied,
    skipped: result.skipped,
    skippedEmptyCounty: result.skippedEmptyCounty,
    runId: result.runId,
    errors: result.errors.slice(0, 12),
  };
}

export async function undoBatchSpeechPublishAction(input?: {
  runId?: string;
}): Promise<{ ok: boolean; message: string; restored?: number; runId?: string | null }> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { undoBatchSpeechPublishRun, undoLastBatchSpeechPublish } = await import(
    "@/lib/campaign-media/batch-speech-publish"
  );
  const runId = String(input?.runId ?? "").trim();
  const result = runId ? undoBatchSpeechPublishRun(runId) : undoLastBatchSpeechPublish();
  if (result.ok && (result.restored ?? 0) > 0) revalidateEvidenceSurfaces();
  return result;
}

export async function getSpeechConfirmQueueAction(): Promise<{
  ok: boolean;
  message: string;
  queue?: import("@/lib/campaign-media/speech-confirm-queue").SpeechConfirmQueue;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { buildSpeechConfirmQueue } = await import("@/lib/campaign-media/speech-confirm-queue");
  const queue = buildSpeechConfirmQueue();
  return {
    ok: true,
    message: `Speech queue · no-county ${queue.totals.noCounty} · needs-publish ${queue.totals.needsPublish} · published ${queue.totals.published}`,
    queue,
  };
}

export async function getSpeechReadinessMatrixAction(input?: {
  speechIds?: string[];
}): Promise<{
  ok: boolean;
  message: string;
  rows?: import("@/lib/campaign-media/speech-readiness").SpeechReadinessRow[];
  totals?: {
    speeches: number;
    noCounty: number;
    needsPublish: number;
    published: number;
    overlaysSaved: number;
    prepReady: number;
  };
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { buildSpeechReadinessMatrix } = await import("@/lib/campaign-media/speech-readiness");
  const matrix = buildSpeechReadinessMatrix({ speechIds: input?.speechIds });
  return {
    ok: true,
    message: `Readiness · ${matrix.totals.speeches} speeches · overlays ${matrix.totals.overlaysSaved}`,
    rows: matrix.rows,
    totals: matrix.totals,
  };
}

export async function proposeSpeechPlacementAction(input?: {
  persist?: boolean;
}): Promise<{
  ok: boolean;
  message: string;
  proposal?: import("@/lib/campaign-media/speech-placement").SpeechPlacementProposal;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { proposeSpeechPlacement, writeSpeechPlacementStub } = await import(
    "@/lib/campaign-media/speech-placement"
  );
  const proposal = proposeSpeechPlacement({ persist: input?.persist !== false });
  writeSpeechPlacementStub(proposal);
  revalidatePath("/admin/evidence-workbench");
  return {
    ok: true,
    message: `Speech placement proposed ${proposal.id}`,
    proposal,
  };
}

export async function listSpeechPlacementProposalsAction(): Promise<{
  ok: boolean;
  message: string;
  proposals?: import("@/lib/campaign-media/speech-placement").SpeechPlacementProposal[];
  current?: ReturnType<
    typeof import("@/lib/campaign-media/speech-placement").getCurrentSpeechPlacementSnapshot
  >;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { loadSpeechPlacementStore, getCurrentSpeechPlacementSnapshot } = await import(
    "@/lib/campaign-media/speech-placement"
  );
  const proposals = loadSpeechPlacementStore().proposals;
  return {
    ok: true,
    message: `${proposals.length} speech placement proposal(s)`,
    proposals,
    current: getCurrentSpeechPlacementSnapshot(),
  };
}

export async function writeSpeechPlacementStubAction(input: {
  proposalId: string;
}): Promise<{ ok: boolean; message: string; relativePath?: string }> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { getSpeechPlacementProposal, writeSpeechPlacementStub } = await import(
    "@/lib/campaign-media/speech-placement"
  );
  const proposal = getSpeechPlacementProposal(input.proposalId);
  if (!proposal) return { ok: false, message: "Proposal not found." };
  return writeSpeechPlacementStub(proposal);
}

export async function applySpeechPlacementAction(input: {
  proposalId: string;
  confirmCurate: boolean;
}): Promise<{
  ok: boolean;
  message: string;
  undoSnapshotId?: string;
  warnings?: string[];
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  if (!input.confirmCurate) {
    return { ok: false, message: "confirmCurate:true required — refuse silent HOMEPAGE_*_VIDEO_ID mutate." };
  }
  const { applySpeechPlacementProposal } = await import("@/lib/campaign-media/speech-placement");
  const result = applySpeechPlacementProposal({
    proposalId: String(input.proposalId ?? "").trim(),
    confirmCurate: true,
  });
  revalidatePath("/admin/evidence-workbench");
  revalidatePath("/");
  revalidatePath("/kelly-speaks");
  return result;
}

export async function undoSpeechPlacementAction(input: {
  undoSnapshotId: string;
  confirmCurate: boolean;
}): Promise<{ ok: boolean; message: string }> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  if (!input.confirmCurate) {
    return { ok: false, message: "confirmCurate:true required — refuse silent undo." };
  }
  const { undoSpeechPlacement } = await import("@/lib/campaign-media/speech-placement");
  const result = undoSpeechPlacement({
    undoSnapshotId: String(input.undoSnapshotId ?? "").trim(),
    confirmCurate: true,
  });
  revalidatePath("/admin/evidence-workbench");
  revalidatePath("/");
  revalidatePath("/kelly-speaks");
  return result;
}

export async function exportCalendarMatrixAction(): Promise<{ ok: boolean; message: string }> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const store = loadCalendarPresenceStore();
  const result = exportConfirmedCalendarToPresenceMatrix(store);
  if (!result.ok) return { ok: false, message: result.error };
  revalidatePath("/admin/evidence-workbench");
  return {
    ok: true,
    message: `Presence Matrix updated (${result.confirmedCount} confirmed row(s)).`,
  };
}

/** Re-seed calendar from local CSV or ICS path (local disk only). */
export async function importCalendarSeedAction(
  _prev: { ok: boolean; message: string } | null,
  formData: FormData,
): Promise<{ ok: boolean; message: string }> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };

  const source = str(formData, "source") || "csv";
  const { spawnSync } = await import("node:child_process");

  if (source === "csv" || source === "md") {
    const script = path.join(process.cwd(), "scripts/seed-calendar-presence.cjs");
    const run = spawnSync(process.execPath, [script], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    if (run.status !== 0) {
      return { ok: false, message: run.stderr || run.stdout || "Seed script failed." };
    }
    revalidatePath("/admin/evidence-workbench");
    return { ok: true, message: run.stdout.trim() || "Calendar re-seeded." };
  }

  if (source === "ics") {
    const icsPath = str(formData, "icsPath");
    if (!icsPath) {
      return { ok: false, message: "Provide an ICS path (local file)." };
    }
    if (!existsSync(icsPath)) {
      return { ok: false, message: `ICS not found: ${icsPath}` };
    }
    const mode = str(formData, "mode") || "full";
    if (mode === "full") {
      const script = path.join(process.cwd(), "scripts/rebuild-calendar-presence-queue.cjs");
      const run = spawnSync(
        process.execPath,
        [script, "--ics", icsPath, "--since", str(formData, "since") || "2025-11-01"],
        { cwd: process.cwd(), encoding: "utf8" },
      );
      if (run.status !== 0) {
        return { ok: false, message: run.stderr || run.stdout || "Full queue rebuild failed." };
      }
      revalidatePath("/admin/evidence-workbench");
      return {
        ok: true,
        message: `Full location queue rebuilt since 2025-11-01.\n${(run.stdout || "").trim()}`,
      };
    }
    const csvPath = path.join(process.cwd(), "..", ".local", "temp", "kelly-calendar-extract.csv");
    try {
      writeIcsToCsv(icsPath, csvPath);
    } catch (e) {
      return { ok: false, message: e instanceof Error ? e.message : "ICS parse failed." };
    }
    const script = path.join(process.cwd(), "scripts/seed-calendar-presence.cjs");
    const run = spawnSync(process.execPath, [script], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    if (run.status !== 0) {
      return { ok: false, message: run.stderr || run.stdout || "Seed after ICS failed." };
    }
    revalidatePath("/admin/evidence-workbench");
    return { ok: true, message: `Imported ICS → CSV → calendar store.\n${run.stdout.trim()}` };
  }

  return { ok: false, message: "Unknown import source." };
}

function writeIcsToCsv(icsPath: string, csvPath: string): void {
  let raw = readFileSync(icsPath, "utf8");
  raw = raw.replace(/\r?\n[ \t]/g, "");
  const blocks = raw.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) ?? [];
  const rows: Array<{ Date: string; Summary: string; Location: string; Status: string }> = [];

  const getField = (text: string, name: string) => {
    const m = text.match(new RegExp(`(?:^|\\n)${name}(?:;[^:]*)?:(.*)`));
    return m ? m[1].trim().replace(/\\n/g, " ").replace(/\\,/g, ",") : "";
  };

  for (const block of blocks) {
    const summary = getField(block, "SUMMARY");
    const location = getField(block, "LOCATION");
    const status = getField(block, "STATUS");
    const dtstart = getField(block, "DTSTART");
    let date = dtstart;
    if (/^\d{8}$/.test(dtstart)) {
      date = `${dtstart.slice(0, 4)}-${dtstart.slice(4, 6)}-${dtstart.slice(6, 8)} (all-day)`;
    } else if (/^\d{8}T\d{6}Z$/.test(dtstart)) {
      date = `${dtstart.slice(0, 4)}-${dtstart.slice(4, 6)}-${dtstart.slice(6, 8)} ${dtstart.slice(9, 11)}:${dtstart.slice(11, 13)} CT`;
    }
    rows.push({ Date: date, Summary: summary, Location: location, Status: status });
  }

  mkdirSync(path.dirname(csvPath), { recursive: true });
  const esc = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
  const lines = ["Date,Summary,Location,Status", ...rows.map((r) => [r.Date, r.Summary, r.Location, r.Status].map(esc).join(","))];
  writeFileSync(csvPath, `${lines.join("\n")}\n`, "utf8");
}

export async function suggestPhotoEvidenceAiAction(
  photoId: string,
  mode?: string,
): Promise<{
  ok: boolean;
  message: string;
  suggestion?: import("@/lib/campaign-media/evidence-ai-types").EvidenceAiSuggestion;
  mode?: import("@/lib/campaign-media/evidence-ai-modes").EvidenceAiMode;
  toolCount?: number;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const photo = listCampaignPhotosLive().find((p) => p.id === photoId);
  if (!photo) return { ok: false, message: `Photo not found: ${photoId}` };
  const overlay = loadPhotoEvidenceStore().photos[photoId] ?? null;
  const { suggestPhotoEvidenceWithAi } = await import("@/lib/campaign-media/evidence-ai-suggest");
  const result = await suggestPhotoEvidenceWithAi({ photo, overlay, mode });
  if (!result.ok) return { ok: false, message: result.error };
  return {
    ok: true,
    message: `AI suggestion [${result.mode} · ${result.toolCount} tools] (${result.suggestion.confidence}): ${result.suggestion.rationale || "review fields"}`,
    suggestion: result.suggestion,
    mode: result.mode,
    toolCount: result.toolCount,
  };
}

export async function clusterPhotoSelectionAction(photoIds: string[]): Promise<{
  ok: boolean;
  message: string;
  result?: import("@/lib/campaign-media/cluster-photo-selection").PhotoSelectionClusterResult;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const ids = [...new Set(photoIds.map((id) => String(id).trim()).filter(Boolean))].slice(0, 80);
  if (ids.length < 1) return { ok: false, message: "No photo ids." };

  const live = listCampaignPhotosLive();
  const store = loadPhotoEvidenceStore();
  const { clusterPhotoSelection } = await import("@/lib/campaign-media/cluster-photo-selection");
  const inputs = ids.map((id) => {
    const photo = live.find((p) => p.id === id);
    const overlay = store.photos[id] ?? null;
    return {
      id,
      src: photo?.src,
      caption: photo?.accessibility.caption,
      county: overlay?.county ?? photo?.campaign.county,
      city: overlay?.city ?? photo?.campaign.city,
      venue: overlay?.venue ?? photo?.campaign.venue,
      eventDate: overlay?.eventDate ?? photo?.campaign.eventDate,
      eventName: overlay?.eventName ?? photo?.campaign.eventName,
      filename: photo?.basic.originalFilename,
    };
  });
  const result = clusterPhotoSelection(inputs);
  return { ok: true, message: result.summary, result };
}

export async function suggestBatchPhotoEvidenceAiAction(
  photoIds: string[],
  mode?: string,
): Promise<{
  ok: boolean;
  message: string;
  proposal?: import("@/lib/campaign-media/evidence-ai-types").BatchPhotoAiProposal;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const ids = [...new Set(photoIds.map((id) => String(id).trim()).filter(Boolean))].slice(0, 24);
  if (ids.length < 2) return { ok: false, message: "Select at least 2 photos for batch AI suggest." };

  const live = listCampaignPhotosLive();
  const store = loadPhotoEvidenceStore();
  const photos = ids.map((id) => {
    const photo = live.find((p) => p.id === id);
    if (!photo) return null;
    return { photo, overlay: store.photos[id] ?? null };
  });
  const missing = photos.map((p, i) => (p ? null : ids[i])).filter(Boolean);
  if (missing.length) {
    return { ok: false, message: `Unknown photo id(s): ${missing.slice(0, 5).join(", ")}` };
  }

  const { suggestBatchPhotoEvidenceWithAi } = await import("@/lib/campaign-media/evidence-ai-suggest");
  const result = await suggestBatchPhotoEvidenceWithAi({
    photos: photos as Array<{
      photo: (typeof live)[number];
      overlay: (typeof store.photos)[string] | null;
    }>,
    mode,
  });
  if (!result.ok) return { ok: false, message: result.error };
  const p = result.proposal;
  return {
    ok: true,
    message: `Batch proposal (${p.shared.confidence}) for ${p.photoIds.length} stills — review before apply. ${p.clusterSummary}`,
    proposal: p,
  };
}

export async function suggestSpeechEvidenceAiAction(
  speechId: string,
  mode?: string,
): Promise<{
  ok: boolean;
  message: string;
  suggestion?: import("@/lib/campaign-media/evidence-ai-types").EvidenceAiSuggestion;
  mode?: import("@/lib/campaign-media/evidence-ai-modes").EvidenceAiMode;
  toolCount?: number;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { CAMPAIGN_MEDIA_REGISTRY } = await import("@/content/media/campaign-media-registry");
  const media = CAMPAIGN_MEDIA_REGISTRY.find((m) => m.id === speechId);
  if (!media) return { ok: false, message: `Speech not found: ${speechId}` };
  const overlay = loadSpeechEvidenceStore().speeches[speechId] ?? null;
  const { suggestSpeechEvidenceWithAi } = await import("@/lib/campaign-media/evidence-ai-suggest");
  const result = await suggestSpeechEvidenceWithAi({ media, overlay, mode });
  if (!result.ok) return { ok: false, message: result.error };
  return {
    ok: true,
    message: `AI suggestion [${result.mode} · ${result.toolCount} tools] (${result.suggestion.confidence}): ${result.suggestion.rationale || "review fields"}`,
    suggestion: result.suggestion,
    mode: result.mode,
    toolCount: result.toolCount,
  };
}

/** Magical Command Center — freeform cross-surface plan (Prefer Unknown). */
export async function runEvidenceAiCommandAction(prompt: string): Promise<{
  ok: boolean;
  message: string;
  result?: import("@/lib/campaign-media/evidence-ai-command").EvidenceCommandResult;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { runEvidenceAiCommand } = await import("@/lib/campaign-media/evidence-ai-command");
  const out = await runEvidenceAiCommand({ prompt });
  if (!out.ok) return { ok: false, message: out.error };
  return {
    ok: true,
    message: out.result.headline,
    result: out.result,
  };
}

export async function rankEvidenceNextActionsAction(limit?: number): Promise<{
  ok: boolean;
  message: string;
  result?: ReturnType<typeof import("@/lib/campaign-media/evidence-next-actions").rankEvidenceNextActions>;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { rankEvidenceNextActions } = await import("@/lib/campaign-media/evidence-next-actions");
  const result = rankEvidenceNextActions(limit ?? 5);
  return {
    ok: true,
    message: `Next ${result.actions.length} action(s) ranked.`,
    result,
  };
}

export async function proposeEventNightPackAction(calendarRowId: string): Promise<{
  ok: boolean;
  message: string;
  pack?: import("@/lib/campaign-media/evidence-event-night-pack").EventNightPack;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { proposeEventNightPack } = await import("@/lib/campaign-media/evidence-event-night-pack");
  const pack = proposeEventNightPack({ calendarRowId });
  if ("ok" in pack && pack.ok === false) return { ok: false, message: pack.error };
  const p = pack as import("@/lib/campaign-media/evidence-event-night-pack").EventNightPack;
  return {
    ok: true,
    message: `Event-night pack (${p.matchQuality}): ${p.photos.length} photo(s), ${p.speeches.length} speech(es).`,
    pack: p,
  };
}

export async function suggestCalendarPresenceAiAction(rowId: string): Promise<{
  ok: boolean;
  message: string;
  suggestion?: import("@/lib/campaign-media/evidence-calendar-ai").CalendarPresenceSuggestion;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { suggestCalendarPresenceFields } = await import("@/lib/campaign-media/evidence-calendar-ai");
  const suggestion = suggestCalendarPresenceFields(rowId);
  if ("ok" in suggestion && suggestion.ok === false) return { ok: false, message: suggestion.error };
  const s = suggestion as import("@/lib/campaign-media/evidence-calendar-ai").CalendarPresenceSuggestion;
  return {
    ok: true,
    message: `Calendar AI (${s.confidence}): ${s.rationale}`,
    suggestion: s,
  };
}

export async function buildPhotoMetadataPacketAction(
  photoId: string,
  operatorConfirmedGeography: boolean,
): Promise<{ ok: boolean; message: string; relativePath?: string }> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const photo = listCampaignPhotosLive().find((p) => p.id === photoId);
  if (!photo) return { ok: false, message: `Photo not found: ${photoId}` };
  const overlay = loadPhotoEvidenceStore().photos[photoId] ?? null;
  const { buildPhotoOutgoingMetadataPacket } = await import("@/lib/campaign-media/evidence-ai-packets");
  const result = await buildPhotoOutgoingMetadataPacket({ photo, overlay, operatorConfirmedGeography });
  if (!result.ok) return { ok: false, message: result.error };
  return {
    ok: true,
    message: `Wrote intelligence packet ${result.packet.packetId} → ${result.relativePath}`,
    relativePath: result.relativePath,
  };
}

export async function buildSpeechMetadataPacketAction(
  speechId: string,
  operatorConfirmedGeography: boolean,
): Promise<{ ok: boolean; message: string; relativePath?: string }> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { CAMPAIGN_MEDIA_REGISTRY } = await import("@/content/media/campaign-media-registry");
  const media = CAMPAIGN_MEDIA_REGISTRY.find((m) => m.id === speechId);
  if (!media) return { ok: false, message: `Speech not found: ${speechId}` };
  const overlay = loadSpeechEvidenceStore().speeches[speechId] ?? null;
  const { buildSpeechOutgoingMetadataPacket } = await import("@/lib/campaign-media/evidence-ai-packets");
  const result = await buildSpeechOutgoingMetadataPacket({ media, overlay, operatorConfirmedGeography });
  if (!result.ok) return { ok: false, message: result.error };
  return {
    ok: true,
    message: `Wrote intelligence packet ${result.packet.packetId} → ${result.relativePath}`,
    relativePath: result.relativePath,
  };
}

export async function refreshCountyAlbumsAction(
  materializeFolders = true,
): Promise<{ ok: boolean; message: string }> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  try {
    const { refreshCountyAlbumIndex } = await import("@/lib/campaign-media/refresh-county-albums");
    const store = loadPhotoEvidenceStore();
    const result = refreshCountyAlbumIndex({
      materializeFolders,
      photos: listCampaignPhotosLive(store),
      photoStore: store,
    });
    revalidateEvidenceSurfaces();
    return {
      ok: true,
      message:
        `County albums refreshed: ${result.countyCount} counties, ${result.photoCount} photos` +
        (materializeFolders ? `, ${result.foldersWritten} files copied` : "") +
        (result.missingSources ? `, ${result.missingSources} missing source(s)` : ""),
    };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Album refresh failed." };
  }
}

export async function listPhotoIngestCandidatesAction(): Promise<{
  ok: boolean;
  message: string;
  candidates?: ReturnType<typeof listDiskPhotoIngestCandidates>;
  status?: import("@/lib/campaign-media/photo-ingest").PhotoIntakeStatus;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { getPhotoIntakeStatus } = await import("@/lib/campaign-media/photo-ingest");
  const candidates = listDiskPhotoIngestCandidates();
  const status = getPhotoIntakeStatus();
  const fresh = candidates.filter((c) => !c.alreadyInRegistry && !c.alreadyInDrafts);
  return {
    ok: true,
    message: status.nextStepLabel || `${fresh.length} new on disk · ${status.queueCount} in queue.`,
    candidates,
    status,
  };
}

export async function intakeAllPhotosAction(): Promise<{
  ok: boolean;
  message: string;
  ids?: string[];
  flattened?: number;
  queued?: number;
  status?: import("@/lib/campaign-media/photo-ingest").PhotoIntakeStatus;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { intakeAllNewCampaignPhotos, getPhotoIntakeStatus } = await import(
    "@/lib/campaign-media/photo-ingest"
  );
  const result = intakeAllNewCampaignPhotos();
  revalidatePath("/admin/evidence-workbench");
  revalidatePath("/campaign-photos");
  return {
    ok: result.ok,
    message: result.message,
    ids: result.ids,
    flattened: result.flattened,
    queued: result.queued,
    status: getPhotoIntakeStatus(),
  };
}

export async function getEvidencePublishQueueAction(): Promise<{
  ok: boolean;
  message: string;
  queue?: import("@/lib/campaign-media/evidence-publish-queue").EvidencePublishQueue;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { buildEvidencePublishQueue } = await import("@/lib/campaign-media/evidence-publish-queue");
  const queue = buildEvidencePublishQueue();
  return {
    ok: true,
    message: `Queue · ${queue.totals.unknownCounty} unknown · ${queue.totals.needsApproval} need approval · ${queue.totals.approvedPublic} approved`,
    queue,
  };
}

export async function refreshEvidenceDensitySnapshotAction(input?: {
  updateDensityDoc?: boolean;
  evening?: { publishedToday?: string; createdNotPublished?: string; note?: string };
}): Promise<{
  ok: boolean;
  message: string;
  snapshot?: import("@/lib/campaign-media/evidence-density-snapshot").EvidenceDensitySnapshot;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { refreshEvidenceDensitySnapshot } = await import(
    "@/lib/campaign-media/evidence-density-snapshot"
  );
  const snapshot = refreshEvidenceDensitySnapshot({
    updateDensityDoc: input?.updateDensityDoc !== false,
    evening: input?.evening,
  });
  revalidatePath("/admin/evidence-workbench");
  return {
    ok: true,
    message: `Density snapshot · unknown ${snapshot.queue.totals.unknownCounty} · counties ${snapshot.queue.confirmedCounties.length} · ${snapshot.densityDocNote}`,
    snapshot,
  };
}

export async function runPublishQueueTurboAction(input: {
  confirm: boolean;
  useAi?: boolean;
  maxPhotos?: number;
}): Promise<{
  ok: boolean;
  message: string;
  proposalIds?: string[];
  queue?: import("@/lib/campaign-media/evidence-publish-queue").EvidencePublishQueue;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  if (!input.confirm) {
    return { ok: false, message: "confirm:true required — refuse silent publish-queue turbo." };
  }
  const { publishQueueTurboTargetIds, buildEvidencePublishQueue } = await import(
    "@/lib/campaign-media/evidence-publish-queue"
  );
  const { runTurboIngest } = await import("@/lib/campaign-media/turbo-ingest");
  const photoIds = publishQueueTurboTargetIds(input.maxPhotos ?? 24);
  if (!photoIds.length) {
    return {
      ok: true,
      message: "Publish queue turbo: no Unknown/draft targets.",
      proposalIds: [],
      queue: buildEvidencePublishQueue(),
    };
  }
  const result = await runTurboIngest({
    intakeFirst: false,
    useAi: input.useAi !== false,
    maxPhotos: photoIds.length,
    photoIds,
  });
  revalidatePath("/admin/evidence-workbench");
  return {
    ok: result.ok,
    message: `${result.message} · targets ${photoIds.length}`,
    proposalIds: result.proposalIds,
    queue: buildEvidencePublishQueue(),
  };
}

export async function buildEvidenceShipReportAction(input?: {
  persist?: boolean;
  includeDerivativeScan?: boolean;
}): Promise<{
  ok: boolean;
  message: string;
  report?: import("@/lib/campaign-media/evidence-ship-report").EvidenceShipReport;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { buildEvidenceShipReport } = await import("@/lib/campaign-media/evidence-ship-report");
  const report = buildEvidenceShipReport({
    persist: input?.persist !== false,
    includeDerivativeScan: input?.includeDerivativeScan !== false,
  });
  revalidatePath("/admin/evidence-workbench");
  return {
    ok: true,
    message: `Ship report · ${report.totals.overlayJsonDirty} overlay dirty · ${report.totals.photoBinaryDirty} photo dirty · ${report.totals.derivativeLocalOnly} deriv local-only · ready=${report.checklistReady}`,
    report,
  };
}

export async function writeRegistryGraduationStubAction(input?: {
  onlyReady?: boolean;
}): Promise<{
  ok: boolean;
  message: string;
  relativePath?: string;
  candidateCount?: number;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { writeRegistryGraduationStub } = await import("@/lib/campaign-media/evidence-ship-report");
  const result = writeRegistryGraduationStub({ onlyReady: input?.onlyReady !== false });
  revalidatePath("/admin/evidence-workbench");
  return result;
}

export async function proposeCuratedPlacementAction(input?: {
  allowHero?: boolean;
  galleryMax?: number;
  acrossMax?: number;
  persist?: boolean;
}): Promise<{
  ok: boolean;
  message: string;
  proposal?: import("@/lib/campaign-media/curated-placement-types").CuratedPlacementProposal;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { proposeCuratedPlacement } = await import("@/lib/campaign-media/curated-placement-propose");
  const { writeCuratedPlacementStub } = await import("@/lib/campaign-media/curated-placement-apply");
  const proposal = proposeCuratedPlacement({
    allowHero: Boolean(input?.allowHero),
    galleryMax: input?.galleryMax,
    acrossMax: input?.acrossMax,
    persist: input?.persist !== false,
  });
  writeCuratedPlacementStub(proposal);
  revalidatePath("/admin/evidence-workbench");
  return {
    ok: true,
    message: `Placement proposed ${proposal.id} · gallery ${
      proposal.diffs.find((d) => d.surface === "homepageGallery")?.proposed.length ?? 0
    } · across ${proposal.diffs.find((d) => d.surface === "acrossArkansas")?.proposed.length ?? 0}`,
    proposal,
  };
}

export async function listCuratedPlacementProposalsAction(): Promise<{
  ok: boolean;
  message: string;
  proposals?: import("@/lib/campaign-media/curated-placement-types").CuratedPlacementProposal[];
  current?: ReturnType<
    typeof import("@/lib/campaign-media/curated-placement-propose").getCurrentCuratedPlacementSnapshot
  >;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { loadCuratedPlacementStore } = await import("@/lib/campaign-media/curated-placement-store");
  const { getCurrentCuratedPlacementSnapshot } = await import(
    "@/lib/campaign-media/curated-placement-propose"
  );
  const proposals = loadCuratedPlacementStore().proposals;
  return {
    ok: true,
    message: `${proposals.length} placement proposal(s)`,
    proposals,
    current: getCurrentCuratedPlacementSnapshot(),
  };
}

export async function writeCuratedPlacementStubAction(input: {
  proposalId: string;
}): Promise<{ ok: boolean; message: string; relativePath?: string }> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { getCuratedPlacementProposal } = await import("@/lib/campaign-media/curated-placement-store");
  const { writeCuratedPlacementStub } = await import("@/lib/campaign-media/curated-placement-apply");
  const proposal = getCuratedPlacementProposal(input.proposalId);
  if (!proposal) return { ok: false, message: "Proposal not found." };
  return writeCuratedPlacementStub(proposal);
}

export async function applyCuratedPlacementAction(input: {
  proposalId: string;
  confirmCurate: boolean;
}): Promise<{
  ok: boolean;
  message: string;
  undoSnapshotId?: string;
  warnings?: string[];
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  if (!input.confirmCurate) {
    return { ok: false, message: "confirmCurate:true required — refuse silent HOMEPAGE_* mutate." };
  }
  const { applyCuratedPlacementProposal } = await import(
    "@/lib/campaign-media/curated-placement-apply"
  );
  const result = applyCuratedPlacementProposal({
    proposalId: String(input.proposalId ?? "").trim(),
    confirmCurate: true,
  });
  revalidatePath("/admin/evidence-workbench");
  revalidatePath("/");
  return result;
}

export async function undoCuratedPlacementAction(input: {
  undoSnapshotId: string;
  confirmCurate: boolean;
}): Promise<{ ok: boolean; message: string }> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  if (!input.confirmCurate) {
    return { ok: false, message: "confirmCurate:true required — refuse silent undo." };
  }
  const { undoCuratedPlacement } = await import("@/lib/campaign-media/curated-placement-apply");
  const result = undoCuratedPlacement({
    undoSnapshotId: String(input.undoSnapshotId ?? "").trim(),
    confirmCurate: true,
  });
  revalidatePath("/admin/evidence-workbench");
  revalidatePath("/");
  return result;
}

export async function runTurboIngestAction(input?: {
  intakeFirst?: boolean;
  useAi?: boolean;
  maxPhotos?: number;
  photoIds?: string[];
}): Promise<{
  ok: boolean;
  message: string;
  proposalIds?: string[];
  inventorySummary?: string;
  dashboard?: ReturnType<
    typeof import("@/lib/campaign-media/turbo-ingest").getTurboIngestDashboard
  >;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { runTurboIngest, getTurboIngestDashboard } = await import(
    "@/lib/campaign-media/turbo-ingest"
  );
  const result = await runTurboIngest({
    intakeFirst: Boolean(input?.intakeFirst),
    useAi: input?.useAi !== false,
    maxPhotos: input?.maxPhotos,
    photoIds: input?.photoIds,
  });
  revalidatePath("/admin/evidence-workbench");
  return {
    ok: result.ok,
    message: `${result.message} · ${result.inventorySummary}`,
    proposalIds: result.proposalIds,
    inventorySummary: result.inventorySummary,
    dashboard: getTurboIngestDashboard(),
  };
}

export async function getTurboIngestDashboardAction(): Promise<{
  ok: boolean;
  message: string;
  dashboard?: ReturnType<
    typeof import("@/lib/campaign-media/turbo-ingest").getTurboIngestDashboard
  >;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { getTurboIngestDashboard } = await import("@/lib/campaign-media/turbo-ingest");
  const dashboard = getTurboIngestDashboard();
  return {
    ok: true,
    message: `${dashboard.pending} pending turbo proposal(s)`,
    dashboard,
  };
}

export async function getTurboProposalAction(photoId: string): Promise<{
  ok: boolean;
  message: string;
  proposal?: import("@/lib/campaign-media/turbo-ingest-types").TurboPhotoProposal | null;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { getTurboProposal } = await import("@/lib/campaign-media/turbo-ingest-store");
  const proposal = getTurboProposal(String(photoId ?? "").trim());
  return {
    ok: true,
    message: proposal ? `Turbo proposal for ${photoId}` : `No turbo proposal for ${photoId}`,
    proposal,
  };
}

export async function applyTurboProposalAction(input: {
  photoId: string;
  applyIdentify?: boolean;
  applyFitFlags?: boolean;
}): Promise<{ ok: boolean; message: string }> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { applyTurboProposal } = await import("@/lib/campaign-media/turbo-ingest");
  const result = applyTurboProposal({
    photoId: input.photoId,
    applyIdentify: Boolean(input.applyIdentify),
    applyFitFlags: Boolean(input.applyFitFlags),
    markApplied: true,
  });
  if (result.ok) revalidateEvidenceSurfaces();
  return result;
}

/** Alias — intake one path (nested OK: flatten + queue). */
export async function promotePhotoIngestAction(
  filename: string,
): Promise<{ ok: boolean; message: string; photoId?: string }> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { intakeOneCampaignPhoto } = await import("@/lib/campaign-media/photo-ingest");
  const result = intakeOneCampaignPhoto(filename);
  if (!result.ok) return { ok: false, message: result.error };
  revalidatePath("/admin/evidence-workbench");
  return {
    ok: true,
    message: `Queued ${result.photo.id}` + (result.flattened ? " (flattened nested copy)" : "") + ". Open Photos to label.",
    photoId: result.photo.id,
  };
}

/** Alias for intakeAllPhotosAction (legacy name). */
export async function promoteAllPhotoIngestAction(): Promise<{
  ok: boolean;
  message: string;
  ids?: string[];
}> {
  const res = await intakeAllPhotosAction();
  return { ok: res.ok, message: res.message, ids: res.ids };
}

export async function inspectPhotoPixelsAction(photoId: string): Promise<{
  ok: boolean;
  message: string;
  inspect?: import("@/lib/campaign-media/media-derivatives").PhotoPixelInspect;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { inspectPhotoPixels } = await import("@/lib/campaign-media/media-derivatives");
  const inspect = await inspectPhotoPixels({ photoId });
  if (!inspect.found) return { ok: false, message: inspect.reason ?? "Inspect failed." };
  return {
    ok: true,
    message: `${inspect.width}×${inspect.height} ${inspect.format} · ${inspect.bytes} bytes · orient ${inspect.orientation ?? "n/a"}`,
    inspect,
  };
}

export async function createPhotoDerivativeAction(
  photoId: string,
  kind: string,
  opts?: { focusX?: number; focusY?: number },
): Promise<{
  ok: boolean;
  message: string;
  publicSrc?: string;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { createPhotoDerivative, BATCH_DERIVATIVE_KINDS } = await import(
    "@/lib/campaign-media/media-derivatives"
  );
  const allowed = new Set<string>(BATCH_DERIVATIVE_KINDS);
  if (!allowed.has(kind)) return { ok: false, message: `Unsupported kind: ${kind}` };
  const result = await createPhotoDerivative({
    photoId,
    kind: kind as (typeof BATCH_DERIVATIVE_KINDS)[number],
    focusX: opts?.focusX,
    focusY: opts?.focusY,
  });
  if (!result.ok) return { ok: false, message: result.error };
  return {
    ok: true,
    message: `Wrote ${result.record.kind} → ${result.record.publicSrc} (${result.record.width}×${result.record.height})`,
    publicSrc: result.record.publicSrc,
  };
}

export async function savePhotoFocusAction(input: {
  photoId: string;
  focusX: number;
  focusY: number;
  cropAdviceNote?: string;
}): Promise<{ ok: boolean; message: string }> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const photoId = String(input.photoId ?? "").trim();
  if (!photoId) return { ok: false, message: "photoId required." };
  const { normalizeFocus } = await import("@/lib/campaign-media/focus-crop");
  const focus = normalizeFocus({ x: input.focusX, y: input.focusY });
  if (!focus) return { ok: false, message: "Invalid focus point." };

  const store = loadPhotoEvidenceStore();
  const prev = store.photos[photoId] ?? {};
  store.photos[photoId] = {
    ...prev,
    focusX: focus.x,
    focusY: focus.y,
    cropAdviceNote: input.cropAdviceNote?.trim() || prev.cropAdviceNote,
    updatedAt: new Date().toISOString(),
  };
  savePhotoEvidenceStore(store);
  revalidatePath("/admin/evidence-workbench");
  return {
    ok: true,
    message: `Saved focus ${Math.round(focus.x * 100)}%, ${Math.round(focus.y * 100)}% for ${photoId}.`,
  };
}

export async function createDerivativeFromCropAdviceAction(input: {
  photoId: string;
  cropAdvice: string;
  focusX?: number;
  focusY?: number;
}): Promise<{ ok: boolean; message: string; publicSrc?: string }> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { createDerivativeFromCropAdvice } = await import("@/lib/campaign-media/media-derivatives");
  const result = await createDerivativeFromCropAdvice(input);
  if (!result.ok) return { ok: false, message: result.error };

  // Persist crop advice + focus on overlay for reuse.
  const store = loadPhotoEvidenceStore();
  const prev = store.photos[input.photoId] ?? {};
  store.photos[input.photoId] = {
    ...prev,
    cropAdviceNote: input.cropAdvice.trim(),
    focusX: result.record.focusX ?? prev.focusX,
    focusY: result.record.focusY ?? prev.focusY,
    updatedAt: new Date().toISOString(),
  };
  savePhotoEvidenceStore(store);
  revalidatePath("/admin/evidence-workbench");

  return {
    ok: true,
    message: `${result.reason} → ${result.mappedKind} → ${result.record.publicSrc}`,
    publicSrc: result.record.publicSrc,
  };
}

export async function batchCreatePhotoDerivativesAction(input: {
  photoIds: string[];
  kinds: string[];
}): Promise<{
  ok: boolean;
  message: string;
  createdCount?: number;
  errorCount?: number;
  totalOps?: number;
  batchRunId?: string;
  errors?: Array<{ photoId: string; kind: string; error: string }>;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { batchCreatePhotoDerivatives } = await import("@/lib/campaign-media/media-derivatives");
  const result = await batchCreatePhotoDerivatives({
    photoIds: input.photoIds,
    kinds: input.kinds,
    note: "evidence-workbench-batch",
  });
  return {
    ok: result.ok,
    message: result.message,
    createdCount: result.createdCount,
    errorCount: result.errorCount,
    totalOps: result.totalOps,
    batchRunId: result.batchRunId,
    errors: result.errors.slice(0, 12),
  };
}

export async function promotePhotoDerivativeAction(input: {
  photoId: string;
  derivativeId?: string;
  publicSrc?: string;
  setAsPublicSrc?: boolean;
  homepageCandidate?: boolean;
  featuredPhoto?: boolean;
  heroLevel?: string;
  approvedForPublic?: boolean;
  consentConfirmed?: boolean;
}): Promise<{
  ok: boolean;
  message: string;
  placementPreview?: string[];
  publicSrc?: string;
  registrySrc?: string;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { promotePhotoDerivative } = await import("@/lib/campaign-media/promote-photo-derivative");
  const result = promotePhotoDerivative(input);
  if (result.ok) revalidateEvidenceSurfaces();
  return {
    ok: result.ok,
    message: result.message,
    placementPreview: result.placementPreview,
    publicSrc: result.publicSrc,
    registrySrc: result.registrySrc,
  };
}

export async function clearPhotoPublicSrcOverrideAction(photoId: string): Promise<{
  ok: boolean;
  message: string;
  placementPreview?: string[];
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { clearPhotoPublicSrcOverride } = await import("@/lib/campaign-media/promote-photo-derivative");
  const result = clearPhotoPublicSrcOverride(photoId);
  if (result.ok) revalidateEvidenceSurfaces();
  return {
    ok: result.ok,
    message: result.message,
    placementPreview: result.placementPreview,
  };
}

export async function previewPromotePlacementAction(input: {
  photoId: string;
  homepageCandidate?: boolean;
  featuredPhoto?: boolean;
  heroLevel?: string;
  approvedForPublic?: boolean;
  publicSrcOverride?: string;
}): Promise<{
  ok: boolean;
  message: string;
  placementPreview?: string[];
  hypotheticalSrc?: string;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { previewPromotePlacement } = await import("@/lib/campaign-media/promote-photo-derivative");
  const result = previewPromotePlacement(input);
  if (!result.ok) return { ok: false, message: result.error };
  return {
    ok: true,
    message: `Placement preview · src ${result.hypotheticalSrc}`,
    placementPreview: result.placementPreview,
    hypotheticalSrc: result.hypotheticalSrc,
  };
}

export async function listPhotoDerivativesAction(photoId: string): Promise<{
  ok: boolean;
  message: string;
  derivatives?: import("@/lib/campaign-media/media-derivatives").PhotoDerivativeRecord[];
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { listPhotoDerivatives } = await import("@/lib/campaign-media/media-derivatives");
  const derivatives = listPhotoDerivatives(photoId);
  return {
    ok: true,
    message: `${derivatives.length} derivative(s) on disk`,
    derivatives,
  };
}

export async function suggestCropPlanAction(photoId: string): Promise<{
  ok: boolean;
  message: string;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { suggestCropPlan } = await import("@/lib/campaign-media/media-derivatives");
  const result = await suggestCropPlan(photoId);
  if (!result.ok) return { ok: false, message: result.error };
  const lines = result.plan.recommended.map((r) => `• ${r.kind}: ${r.why}`);
  return {
    ok: true,
    message: `Crop plan ${result.plan.width}×${result.plan.height}\n${lines.join("\n")}`,
  };
}

export async function planVideoExcerptAction(
  youtubeVideoId: string,
  query?: string,
): Promise<{
  ok: boolean;
  message: string;
  plan?: import("@/lib/campaign-media/media-derivatives").VideoExcerptPlan;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { planVideoExcerpt } = await import("@/lib/campaign-media/media-derivatives");
  const result = planVideoExcerpt({ youtubeVideoId, query: query?.trim() || undefined, maxClips: 4 });
  if (!result.ok) return { ok: false, message: result.error };
  const lines = result.plan.clips.map(
    (c, i) =>
      `${i + 1}. ${c.startSeconds}s–${c.endSeconds}s — ${c.title}\n   ${c.reason}`,
  );
  return {
    ok: true,
    message: `Excerpt plan (${result.plan.clips.length} clips)\n${lines.join("\n")}\n${result.plan.tooling.note}`,
    plan: result.plan,
  };
}

export async function probeVideoToolingAction(): Promise<{
  ok: boolean;
  message: string;
  tooling?: import("@/lib/campaign-media/ffmpeg-tooling").FfmpegToolingReport;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { probeVideoTooling } = await import("@/lib/campaign-media/ffmpeg-tooling");
  const tooling = probeVideoTooling();
  return {
    ok: tooling.ffmpegAvailable,
    message: `${tooling.note}${tooling.ffmpegVersion ? `\n${tooling.ffmpegVersion}` : ""}`,
    tooling,
  };
}

export async function probeLocalVideoAction(input: {
  speechId?: string;
  youtubeVideoId?: string;
  localPublicSrc?: string;
  startSeconds?: number;
  endSeconds?: number;
}): Promise<{
  ok: boolean;
  message: string;
  probe?: import("@/lib/campaign-media/media-derivatives-types").LocalVideoProbeResult;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { probeLocalVideo } = await import("@/lib/campaign-media/media-derivatives");
  const probe = probeLocalVideo(input);
  if (!probe.ok) return { ok: false, message: probe.error ?? "Probe failed.", probe };
  const clip = probe.clipWindow
    ? `\nClip ${probe.clipWindow.startSeconds}s–${probe.clipWindow.endSeconds}s ${
        probe.clipWindow.inBounds ? "in bounds" : "OUT OF BOUNDS"
      }`
    : "";
  return {
    ok: true,
    message: `Probe OK · ${probe.width ?? "?"}×${probe.height ?? "?"} · ${
      probe.durationSeconds != null ? `${probe.durationSeconds.toFixed(1)}s` : "?"
    } · ${probe.videoCodec ?? "?"} / ${probe.audioCodec ?? "?"}${clip}`,
    probe,
  };
}

export async function extractVideoPosterAction(input: {
  speechId: string;
  youtubeVideoId?: string;
  localPublicSrc?: string;
  atSeconds?: number;
}): Promise<{
  ok: boolean;
  message: string;
  publicSrc?: string;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const speechId = String(input.speechId ?? "").trim();
  if (!speechId) return { ok: false, message: "speechId required." };
  const { extractLocalVideoPoster } = await import("@/lib/campaign-media/media-derivatives");
  const result = extractLocalVideoPoster({
    outId: speechId,
    speechId,
    youtubeVideoId: input.youtubeVideoId,
    localPublicSrc: input.localPublicSrc,
    atSeconds: input.atSeconds,
  });
  if (!result.ok) return { ok: false, message: result.error };
  revalidatePath("/admin/evidence-workbench");
  return {
    ok: true,
    message: `Poster @ ${result.record.atSeconds}s → ${result.publicSrc}`,
    publicSrc: result.publicSrc,
  };
}

export async function listLocalVideoMastersAction(): Promise<{
  ok: boolean;
  message: string;
  masters?: Array<{ filename: string; root: string; publicSrc: string | null; bytes: number }>;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { listLocalVideoMasters } = await import("@/lib/campaign-media/local-video-masters");
  const masters = listLocalVideoMasters().map((m) => ({
    filename: m.filename,
    root: m.root,
    publicSrc: m.publicSrc,
    bytes: m.bytes,
  }));
  return {
    ok: true,
    message: masters.length
      ? `${masters.length} local master(s) found`
      : "No local masters yet — drop .mp4 under public/media/campaign-video-masters/ or .local/video-masters/",
    masters,
  };
}

export async function listVideoClipsAction(outId: string): Promise<{
  ok: boolean;
  message: string;
  clips?: import("@/lib/campaign-media/media-derivatives-types").VideoClipRecord[];
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { listVideoClips } = await import("@/lib/campaign-media/media-derivatives");
  const clips = listVideoClips(outId);
  return {
    ok: true,
    message: clips.length ? `${clips.length} encoded clip(s)` : "No encoded clips yet for this speech.",
    clips,
  };
}

export async function encodeVideoExcerptAction(input: {
  speechId: string;
  youtubeVideoId?: string;
  planId?: string;
  clipIndex?: number;
  startSeconds?: number;
  endSeconds?: number;
  title?: string;
  quote?: string;
  localPublicSrc?: string;
  aspect?: "source" | "vertical_9x16";
}): Promise<{
  ok: boolean;
  message: string;
  clips?: import("@/lib/campaign-media/media-derivatives-types").VideoClipRecord[];
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const speechId = String(input.speechId ?? "").trim();
  if (!speechId) return { ok: false, message: "speechId required." };
  const aspect = input.aspect === "vertical_9x16" ? "vertical_9x16" : "source";

  const {
    encodeVideoExcerptClip,
    encodeVideoExcerptPlan,
  } = await import("@/lib/campaign-media/media-derivatives");

  if (typeof input.startSeconds === "number" && typeof input.endSeconds === "number") {
    const result = encodeVideoExcerptClip({
      outId: speechId,
      speechId,
      youtubeVideoId: input.youtubeVideoId,
      startSeconds: input.startSeconds,
      endSeconds: input.endSeconds,
      planId: input.planId,
      clipIndex: input.clipIndex ?? 0,
      title: input.title,
      quote: input.quote,
      localPublicSrc: input.localPublicSrc,
      aspect,
    });
    if (!result.ok) return { ok: false, message: result.error };
    revalidatePath("/admin/evidence-workbench");
    return {
      ok: true,
      message: `Encoded clip ${result.record.startSeconds}s–${result.record.endSeconds}s → ${result.publicSrc}`,
      clips: [result.record],
    };
  }

  const batch = encodeVideoExcerptPlan({
    outId: speechId,
    speechId,
    youtubeVideoId: input.youtubeVideoId,
    planId: input.planId,
    clipIndexes: typeof input.clipIndex === "number" ? [input.clipIndex] : undefined,
    localPublicSrc: input.localPublicSrc,
    aspect,
  });
  revalidatePath("/admin/evidence-workbench");
  return {
    ok: batch.ok,
    message: batch.message + (batch.errors[0] ? `\n${batch.errors[0].error}` : ""),
    clips: batch.created,
  };
}

export async function prepSpeechVideoPackageAction(input: {
  speechId: string;
  youtubeVideoId: string;
  query?: string;
  maxClips?: number;
  confirmEncode?: boolean;
  confirmPoster?: boolean;
  aspect?: "source" | "vertical_9x16";
}): Promise<{
  ok: boolean;
  message: string;
  packet?: import("@/lib/campaign-media/video-prep-package").VideoPrepPacket;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const speechId = String(input.speechId ?? "").trim();
  const youtubeVideoId = String(input.youtubeVideoId ?? "").trim();
  if (!speechId || !youtubeVideoId) {
    return { ok: false, message: "speechId and youtubeVideoId required." };
  }
  const { prepSpeechVideoPackage } = await import("@/lib/campaign-media/video-prep-package");
  const packet = prepSpeechVideoPackage({
    speechId,
    youtubeVideoId,
    query: input.query?.trim() || undefined,
    maxClips: input.maxClips,
    confirmEncode: Boolean(input.confirmEncode),
    confirmPoster: Boolean(input.confirmPoster),
    aspect: input.aspect === "vertical_9x16" ? "vertical_9x16" : "source",
  });
  revalidatePath("/admin/evidence-workbench");
  return { ok: packet.ok, message: packet.message, packet };
}

export async function proposeVideoEditProjectAction(input: {
  speechId: string;
  youtubeVideoId: string;
  planId?: string;
  maxClips?: number;
  transition?: "none" | "crossfade";
  look?: "neutral" | "warm" | "cool" | "contrast";
  captionMode?: "none" | "sidecar" | "burn_in";
  exportAspects?: Array<"source" | "vertical_9x16" | "square_1x1" | "landscape_16x9">;
  loudnorm?: boolean;
}): Promise<{
  ok: boolean;
  message: string;
  packet?: import("@/lib/campaign-media/video-edit-types").VideoEditDirectorPacket;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { proposeVideoEditProject } = await import("@/lib/campaign-media/video-edit-director");
  const packet = proposeVideoEditProject({
    speechId: String(input.speechId ?? "").trim(),
    youtubeVideoId: String(input.youtubeVideoId ?? "").trim(),
    planId: input.planId,
    maxClips: input.maxClips,
    transition: input.transition,
    look: input.look,
    captionMode: input.captionMode,
    exportAspects: input.exportAspects,
    loudnorm: input.loudnorm,
    persist: true,
  });
  revalidatePath("/admin/evidence-workbench");
  return { ok: packet.ok, message: packet.message, packet };
}

export async function proposePhotoEditProjectAction(input: {
  photoId: string;
  look?: "neutral" | "warm" | "cool" | "contrast" | "soft" | "punch" | "mono" | "film" | "bright" | "editorial";
  exportSlots?: Array<
    "grade_full" | "hero_16x9" | "portrait_4x5" | "square_1x1" | "story_9x16" | "web_max" | "thumb"
  >;
  useFocus?: boolean;
  focusX?: number;
  focusY?: number;
  sharpen?: boolean;
}): Promise<{
  ok: boolean;
  message: string;
  packet?: import("@/lib/campaign-media/photo-edit-types").PhotoEditDirectorPacket;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { proposePhotoEditProject } = await import("@/lib/campaign-media/photo-edit-director");
  const packet = await proposePhotoEditProject({
    photoId: String(input.photoId ?? "").trim(),
    look: input.look,
    exportSlots: input.exportSlots,
    useFocus: input.useFocus,
    focusX: input.focusX,
    focusY: input.focusY,
    sharpen: input.sharpen,
    persist: true,
  });
  revalidatePath("/admin/evidence-workbench");
  return { ok: packet.ok, message: packet.message, packet };
}

export async function listPhotoEditProjectsAction(photoId: string): Promise<{
  ok: boolean;
  message: string;
  projects?: import("@/lib/campaign-media/photo-edit-types").PhotoEditProject[];
  assemblies?: import("@/lib/campaign-media/photo-edit-types").PhotoAssemblyRecord[];
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { listPhotoEditProjects, listPhotoAssemblies } = await import(
    "@/lib/campaign-media/photo-edit-store"
  );
  const id = String(photoId ?? "").trim();
  const projects = listPhotoEditProjects(id);
  return {
    ok: true,
    message: `${projects.length} photo edit project(s)`,
    projects,
    assemblies: listPhotoAssemblies(id),
  };
}

export async function renderPhotoEditProjectAction(input: {
  projectId: string;
  confirmRender: boolean;
}): Promise<{
  ok: boolean;
  message: string;
  assemblies?: import("@/lib/campaign-media/photo-edit-types").PhotoAssemblyRecord[];
  warnings?: string[];
  promoteSuggestion?: string | null;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  if (!input.confirmRender) {
    return { ok: false, message: "confirmRender:true required — refuse silent photo pro render." };
  }
  const { renderPhotoEditProject } = await import("@/lib/campaign-media/photo-pro-render");
  const result = await renderPhotoEditProject({ projectId: String(input.projectId ?? "").trim() });
  revalidatePath("/admin/evidence-workbench");
  return {
    ok: result.ok,
    message: result.message,
    assemblies: result.assemblies,
    warnings: result.warnings,
    promoteSuggestion: result.promoteSuggestion ?? null,
  };
}

export async function updatePhotoEditProjectAction(input: {
  projectId: string;
  updates: Array<
    | {
        op: "set_meta";
        look?:
          | "neutral"
          | "warm"
          | "cool"
          | "contrast"
          | "soft"
          | "punch"
          | "mono"
          | "film"
          | "bright"
          | "editorial";
        sharpen?: boolean;
        useFocus?: boolean;
        focusX?: number;
        focusY?: number;
        exportSlots?: Array<
          "grade_full" | "hero_16x9" | "portrait_4x5" | "square_1x1" | "story_9x16" | "web_max" | "thumb"
        >;
        promoteSuggestion?:
          | "grade_full"
          | "hero_16x9"
          | "portrait_4x5"
          | "square_1x1"
          | "story_9x16"
          | "web_max"
          | "thumb"
          | null;
      }
    | {
        op: "set_slots";
        exportSlots: Array<
          "grade_full" | "hero_16x9" | "portrait_4x5" | "square_1x1" | "story_9x16" | "web_max" | "thumb"
        >;
      }
    | {
        op: "toggle_slot";
        slot: "grade_full" | "hero_16x9" | "portrait_4x5" | "square_1x1" | "story_9x16" | "web_max" | "thumb";
        enabled?: boolean;
      }
  >;
}): Promise<{
  ok: boolean;
  message: string;
  project?: import("@/lib/campaign-media/photo-edit-types").PhotoEditProject;
  warnings?: string[];
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { updatePhotoEditProject } = await import("@/lib/campaign-media/photo-edit-plan");
  const result = updatePhotoEditProject({
    projectId: String(input.projectId ?? "").trim(),
    updates: input.updates ?? [],
  });
  if (!result.ok) return { ok: false, message: result.error };
  revalidatePath("/admin/evidence-workbench");
  return {
    ok: true,
    message: result.message,
    project: result.project,
    warnings: result.warnings,
  };
}

export async function previewPhotoEditPackAction(input: {
  projectId: string;
  slot?: "grade_full" | "hero_16x9" | "portrait_4x5" | "square_1x1" | "story_9x16" | "web_max" | "thumb";
}): Promise<{
  ok: boolean;
  message: string;
  publicSrc?: string;
  slot?: string;
  previewNote?: string;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { previewPhotoEditPack } = await import("@/lib/campaign-media/photo-edit-preview");
  const result = await previewPhotoEditPack({
    projectId: String(input.projectId ?? "").trim(),
    slot: input.slot,
  });
  if (!result.ok) return { ok: false, message: result.error };
  return {
    ok: true,
    message: result.message,
    publicSrc: result.publicSrc,
    slot: result.slot,
    previewNote: result.previewNote,
  };
}

export async function softArchivePhotoAssembliesAction(input: {
  projectId?: string;
  photoId?: string;
  confirmArchive: boolean;
}): Promise<{ ok: boolean; message: string; archived?: number }> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  if (!input.confirmArchive) {
    return { ok: false, message: "confirmArchive:true required — refuse silent archive." };
  }
  const { softArchivePhotoAssemblies } = await import("@/lib/campaign-media/photo-edit-store");
  const result = softArchivePhotoAssemblies({
    projectId: input.projectId ? String(input.projectId).trim() : undefined,
    photoId: input.photoId ? String(input.photoId).trim() : undefined,
    confirmArchive: true,
  });
  if (!result.ok) return { ok: false, message: result.error };
  revalidatePath("/admin/evidence-workbench");
  return { ok: true, message: result.message, archived: result.archived };
}

export async function getPhotoReadinessMatrixAction(input?: {
  limit?: number;
  photoIds?: string[];
}): Promise<{
  ok: boolean;
  message: string;
  matrix?: import("@/lib/campaign-media/photo-readiness").PhotoReadinessMatrix;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { getPhotoReadinessMatrix } = await import("@/lib/campaign-media/photo-readiness");
  const matrix = getPhotoReadinessMatrix({
    limit: input?.limit,
    photoIds: input?.photoIds,
  });
  return {
    ok: true,
    message: `${matrix.total} still(s) · focus gap ${matrix.needsFocus} · Pro Edit gap ${matrix.needsProEdit} · promote gap ${matrix.needsPromote}`,
    matrix,
  };
}

export async function listVideoEditProjectsAction(speechId: string): Promise<{
  ok: boolean;
  message: string;
  projects?: import("@/lib/campaign-media/video-edit-types").VideoEditProject[];
  assemblies?: import("@/lib/campaign-media/video-edit-types").VideoAssemblyRecord[];
  captions?: import("@/lib/campaign-media/video-edit-types").VideoCaptionRecord[];
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const {
    listVideoEditProjects,
    listVideoAssemblies,
    listVideoCaptions,
  } = await import("@/lib/campaign-media/video-edit-store");
  const id = String(speechId ?? "").trim();
  const projects = listVideoEditProjects(id);
  return {
    ok: true,
    message: `${projects.length} edit project(s)`,
    projects,
    assemblies: listVideoAssemblies(id),
    captions: listVideoCaptions(id),
  };
}

export async function renderVideoEditProjectAction(input: {
  projectId: string;
  confirmRender: boolean;
}): Promise<{
  ok: boolean;
  message: string;
  assemblies?: import("@/lib/campaign-media/video-edit-types").VideoAssemblyRecord[];
  warnings?: string[];
  captionPublicSrc?: string | null;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  if (!input.confirmRender) {
    return { ok: false, message: "confirmRender:true required — refuse silent pro render." };
  }
  const { renderVideoEditProject } = await import("@/lib/campaign-media/video-pro-render");
  const result = renderVideoEditProject({ projectId: String(input.projectId ?? "").trim() });
  revalidatePath("/admin/evidence-workbench");
  return {
    ok: result.ok,
    message: result.message,
    assemblies: result.assemblies,
    warnings: result.warnings,
    captionPublicSrc: result.captionPublicSrc,
  };
}

export async function updateVideoEditCutListAction(input: {
  projectId: string;
  updates: Array<
    | { op: "reorder"; clipIds: string[] }
    | { op: "remove"; clipId: string }
    | { op: "trim"; clipId: string; startSeconds?: number; endSeconds?: number }
    | {
        op: "set_meta";
        look?: "neutral" | "warm" | "cool" | "contrast";
        transition?: "none" | "crossfade";
        captionMode?: "none" | "sidecar" | "burn_in";
        exportAspects?: Array<"source" | "vertical_9x16" | "square_1x1" | "landscape_16x9">;
        loudnorm?: boolean;
      }
  >;
}): Promise<{
  ok: boolean;
  message: string;
  project?: import("@/lib/campaign-media/video-edit-types").VideoEditProject;
  warnings?: string[];
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { updateVideoEditCutList } = await import("@/lib/campaign-media/video-edit-cutlist");
  const result = updateVideoEditCutList({
    projectId: String(input.projectId ?? "").trim(),
    updates: input.updates ?? [],
  });
  if (!result.ok) return { ok: false, message: result.error };
  revalidatePath("/admin/evidence-workbench");
  return {
    ok: true,
    message: result.message,
    project: result.project,
    warnings: result.warnings,
  };
}

export async function previewVideoEditCaptionsAction(input: {
  projectId: string;
}): Promise<{
  ok: boolean;
  message: string;
  segmentCount?: number;
  cues?: Array<{ start: number; end: number; text: string }>;
  previewNote?: string;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const projectId = String(input.projectId ?? "").trim();
  if (!projectId) return { ok: false, message: "projectId required." };
  const { getVideoEditProject } = await import("@/lib/campaign-media/video-edit-store");
  const project = getVideoEditProject(projectId);
  if (!project) return { ok: false, message: `Project not found: ${projectId}` };
  const youtubeVideoId = String(project.youtubeVideoId ?? "").trim();
  if (!youtubeVideoId) return { ok: false, message: "Project missing youtubeVideoId." };
  const { previewEditCaptions } = await import("@/lib/campaign-media/video-caption-package");
  const preview = previewEditCaptions({
    youtubeVideoId,
    clips: project.clips,
    limit: 24,
  });
  if (!preview.ok) return { ok: false, message: preview.error };
  return {
    ok: true,
    message: `${preview.segmentCount} caption cue(s) · verbatim only`,
    segmentCount: preview.segmentCount,
    cues: preview.cues,
    previewNote: preview.previewNote,
  };
}

export async function softArchiveVideoAssembliesAction(input: {
  projectId?: string;
  outId?: string;
  confirmArchive: boolean;
}): Promise<{ ok: boolean; message: string; archived?: number }> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  if (!input.confirmArchive) {
    return { ok: false, message: "confirmArchive:true required — refuse silent archive." };
  }
  const { softArchiveVideoAssemblies } = await import("@/lib/campaign-media/video-edit-store");
  const result = softArchiveVideoAssemblies({
    projectId: input.projectId ? String(input.projectId).trim() : undefined,
    outId: input.outId ? String(input.outId).trim() : undefined,
    confirmArchive: true,
  });
  if (!result.ok) return { ok: false, message: result.error };
  revalidatePath("/admin/evidence-workbench");
  return { ok: true, message: result.message, archived: result.archived };
}

export async function analyzeTranscriptIntelAction(input: {
  speechId: string;
  youtubeVideoId: string;
}): Promise<{
  ok: boolean;
  message: string;
  proposal?: import("@/lib/campaign-media/transcript-intelligence").TranscriptIntelProposal;
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const speechId = String(input.speechId ?? "").trim();
  const youtubeVideoId = String(input.youtubeVideoId ?? "").trim();
  if (!youtubeVideoId) return { ok: false, message: "youtubeVideoId required." };

  const overlay = speechId ? loadSpeechEvidenceStore().speeches[speechId] ?? null : null;
  const { analyzeTranscriptIntelligence } = await import(
    "@/lib/campaign-media/transcript-intelligence"
  );
  const result = analyzeTranscriptIntelligence({
    youtubeVideoId,
    speechId: speechId || undefined,
    overlay,
  });
  if (!result.ok) return { ok: false, message: result.error };
  const p = result.proposal;
  return {
    ok: true,
    message: `Transcript intel: ${p.chapters.length} chapters · ${p.quotes.length} quotes · ${p.claimCandidates.length} claims · ${p.doNotClaim.length} do-not-claim`,
    proposal: p,
  };
}

export async function applyTranscriptIntelAction(input: {
  speechId: string;
  proposalId: string;
  applyFields: string[];
  claimIndex?: number;
}): Promise<{ ok: boolean; message: string }> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const speechId = String(input.speechId ?? "").trim();
  if (!speechId) return { ok: false, message: "speechId required." };
  const applyFields = (input.applyFields ?? []).map(String).filter(Boolean);
  if (!applyFields.length) return { ok: false, message: "Select at least one field to apply." };

  const {
    loadTranscriptIntelStore,
    applyTranscriptIntelToOverlay,
  } = await import("@/lib/campaign-media/transcript-intelligence");
  const proposal =
    loadTranscriptIntelStore().proposals.find((p) => p.id === input.proposalId) ?? null;
  if (!proposal) return { ok: false, message: "Proposal not found — run Analyze transcript again." };

  const store = loadSpeechEvidenceStore();
  const prev = store.speeches[speechId] ?? {};
  store.speeches[speechId] = applyTranscriptIntelToOverlay({
    overlay: prev,
    proposal,
    applyFields: applyFields as import("@/lib/campaign-media/transcript-intelligence").TranscriptIntelApplyFields[],
    claimIndex: input.claimIndex,
  });
  saveSpeechEvidenceStore(store);
  revalidatePath("/admin/evidence-workbench");
  return {
    ok: true,
    message: `Applied transcript intel fields (${applyFields.join(", ")}) to ${speechId}.`,
  };
}

export type { CalendarPresenceStatus };
