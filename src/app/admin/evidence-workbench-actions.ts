"use server";

import { revalidatePath } from "next/cache";
import { existsSync, readFileSync } from "node:fs";
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
    byId.set(patch.id, {
      ...cur,
      city: patch.city ?? cur.city,
      county: patch.county ?? cur.county,
      status: patch.status ?? cur.status,
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
  const { mkdirSync, writeFileSync } = require("node:fs") as typeof import("node:fs");
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
): Promise<{ ok: boolean; message: string; suggestion?: import("@/lib/campaign-media/evidence-ai-types").EvidenceAiSuggestion }> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const photo = listCampaignPhotosLive().find((p) => p.id === photoId);
  if (!photo) return { ok: false, message: `Photo not found: ${photoId}` };
  const overlay = loadPhotoEvidenceStore().photos[photoId] ?? null;
  const { suggestPhotoEvidenceWithAi } = await import("@/lib/campaign-media/evidence-ai-suggest");
  const result = await suggestPhotoEvidenceWithAi({ photo, overlay });
  if (!result.ok) return { ok: false, message: result.error };
  return {
    ok: true,
    message: `AI suggestion (${result.suggestion.confidence}): ${result.suggestion.rationale || "review fields"}`,
    suggestion: result.suggestion,
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

export async function suggestBatchPhotoEvidenceAiAction(photoIds: string[]): Promise<{
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
): Promise<{ ok: boolean; message: string; suggestion?: import("@/lib/campaign-media/evidence-ai-types").EvidenceAiSuggestion }> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const { CAMPAIGN_MEDIA_REGISTRY } = await import("@/content/media/campaign-media-registry");
  const media = CAMPAIGN_MEDIA_REGISTRY.find((m) => m.id === speechId);
  if (!media) return { ok: false, message: `Speech not found: ${speechId}` };
  const overlay = loadSpeechEvidenceStore().speeches[speechId] ?? null;
  const { suggestSpeechEvidenceWithAi } = await import("@/lib/campaign-media/evidence-ai-suggest");
  const result = await suggestSpeechEvidenceWithAi({ media, overlay });
  if (!result.ok) return { ok: false, message: result.error };
  return {
    ok: true,
    message: `AI suggestion (${result.suggestion.confidence}): ${result.suggestion.rationale || "review fields"}`,
    suggestion: result.suggestion,
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
  localPublicSrc?: string;
}): Promise<{
  ok: boolean;
  message: string;
  clips?: import("@/lib/campaign-media/media-derivatives-types").VideoClipRecord[];
}> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };
  const speechId = String(input.speechId ?? "").trim();
  if (!speechId) return { ok: false, message: "speechId required." };

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
      localPublicSrc: input.localPublicSrc,
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
  });
  revalidatePath("/admin/evidence-workbench");
  return {
    ok: batch.ok,
    message: batch.message + (batch.errors[0] ? `\n${batch.errors[0].error}` : ""),
    clips: batch.created,
  };
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
