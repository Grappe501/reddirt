/**
 * Browser drop → write under public/media/campaign-photos/.
 * Disk stays source of truth. Never Approves. Never deletes/overwrites.
 */
import "server-only";

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const PHOTOS_DIR_REL = "public/media/campaign-photos";
const MAX_FILES = 40;
const MAX_BYTES = 25 * 1024 * 1024;

export type DropCampaignPhotoInput = {
  name: string;
  bytes: Buffer;
};

export type DropCampaignPhotosResult = {
  ok: boolean;
  message: string;
  written: string[];
  skipped: string[];
};

function photosDirAbs(): string {
  return path.join(process.cwd(), PHOTOS_DIR_REL);
}

function sanitizeBasename(name: string): string | null {
  const base = path.basename(String(name ?? "").trim()).replace(/[^\w.\- ()[\]]+/g, "_");
  if (!base || base === "." || base === "..") return null;
  const ext = path.extname(base).toLowerCase();
  if (!IMAGE_EXT.has(ext)) return null;
  return base.slice(0, 180);
}

function uniqueAbs(dir: string, basename: string): { abs: string; filename: string } {
  const ext = path.extname(basename);
  const stem = basename.slice(0, basename.length - ext.length) || "drop";
  let candidate = basename;
  let n = 2;
  while (existsSync(path.join(dir, candidate))) {
    candidate = `${stem}-${n}${ext}`;
    n += 1;
    if (n > 200) {
      candidate = `${stem}-${Date.now()}${ext}`;
      break;
    }
  }
  return { abs: path.join(dir, candidate), filename: candidate };
}

/** Write image bytes into campaign-photos (flat). Never overwrites; never intakes/Approves. */
export function dropCampaignPhotosToDisk(files: DropCampaignPhotoInput[]): DropCampaignPhotosResult {
  const dir = photosDirAbs();
  mkdirSync(dir, { recursive: true });

  const written: string[] = [];
  const skipped: string[] = [];
  const slice = files.slice(0, MAX_FILES);

  for (const file of slice) {
    const safe = sanitizeBasename(file.name);
    if (!safe) {
      skipped.push(`${file.name || "unnamed"} (not an allowed image)`);
      continue;
    }
    if (!file.bytes?.length) {
      skipped.push(`${safe} (empty)`);
      continue;
    }
    if (file.bytes.length > MAX_BYTES) {
      skipped.push(`${safe} (over ${MAX_BYTES} bytes)`);
      continue;
    }
    const target = uniqueAbs(dir, safe);
    writeFileSync(target.abs, file.bytes);
    written.push(`${PHOTOS_DIR_REL}/${target.filename}`);
  }

  if (files.length > MAX_FILES) {
    skipped.push(`… ${files.length - MAX_FILES} file(s) over max ${MAX_FILES}`);
  }

  if (!written.length) {
    return {
      ok: false,
      message: skipped.length
        ? `No files written. Skipped: ${skipped.slice(0, 6).join("; ")}`
        : "No image files in drop.",
      written,
      skipped,
    };
  }

  return {
    ok: true,
    message: `Wrote ${written.length} file(s) to ${PHOTOS_DIR_REL}${
      skipped.length ? ` · skipped ${skipped.length}` : ""
    }. Disk is source of truth — Rescan / Intake next. Never auto-Approve.`,
    written,
    skipped,
  };
}
