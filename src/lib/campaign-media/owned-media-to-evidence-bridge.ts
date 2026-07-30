/**
 * Phase 4 — Owned Media → Evidence draft bridge (confirm-only).
 * Copies LOCAL_DISK image bytes into campaign-photos + intake draft.
 * Never Approves. Never silent registry rewrite.
 */

import "server-only";

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { OwnedMediaKind, OwnedMediaStorageBackend } from "@prisma/client";
import { CAMPAIGN_PHOTO_REGISTRY } from "@/content/media/campaign-photo-registry";
import { loadPhotoIngestDrafts } from "@/lib/campaign-media/evidence-store";
import { intakeImageBytesToDraft, slugFromFilename } from "@/lib/campaign-media/photo-ingest";
import { prisma } from "@/lib/db";
import { storageKeyToAbsoluteFilePath } from "@/lib/owned-media/paths";

export type OwnedMediaEvidenceBridgeRow = {
  ownedMediaId: string;
  fileName: string;
  title: string;
  reviewStatus: string;
  storageBackend: string;
  canImport: boolean;
  reason: string;
  suggestedPhotoId: string;
};

function evidenceFilenames(): Set<string> {
  const names = new Set<string>();
  for (const p of CAMPAIGN_PHOTO_REGISTRY) {
    const orig = p.basic?.originalFilename;
    if (orig) names.add(path.basename(orig).toLowerCase());
    if (p.src) names.add(path.basename(p.src).toLowerCase());
    names.add(`${p.id}.jpg`);
    names.add(`${p.id}.jpeg`);
    names.add(`${p.id}.png`);
    names.add(`${p.id}.webp`);
  }
  for (const p of loadPhotoIngestDrafts().photos) {
    const orig = p.basic?.originalFilename;
    if (orig) names.add(path.basename(orig).toLowerCase());
    if (p.src) names.add(path.basename(p.src).toLowerCase());
    names.add(`${p.id}.jpg`);
    names.add(`${p.id}.jpeg`);
    names.add(`${p.id}.png`);
    names.add(`${p.id}.webp`);
  }
  return names;
}

function pickDisplayName(row: {
  originalFileName: string | null;
  canonicalFileName: string | null;
  fileName: string;
}): string {
  return (
    row.originalFileName?.trim() ||
    row.canonicalFileName?.trim() ||
    row.fileName.trim() ||
    "asset.jpg"
  );
}

/** List Owned Media images not yet reflected in Evidence drafts/registry (filename match). */
export async function listOwnedMediaEvidenceBridgeCandidates(limit = 24): Promise<{
  rows: OwnedMediaEvidenceBridgeRow[];
  message: string;
}> {
  const known = evidenceFilenames();
  let assets: Array<{
    id: string;
    fileName: string;
    originalFileName: string | null;
    canonicalFileName: string | null;
    title: string;
    reviewStatus: string;
    storageBackend: OwnedMediaStorageBackend;
    storageKey: string;
    mimeType: string;
  }> = [];

  try {
    assets = await prisma.ownedMediaAsset.findMany({
      where: {
        kind: OwnedMediaKind.IMAGE,
        parentAssetId: null,
      },
      orderBy: { createdAt: "desc" },
      take: Math.min(Math.max(limit * 3, 24), 120),
      select: {
        id: true,
        fileName: true,
        originalFileName: true,
        canonicalFileName: true,
        title: true,
        reviewStatus: true,
        storageBackend: true,
        storageKey: true,
        mimeType: true,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      rows: [],
      message: `Owned Media DB unavailable (${msg.slice(0, 120)}). Bridge skipped.`,
    };
  }

  const rows: OwnedMediaEvidenceBridgeRow[] = [];
  for (const a of assets) {
    if (!a.mimeType.startsWith("image/")) continue;
    const display = pickDisplayName(a);
    const base = path.basename(display).toLowerCase();
    const idGuess = slugFromFilename(display);
    if (
      known.has(base) ||
      known.has(`${idGuess}.jpg`) ||
      known.has(`${idGuess}.jpeg`) ||
      known.has(`${idGuess}.png`) ||
      known.has(`${idGuess}.webp`)
    ) {
      continue;
    }

    const isLocal = a.storageBackend === OwnedMediaStorageBackend.LOCAL_DISK;
    const abs = isLocal ? storageKeyToAbsoluteFilePath(a.storageKey) : null;
    const fileOk = Boolean(abs && existsSync(abs));
    rows.push({
      ownedMediaId: a.id,
      fileName: display,
      title: a.title,
      reviewStatus: a.reviewStatus,
      storageBackend: a.storageBackend,
      canImport: fileOk,
      suggestedPhotoId: idGuess,
      reason: fileOk
        ? "Ready to import into Evidence drafts (confirm required)."
        : isLocal
          ? "LOCAL_DISK row but file missing on disk."
          : "Supabase/remote storage — copy to local disk or campaign-photos first.",
    });
    if (rows.length >= limit) break;
  }

  return {
    rows,
    message: rows.length
      ? `${rows.length} Owned Media image(s) not yet in Evidence (filename check).`
      : "No unbridged Owned Media images found (or DB empty).",
  };
}

/** Confirm-only: copy Owned Media local image → campaign-photos + intake draft. */
export async function importOwnedMediaToEvidenceDraft(ownedMediaId: string): Promise<{
  ok: boolean;
  message: string;
  photoId?: string;
}> {
  const id = String(ownedMediaId ?? "").trim();
  if (!id) return { ok: false, message: "ownedMediaId required." };

  let asset: {
    id: string;
    fileName: string;
    originalFileName: string | null;
    canonicalFileName: string | null;
    storageBackend: OwnedMediaStorageBackend;
    storageKey: string;
    mimeType: string;
    kind: OwnedMediaKind;
  } | null = null;

  try {
    asset = await prisma.ownedMediaAsset.findUnique({
      where: { id },
      select: {
        id: true,
        fileName: true,
        originalFileName: true,
        canonicalFileName: true,
        storageBackend: true,
        storageKey: true,
        mimeType: true,
        kind: true,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `Owned Media DB unavailable (${msg.slice(0, 120)}).` };
  }

  if (!asset) return { ok: false, message: "Owned Media asset not found." };
  if (asset.kind !== OwnedMediaKind.IMAGE && !asset.mimeType.startsWith("image/")) {
    return { ok: false, message: "Only IMAGE assets can bridge into Evidence stills." };
  }
  if (asset.storageBackend !== OwnedMediaStorageBackend.LOCAL_DISK) {
    return {
      ok: false,
      message: "Only LOCAL_DISK Owned Media can import in Phase 4 — drop a local copy or re-index.",
    };
  }

  const abs = storageKeyToAbsoluteFilePath(asset.storageKey);
  if (!existsSync(abs)) {
    return { ok: false, message: `Local file missing: ${asset.storageKey}` };
  }

  const display = pickDisplayName(asset);
  let bytes: Buffer;
  try {
    bytes = readFileSync(abs);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `Read failed: ${msg.slice(0, 120)}` };
  }

  const result = intakeImageBytesToDraft({
    filename: display,
    bytes,
    note: `Bridged from Owned Media ${asset.id} (confirm geography on Identify — Prefer Unknown).`,
  });
  if (!result.ok) return { ok: false, message: result.error };
  return {
    ok: true,
    message: `Imported Owned Media → Evidence draft ${result.photo.id} (${result.flatFilename}). Open Identify — never auto-Approved.`,
    photoId: result.photo.id,
  };
}
