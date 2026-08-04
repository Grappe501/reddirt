/**
 * Browser drop → write under public/media/campaign-photos/.
 * Prefer Unknown: never invent -2/-3; skip if basename already on disk.
 * P1: HEIC/HEIF → JPEG via sharp. Never Approves. Never deletes/overwrites.
 */
import "server-only";

import { existsSync, mkdirSync, writeFileSync, unlinkSync } from "node:fs";
import path from "node:path";

const WEB_IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const HEIC_EXT = new Set([".heic", ".heif"]);
const IMAGE_EXT = new Set([...WEB_IMAGE_EXT, ...HEIC_EXT]);
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

function slugBase(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "");
  return (
    base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || `ingest-${Date.now()}`
  );
}

/** Write image bytes into campaign-photos (flat). HEIC→JPEG. Skip collisions — Prefer Unknown. */
export async function dropCampaignPhotosToDisk(
  files: DropCampaignPhotoInput[],
): Promise<DropCampaignPhotosResult> {
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

    const ext = path.extname(safe).toLowerCase();
    const outName = HEIC_EXT.has(ext) ? `${slugBase(safe)}.jpg` : safe;
    const abs = path.join(dir, outName);
    if (existsSync(abs)) {
      skipped.push(`${outName} (already on disk — Prefer Unknown, no -2/-3 rename)`);
      continue;
    }

    try {
      if (HEIC_EXT.has(ext)) {
        const tmp = path.join(dir, `${slugBase(safe)}.heic.tmp`);
        writeFileSync(tmp, file.bytes);
        try {
          const sharp = (await import("sharp")).default;
          const jpeg = await sharp(tmp, { failOn: "none" }).rotate().jpeg({ quality: 88 }).toBuffer();
          writeFileSync(abs, jpeg);
        } finally {
          if (existsSync(tmp)) unlinkSync(tmp);
        }
        written.push(`${PHOTOS_DIR_REL}/${outName} (from HEIC)`);
      } else {
        writeFileSync(abs, file.bytes);
        written.push(`${PHOTOS_DIR_REL}/${outName}`);
      }
    } catch (e) {
      skipped.push(`${safe} (${e instanceof Error ? e.message : "write failed"})`);
    }
  }

  if (files.length > MAX_FILES) {
    skipped.push(`… ${files.length - MAX_FILES} file(s) over max ${MAX_FILES}`);
  }

  if (!written.length) {
    return {
      ok: false,
      message: skipped.length
        ? `No files written. Skipped: ${skipped.slice(0, 6).join("; ")}`
        : "No files written.",
      written,
      skipped,
    };
  }

  return {
    ok: true,
    message: `Wrote ${written.length} file(s)${skipped.length ? ` · skipped ${skipped.length}` : ""}. Run Intake next.`,
    written,
    skipped,
  };
}
