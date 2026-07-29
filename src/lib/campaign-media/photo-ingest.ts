import "server-only";

import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { CAMPAIGN_PHOTO_REGISTRY } from "@/content/media/campaign-photo-registry";
import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import { emptyCampaignPhotoCampaignMetadata, UNKNOWN } from "@/content/media/campaign-photo-types";
import {
  loadPhotoIngestDrafts,
  savePhotoIngestDrafts,
} from "@/lib/campaign-media/evidence-store";

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

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
  src: string;
  id: string;
  alreadyInRegistry: boolean;
  alreadyInDrafts: boolean;
};

/** Scan public/media/campaign-photos for files not yet in registry or drafts. */
export function listDiskPhotoIngestCandidates(): DiskPhotoCandidate[] {
  const dir = path.join(process.cwd(), "public/media/campaign-photos");
  if (!existsSync(dir)) return [];
  const registryIds = new Set(CAMPAIGN_PHOTO_REGISTRY.map((p) => p.id));
  const registrySrc = new Set(CAMPAIGN_PHOTO_REGISTRY.map((p) => p.src));
  const drafts = loadPhotoIngestDrafts();
  const draftIds = new Set(drafts.photos.map((p) => p.id));
  const draftSrc = new Set(drafts.photos.map((p) => p.src));

  const out: DiskPhotoCandidate[] = [];
  for (const filename of readdirSync(dir)) {
    const ext = path.extname(filename).toLowerCase();
    if (!IMAGE_EXT.has(ext)) continue;
    const src = `/media/campaign-photos/${filename}`;
    const id = slugFromFilename(filename);
    out.push({
      filename,
      src,
      id,
      alreadyInRegistry: registryIds.has(id) || registrySrc.has(src),
      alreadyInDrafts: draftIds.has(id) || draftSrc.has(src),
    });
  }
  return out.sort((a, b) => a.filename.localeCompare(b.filename));
}

export function promoteDiskPhotoToDraft(filename: string): {
  ok: true;
  photo: CampaignPhotoRecord;
} | { ok: false; error: string } {
  const safe = path.basename(filename);
  if (safe !== filename || safe.includes("..")) {
    return { ok: false, error: "Invalid filename." };
  }
  const abs = path.join(process.cwd(), "public/media/campaign-photos", safe);
  if (!existsSync(abs)) return { ok: false, error: `File not found: ${safe}` };

  const candidates = listDiskPhotoIngestCandidates();
  const hit = candidates.find((c) => c.filename === safe);
  if (!hit) return { ok: false, error: "Not a campaign-photos image." };
  if (hit.alreadyInRegistry) return { ok: false, error: "Already in campaign-photo-registry." };
  if (hit.alreadyInDrafts) return { ok: false, error: "Already in ingest drafts." };

  const now = new Date().toISOString();
  const photo: CampaignPhotoRecord = {
    id: hit.id,
    src: hit.src,
    heroLevel: "UNREVIEWED",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: safe,
      orientation: "Unknown",
      fileType: path.extname(safe).slice(1).toUpperCase() || "Unknown",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      ...emptyCampaignPhotoCampaignMetadata(),
      approvedForPublic: false,
    },
    accessibility: {
      altText: "Campaign trail photograph — geography pending confirmation.",
      caption: `Ingest draft: ${safe}`,
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
