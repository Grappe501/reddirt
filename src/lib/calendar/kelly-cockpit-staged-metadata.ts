import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const FILE = path.join(process.cwd(), "data", "calendar-command-center", "item-staged-metadata.json");

export type PressReleasePref = "no" | "maybe" | "yes" | "staff_decide";

export type GoogleSyncStatusPref =
  | "not_synced"
  | "ready_to_sync"
  | "synced_to_google"
  | "google_conflict"
  | "needs_staff_before_sync";

export type GoogleSyncTargetPref = "kelly_public" | "kelly_private" | "staff" | "travel";

export type KellyItemStagedMetadata = {
  pressRelease?: PressReleasePref;
  pressAngleNote?: string;
  googleSyncStatus?: GoogleSyncStatusPref;
  googleSyncTarget?: GoogleSyncTargetPref;
  updatedAt?: string;
};

type FileShape = {
  version: 1;
  byItemId: Record<string, KellyItemStagedMetadata>;
};

function readAll(): FileShape {
  if (!existsSync(FILE)) return { version: 1, byItemId: {} };
  try {
    const raw = JSON.parse(readFileSync(FILE, "utf8")) as FileShape;
    if (raw?.version !== 1 || typeof raw.byItemId !== "object" || !raw.byItemId) return { version: 1, byItemId: {} };
    return raw;
  } catch {
    return { version: 1, byItemId: {} };
  }
}

function writeAll(data: FileShape) {
  mkdirSync(path.dirname(FILE), { recursive: true });
  writeFileSync(FILE, JSON.stringify(data, null, 2), "utf8");
}

export function loadKellyItemStagedMap(): Record<string, KellyItemStagedMetadata> {
  return readAll().byItemId;
}

export function getKellyItemStaged(calendarItemId: string): KellyItemStagedMetadata {
  return readAll().byItemId[calendarItemId] ?? {};
}

export function patchKellyItemStaged(calendarItemId: string, patch: KellyItemStagedMetadata): KellyItemStagedMetadata {
  const data = readAll();
  const prev = data.byItemId[calendarItemId] ?? {};
  const next = { ...prev, ...patch, updatedAt: new Date().toISOString() };
  data.byItemId[calendarItemId] = next;
  writeAll(data);
  return next;
}
