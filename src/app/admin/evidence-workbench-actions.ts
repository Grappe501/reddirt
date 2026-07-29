"use server";

import { revalidatePath } from "next/cache";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { assertAdminApi } from "@/lib/admin/require-admin";
import {
  loadCalendarPresenceStore,
  loadPhotoEvidenceStore,
  loadSpeechEvidenceStore,
  saveCalendarPresenceStore,
  savePhotoEvidenceStore,
  saveSpeechEvidenceStore,
} from "@/lib/campaign-media/evidence-store";
import { assertLocalEvidenceWritesAllowed } from "@/lib/campaign-media/evidence-local-writes";
import { exportConfirmedCalendarToPresenceMatrix } from "@/lib/campaign-media/export-calendar-to-matrix";
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
  for (const patch of rows) {
    const cur = byId.get(patch.id);
    if (!cur) continue;
    byId.set(patch.id, {
      ...cur,
      city: patch.city ?? cur.city,
      county: patch.county ?? cur.county,
      status: patch.status ?? cur.status,
    });
  }
  store.rows = Array.from(byId.values()).sort(
    (a, b) => a.date.localeCompare(b.date) || a.summary.localeCompare(b.summary),
  );
  saveCalendarPresenceStore(store);
  revalidatePath("/admin/evidence-workbench");
  return { ok: true, message: `Saved ${rows.length} calendar row(s).` };
}

export async function savePhotoEvidenceAction(
  _prev: { ok: boolean; message: string } | null,
  formData: FormData,
): Promise<{ ok: boolean; message: string }> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };

  const photoId = str(formData, "photoId");
  if (!photoId) return { ok: false, message: "Missing photo id." };

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
    heroLevel: (str(formData, "heroLevel") as PhotoEvidenceOverlay["heroLevel"]) || undefined,
    tierIntent: (str(formData, "tierIntent") as PhotoEvidenceOverlay["tierIntent"]) || "",
    publicationStatus:
      (str(formData, "publicationStatus") as PhotoEvidenceOverlay["publicationStatus"]) || undefined,
    updatedAt: new Date().toISOString(),
  };

  const store = loadPhotoEvidenceStore();
  store.photos[photoId] = overlay;
  savePhotoEvidenceStore(store);

  if (overlay.county !== "Unknown" && overlay.city !== "Unknown") {
    const { rememberConfirmedEvidenceExample } = await import("@/lib/campaign-media/evidence-ai-memory");
    const { CAMPAIGN_PHOTO_REGISTRY } = await import("@/content/media/campaign-photo-registry");
    const base = CAMPAIGN_PHOTO_REGISTRY.find((p) => p.id === photoId);
    rememberConfirmedEvidenceExample({
      assetKind: "photo",
      assetId: photoId,
      county: overlay.county ?? "Unknown",
      city: overlay.city ?? "Unknown",
      venue: overlay.venue,
      eventName: overlay.eventName,
      peopleVisible: overlay.peopleVisible,
      whatThisProves: overlay.whatThisProves,
      captionOrTitle: base?.accessibility.caption,
      updatedAt: new Date().toISOString(),
    });
  }

  revalidatePath("/admin/evidence-workbench");
  revalidatePath("/campaign-photos");
  revalidatePath("/");
  return { ok: true, message: `Saved photo evidence for ${photoId}.` };
}

export async function saveSpeechEvidenceAction(
  _prev: { ok: boolean; message: string } | null,
  formData: FormData,
): Promise<{ ok: boolean; message: string }> {
  const g = await gate();
  if (!g.ok) return { ok: false, message: g.error };

  const speechId = str(formData, "speechId");
  if (!speechId) return { ok: false, message: "Missing speech id." };

  const countiesRaw = str(formData, "counties");
  const overlay: SpeechEvidenceOverlay = {
    counties: countiesRaw
      ? countiesRaw.split(",").map((c) => c.trim()).filter(Boolean)
      : [],
    city: str(formData, "city"),
    whatThisProves: str(formData, "whatThisProves"),
    approvedForPublic: bool(formData, "approvedForPublic"),
    updatedAt: new Date().toISOString(),
  };

  const store = loadSpeechEvidenceStore();
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
      whatThisProves: overlay.whatThisProves,
      captionOrTitle: base?.title,
      updatedAt: new Date().toISOString(),
    });
  }

  revalidatePath("/admin/evidence-workbench");
  revalidatePath("/kelly-speaks");
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

/** Re-seed calendar from local CSV or Desktop basic.ics path (local disk only). */
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
    const icsPath = str(formData, "icsPath") || "C:\\Users\\User\\Desktop\\basic.ics";
    if (!existsSync(icsPath)) {
      return { ok: false, message: `ICS not found: ${icsPath}` };
    }
    // Convert ICS → CSV in .local/temp then run seed
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
  const { CAMPAIGN_PHOTO_REGISTRY } = await import("@/content/media/campaign-photo-registry");
  const photo = CAMPAIGN_PHOTO_REGISTRY.find((p) => p.id === photoId);
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
  const { CAMPAIGN_PHOTO_REGISTRY } = await import("@/content/media/campaign-photo-registry");
  const photo = CAMPAIGN_PHOTO_REGISTRY.find((p) => p.id === photoId);
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

export type { CalendarPresenceStatus };
