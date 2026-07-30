/**
 * Browser drop → write video masters under public/media/campaign-video-masters/.
 * Prefer Unknown: never invent -2/-3; skip if basename already on disk.
 * Never Approves. Never deletes/overwrites. Masters must be flat (no nested folders).
 */

import "server-only";

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const VIDEO_EXT = new Set([".mp4", ".mov", ".webm", ".mkv", ".m4v"]);
const MASTERS_DIR_REL = "public/media/campaign-video-masters";
const MAX_FILES = 20;
const MAX_BYTES = 800 * 1024 * 1024;

export type DropVideoMasterInput = {
  name: string;
  bytes: Buffer;
};

export type DropVideoMastersResult = {
  ok: boolean;
  message: string;
  written: string[];
  skipped: string[];
};

function mastersDirAbs(): string {
  return path.join(process.cwd(), MASTERS_DIR_REL);
}

function sanitizeBasename(name: string): string | null {
  const base = path.basename(String(name ?? "").trim()).replace(/[^\w.\- ()[\]]+/g, "_");
  if (!base || base === "." || base === "..") return null;
  const ext = path.extname(base).toLowerCase();
  if (!VIDEO_EXT.has(ext)) return null;
  return base.slice(0, 180);
}

export function dropVideoMastersToDisk(files: DropVideoMasterInput[]): DropVideoMastersResult {
  const dir = mastersDirAbs();
  mkdirSync(dir, { recursive: true });

  const written: string[] = [];
  const skipped: string[] = [];
  const slice = files.slice(0, MAX_FILES);

  for (const file of slice) {
    const safe = sanitizeBasename(file.name);
    if (!safe) {
      skipped.push(`${file.name || "unnamed"} (not an allowed video)`);
      continue;
    }
    if (!file.bytes?.length) {
      skipped.push(`${safe} (empty)`);
      continue;
    }
    if (file.bytes.length > MAX_BYTES) {
      skipped.push(`${safe} (over max bytes)`);
      continue;
    }
    const abs = path.join(dir, safe);
    if (existsSync(abs)) {
      skipped.push(`${safe} (already on disk — Prefer Unknown, no -2/-3 rename)`);
      continue;
    }
    writeFileSync(abs, file.bytes);
    written.push(`${MASTERS_DIR_REL}/${safe}`);
  }

  if (!written.length && !skipped.length) {
    return { ok: false, message: "No video files in drop.", written, skipped };
  }
  return {
    ok: written.length > 0,
    message: written.length
      ? `Wrote ${written.length} master(s) to ${MASTERS_DIR_REL}${
          skipped.length ? ` · skipped ${skipped.length}` : ""
        }. Name files with speech id or YouTube id when possible.`
      : `No masters written. Skipped: ${skipped.slice(0, 5).join("; ")}`,
    written,
    skipped,
  };
}
