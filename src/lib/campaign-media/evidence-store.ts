import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { headers } from "next/headers";
import {
  CALENDAR_PRESENCE_REL,
  PHOTO_EVIDENCE_REL,
  SPEECH_EVIDENCE_REL,
  type CalendarPresenceStore,
  type PhotoEvidenceStore,
  type SpeechEvidenceStore,
} from "@/lib/campaign-media/evidence-types";

function repoRoot(): string {
  return process.cwd();
}

function abs(rel: string): string {
  return path.join(repoRoot(), rel);
}

function readJsonFile<T>(rel: string): T | null {
  const p = abs(rel);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, "utf8")) as T;
}

/** Atomic JSON write under RedDirt/data. */
export function writeJsonAtomic(rel: string, data: unknown): void {
  const target = abs(rel);
  mkdirSync(path.dirname(target), { recursive: true });
  const tmp = `${target}.${process.pid}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  renameSync(tmp, target);
}

export function emptyCalendarStore(): CalendarPresenceStore {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    sourceNote: "Empty — seed via Evidence Workbench import or scripts/seed-calendar-presence.cjs",
    rows: [],
  };
}

export function emptyPhotoStore(): PhotoEvidenceStore {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    purpose: "Local Evidence Workbench photo confirmations (overlay on campaign-photo-registry).",
    photos: {},
  };
}

export function emptySpeechStore(): SpeechEvidenceStore {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    purpose: "Local Evidence Workbench speech/video geography confirmations.",
    speeches: {},
  };
}

export function loadCalendarPresenceStore(): CalendarPresenceStore {
  return readJsonFile<CalendarPresenceStore>(CALENDAR_PRESENCE_REL) ?? emptyCalendarStore();
}

export function loadPhotoEvidenceStore(): PhotoEvidenceStore {
  return readJsonFile<PhotoEvidenceStore>(PHOTO_EVIDENCE_REL) ?? emptyPhotoStore();
}

export function loadSpeechEvidenceStore(): SpeechEvidenceStore {
  return readJsonFile<SpeechEvidenceStore>(SPEECH_EVIDENCE_REL) ?? emptySpeechStore();
}

export function saveCalendarPresenceStore(store: CalendarPresenceStore): void {
  writeJsonAtomic(CALENDAR_PRESENCE_REL, {
    ...store,
    version: 1,
    updatedAt: new Date().toISOString(),
  });
}

export function savePhotoEvidenceStore(store: PhotoEvidenceStore): void {
  writeJsonAtomic(PHOTO_EVIDENCE_REL, {
    ...store,
    version: 1,
    updatedAt: new Date().toISOString(),
  });
}

export function saveSpeechEvidenceStore(store: SpeechEvidenceStore): void {
  writeJsonAtomic(SPEECH_EVIDENCE_REL, {
    ...store,
    version: 1,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Local-first write gate: Host must be localhost/127.0.0.1, or ADMIN_LOCAL_WRITES=1.
 */
export async function assertLocalEvidenceWritesAllowed(): Promise<{ ok: true } | { ok: false; error: string }> {
  if (process.env.ADMIN_LOCAL_WRITES === "1" || process.env.ADMIN_LOCAL_WRITES === "true") {
    return { ok: true };
  }
  const h = await headers();
  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "").toLowerCase().split(":")[0];
  if (host === "localhost" || host === "127.0.0.1" || host === "::1") {
    return { ok: true };
  }
  return {
    ok: false,
    error:
      "Evidence Workbench writes are local-only. Run on http://127.0.0.1 (or set ADMIN_LOCAL_WRITES=1).",
  };
}

export function calendarRowId(date: string, summary: string): string {
  const raw = `${date}|${summary}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash * 31 + raw.charCodeAt(i)) | 0;
  }
  return `cal_${Math.abs(hash).toString(36)}_${raw.length}`;
}
