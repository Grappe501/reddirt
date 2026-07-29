import "server-only";

import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { CAMPAIGN_PHOTO_REGISTRY } from "@/content/media/campaign-photo-registry";
import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import { emptyCampaignPhotoCampaignMetadata, UNKNOWN } from "@/content/media/campaign-photo-types";
import {
  loadPhotoIngestDrafts,
  savePhotoIngestDrafts,
} from "@/lib/campaign-media/evidence-store";

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const PHOTOS_DIR_REL = "public/media/campaign-photos";

function slugFromFilename(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "");
  return (
    base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || `ingest-${Date.now()}`
  );
}

export type DiskPhotoCandidate = {
  filename: string;
  /** Relative path under campaign-photos (may include subfolders). */
  relativePath: string;
  src: string;
  id: string;
  alreadyInRegistry: boolean;
  alreadyInDrafts: boolean;
  nested: boolean;
};

function walkRelativeImages(dirAbs: string, prefix = ""): string[] {
  if (!existsSync(dirAbs)) return [];
  const out: string[] = [];
  for (const name of readdirSync(dirAbs)) {
    const abs = path.join(dirAbs, name);
    const st = statSync(abs);
    const rel = prefix ? `${prefix}/${name}` : name;
    if (st.isDirectory()) {
      out.push(...walkRelativeImages(abs, rel));
      continue;
    }
    const ext = path.extname(name).toLowerCase();
    if (IMAGE_EXT.has(ext)) out.push(rel.split(path.sep).join("/"));
  }
  return out;
}

/** Scan public/media/campaign-photos (recursive) for files not yet in registry or drafts. */
export function listDiskPhotoIngestCandidates(): DiskPhotoCandidate[] {
  const dir = path.join(process.cwd(), PHOTOS_DIR_REL);
  if (!existsSync(dir)) return [];
  const registryIds = new Set(CAMPAIGN_PHOTO_REGISTRY.map((p) => p.id));
  const registrySrc = new Set(CAMPAIGN_PHOTO_REGISTRY.map((p) => p.src));
  const drafts = loadPhotoIngestDrafts();
  const draftIds = new Set(drafts.photos.map((p) => p.id));
  const draftSrc = new Set(drafts.photos.map((p) => p.src));

  const out: DiskPhotoCandidate[] = [];
  for (const relativePath of walkRelativeImages(dir)) {
    const filename = path.basename(relativePath);
    const ext = path.extname(filename).toLowerCase();
    if (!IMAGE_EXT.has(ext)) continue;
    const nested = relativePath.includes("/");
    // Prefer flat public URL when already flattened; nested keeps encoded path for preview.
    const src = `/media/campaign-photos/${relativePath.split("/").map(encodeURIComponent).join("/")}`;
    const id = slugFromFilename(filename);
    out.push({
      filename,
      relativePath,
      src,
      id,
      alreadyInRegistry: registryIds.has(id) || registrySrc.has(src) || registrySrc.has(`/media/campaign-photos/${filename}`),
      alreadyInDrafts: draftIds.has(id) || draftSrc.has(src) || draftSrc.has(`/media/campaign-photos/${filename}`),
      nested,
    });
  }
  return out.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

export function promoteDiskPhotoToDraft(filenameOrRel: string): {
  ok: true;
  photo: CampaignPhotoRecord;
} | { ok: false; error: string } {
  const rel = filenameOrRel.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!rel || rel.includes("..")) {
    return { ok: false, error: "Invalid path." };
  }

  const candidates = listDiskPhotoIngestCandidates();
  const hit =
    candidates.find((c) => c.relativePath === rel || c.filename === path.basename(rel)) ?? null;
  if (!hit) return { ok: false, error: "Not a campaign-photos image." };
  if (hit.alreadyInRegistry) return { ok: false, error: "Already in campaign-photo-registry." };
  if (hit.alreadyInDrafts) return { ok: false, error: "Already in ingest drafts." };

  // Flat public src for workbench/site serving after batch flatten, or nested if still nested.
  const flatSrc = `/media/campaign-photos/${hit.filename}`;
  const src = existsSync(path.join(process.cwd(), PHOTOS_DIR_REL, hit.filename))
    ? flatSrc
    : `/media/campaign-photos/${hit.relativePath}`;

  const now = new Date().toISOString();
  const photo: CampaignPhotoRecord = {
    id: hit.id,
    src,
    heroLevel: "UNREVIEWED",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: hit.filename,
      orientation: "Unknown",
      fileType: path.extname(hit.filename).slice(1).toUpperCase() || "Unknown",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      ...emptyCampaignPhotoCampaignMetadata(),
      approvedForPublic: false,
    },
    accessibility: {
      altText: "Campaign trail photograph — geography pending confirmation.",
      caption: `Ingest draft: ${hit.filename}`,
    },
    notes: "Ingest draft from Evidence Workbench — confirm geography before public approval.",
    createdAt: now,
    updatedAt: now,
  };

  const store = loadPhotoIngestDrafts();
  store.photos.push(photo);
  savePhotoIngestDrafts(store);
  return { ok: true, photo };
}

/** Promote every new disk candidate into drafts (nested files should be flattened first via batch script). */
export function promoteAllNewDiskPhotosToDrafts(): {
  promoted: number;
  skipped: number;
  ids: string[];
} {
  const candidates = listDiskPhotoIngestCandidates().filter(
    (c) => !c.alreadyInRegistry && !c.alreadyInDrafts && !c.nested,
  );
  const ids: string[] = [];
  let skipped = 0;
  for (const c of candidates) {
    const res = promoteDiskPhotoToDraft(c.relativePath);
    if (res.ok) ids.push(res.photo.id);
    else skipped += 1;
  }
  return { promoted: ids.length, skipped, ids };
}
