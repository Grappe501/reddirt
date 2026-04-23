/**
 * Server-only indexing of **approved** local folders into `OwnedMediaAsset` (sourceType LOCAL_INDEXED).
 *
 * - Paths come from `CAMPAIGN_MEDIA_INDEX_ROOTS` (semicolon- or newline-separated absolute paths).
 * - Files are copied into the managed `OWNED_CAMPAIGN_PREFIX` data directory; DB stores `storageKey` only.
 * - Dedupes by `ingestContentSha256` when set (SHA-256 of file bytes).
 *
 * TODO: ASR / transcript backfill, AI clip index on `transcriptText` (see `OwnedMediaTranscript`).
 */

import { createHash } from "node:crypto";
import { readdir, readFile, stat, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  MediaIngestBatchStatus,
  OwnedMediaKind,
  OwnedMediaReviewStatus,
  OwnedMediaRole,
  OwnedMediaSourceType,
  OwnedMediaStorageBackend,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { buildIngestOriginalCanonicalName } from "@/lib/owned-media/campaign-filename";
import { buildOwnedStorageKey, getDataRootDir, storageKeyToAbsoluteFilePath } from "@/lib/owned-media/paths";
import { kindFromMime } from "@/lib/owned-media/ingest/mime";

const MAX_BYTES = Math.min(
  Number(process.env.CAMPAIGN_MEDIA_INDEX_MAX_BYTES) || 500 * 1024 * 1024,
  2 * 1024 * 1024 * 1024
);
const MAX_DEPTH = Math.min(Number(process.env.CAMPAIGN_MEDIA_INDEX_MAX_DEPTH) || 8, 20);

const SKIP_DIR_NAMES = new Set([
  ".git",
  "node_modules",
  ".next",
  "dist",
  "build",
  "system volume information",
  "$recycle.bin",
]);

function parseRootsFromEnv(): string[] {
  const raw = process.env.CAMPAIGN_MEDIA_INDEX_ROOTS?.trim() ?? "";
  if (!raw) return [];
  return raw
    .split(/[;\n\r]+/g)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((p) => path.resolve(p));
}

function sha256Buffer(buf: Buffer): string {
  return createHash("sha256").update(buf).digest("hex");
}

function generateLocalId(): string {
  // Match Prisma cuid feel without extra deps: random hex is fine for this batch tool.
  return `cm_${Date.now().toString(36)}_${createHash("sha256").update(Math.random().toString()).digest("hex").slice(0, 24)}`;
}

function mimeForExt(name: string): string {
  const ext = path.extname(name).toLowerCase();
  const map: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
  };
  return map[ext] ?? "application/octet-stream";
}

function toOwnedKind(m: string): OwnedMediaKind {
  switch (kindFromMime(m)) {
    case "IMAGE":
      return OwnedMediaKind.IMAGE;
    case "VIDEO":
      return OwnedMediaKind.VIDEO;
    case "AUDIO":
      return OwnedMediaKind.AUDIO;
    case "DOCUMENT":
      return OwnedMediaKind.DOCUMENT;
    default:
      return OwnedMediaKind.OTHER;
  }
}

/**
 * List allowed roots from `CAMPAIGN_MEDIA_INDEX_ROOTS` (set in server env, never from browser).
 */
export function getAllowedMediaIndexRootsFromEnv(): string[] {
  return parseRootsFromEnv();
}

export type IndexLocalRootsResult = {
  created: number;
  /** All non-imported file visits (duplicates + filtered + too large). */
  skipped: number;
  /** Skipped because `ingestContentSha256` already exists. */
  duplicateCount: number;
  /** Skipped for size, mime, walk errors on single files (not root-level). */
  skippedOtherCount: number;
  errors: string[];
  indexedPaths: string[];
  /** `MediaIngestBatch.id` when a batch row was created (not dry-run). */
  importBatchId: string | null;
};

/**
 * Index all media files under each approved root: copy to managed storage and insert `OwnedMediaAsset` with LOCAL_INDEXED.
 */
export async function indexLocalMediaRootsFromEnv(options: { rootLabel: string; dryRun?: boolean }): Promise<IndexLocalRootsResult> {
  const roots = parseRootsFromEnv();
  if (roots.length === 0) {
    return {
      created: 0,
      skipped: 0,
      duplicateCount: 0,
      skippedOtherCount: 0,
      errors: [
        "CAMPAIGN_MEDIA_INDEX_ROOTS is not set. Add one or more absolute paths in server environment (e.g. H:/CampaignMedia/Approved;N:/B-roll).",
      ],
      indexedPaths: [],
      importBatchId: null,
    };
  }
  return indexLocalMediaRoots(roots, { ...options, rootLabel: options.rootLabel });
}

async function indexLocalMediaRoots(
  absoluteRoots: string[],
  options: { rootLabel: string; dryRun?: boolean }
): Promise<IndexLocalRootsResult> {
  const dataRoot = getDataRootDir();
  const errors: string[] = [];
  const indexedPaths: string[] = [];
  let created = 0;
  let duplicateCount = 0;
  let skippedOtherCount = 0;
  const duplicatePathSamples: string[] = [];
  const MAX_DUP_SAMPLES = 100;

  let importBatchId: string | null = null;
  if (!options.dryRun) {
    const b = await prisma.mediaIngestBatch.create({
      data: {
        sourceType: "LOCAL_FILESYSTEM",
        sourceLabel: options.rootLabel,
        status: MediaIngestBatchStatus.STARTED,
        metadataJson: {
          roots: absoluteRoots.map((r) => path.basename(path.normalize(r))),
          rootCount: absoluteRoots.length,
          startedAt: new Date().toISOString(),
          lineage: "LOCAL_INDEXED → OwnedMediaAsset (canonical names + importBatchId); derivative pipeline TODO",
        },
      },
    });
    importBatchId = b.id;
  }

  for (const root of absoluteRoots) {
    let st: { isDirectory: () => boolean } | null = null;
    try {
      st = await stat(root);
    } catch (e) {
      errors.push(`Cannot stat root ${root}: ${e instanceof Error ? e.message : String(e)}`);
      continue;
    }
    if (!st.isDirectory()) {
      errors.push(`Not a directory: ${root}`);
      continue;
    }
    const dataRootNorm = path.normalize(dataRoot);
    const rootNorm = path.normalize(root);
    if (rootNorm.startsWith(dataRootNorm) || dataRootNorm.startsWith(rootNorm)) {
      errors.push(
        `Refuse to index: root overlaps OWNED media data root (${dataRoot}) — add content outside that tree or use the upload pipeline.`
      );
      continue;
    }

    const walk = async (dir: string, depth: number) => {
      if (depth > MAX_DEPTH) return;
      let entries: { name: string; isDirectory: () => boolean; isFile: () => boolean }[] = [];
      try {
        entries = await readdir(dir, { withFileTypes: true });
      } catch (e) {
        errors.push(`readdir ${dir}: ${e instanceof Error ? e.message : String(e)}`);
        return;
      }
      for (const ent of entries) {
        if (ent.name.startsWith(".") && ent.name !== ".") continue;
        if (SKIP_DIR_NAMES.has(ent.name.toLowerCase())) continue;
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) {
          await walk(full, depth + 1);
          continue;
        }
        if (!ent.isFile()) continue;
        let mtime: Date | null = null;
        try {
          const s = await stat(full);
          if (!s.isFile() || s.size <= 0 || s.size > MAX_BYTES) {
            skippedOtherCount += 1;
            continue;
          }
          mtime = s.mtime ?? null;
        } catch {
          skippedOtherCount += 1;
          continue;
        }
        const relFromRoot = path.relative(rootNorm, full) || ent.name;
        const mime = mimeForExt(full);
        if (!mime.startsWith("image/") && !mime.startsWith("video/") && !mime.startsWith("audio/") && !mime.startsWith("application/pdf")) {
          skippedOtherCount += 1;
          continue;
        }

        let buf: Buffer;
        try {
          buf = await readFile(full);
        } catch (e) {
          errors.push(`readFile ${full}: ${e instanceof Error ? e.message : String(e)}`);
          continue;
        }
        if (buf.length > MAX_BYTES) {
          skippedOtherCount += 1;
          continue;
        }
        const hash = sha256Buffer(buf);
        const exists = await prisma.ownedMediaAsset.findFirst({ where: { ingestContentSha256: hash } });
        if (exists) {
          duplicateCount += 1;
          if (duplicatePathSamples.length < MAX_DUP_SAMPLES) {
            duplicatePathSamples.push(relFromRoot.replace(/\\/g, "/"));
          }
          continue;
        }

        if (options.dryRun) {
          created += 1;
          indexedPaths.push(full);
          continue;
        }

        const id = generateLocalId();
        const year = (mtime ?? new Date()).getUTCFullYear();
        const origBase = path.basename(full);
        const anchor = mtime ?? new Date();
        const { fileName: canonicalName } = buildIngestOriginalCanonicalName({
          originalBaseName: origBase,
          anchorDate: anchor,
          ext: path.extname(full),
          ingestMode: "local-index",
          uniquenessKey: id,
        });
        const storageKey = buildOwnedStorageKey({ assetId: id, year, fileName: canonicalName });
        const absTarget = storageKeyToAbsoluteFilePath(storageKey);
        await mkdir(path.dirname(absTarget), { recursive: true });
        await writeFile(absTarget, buf);

        const kind = toOwnedKind(mime);
        const title = path.basename(full, path.extname(full)) || path.basename(full);

        try {
          await prisma.ownedMediaAsset.create({
            data: {
              id,
              storageKey,
              storageBackend: OwnedMediaStorageBackend.LOCAL_DISK,
              publicUrl: null,
              fileName: canonicalName,
              originalFileName: origBase,
              canonicalFileName: canonicalName,
              fileSizeBytes: buf.length,
              mimeType: mime,
              kind,
              role: OwnedMediaRole.OTHER,
              title,
              sourceType: OwnedMediaSourceType.LOCAL_INDEXED,
              reviewStatus: OwnedMediaReviewStatus.PENDING_REVIEW,
              isPublic: false,
              ingestContentSha256: hash,
              localIngestRelativePath: relFromRoot.replace(/\\/g, "/"),
              indexSourceLabel: options.rootLabel,
              mediaIngestBatchId: importBatchId,
              metadataJson: {
                indexedFrom: pathToFileURL(root).toString(),
                pathNote: "server-side index only",
                sourceRootLabel: path.basename(rootNorm),
                importBatchId,
                /// Derivative / proxy jobs: enqueue `OwnedMediaDerivativeJob` when pipeline ready (TODO).
                derivativePlanned: false,
              },
            },
          });
          created += 1;
          indexedPaths.push(full);
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          errors.push(`DB insert for ${full}: ${msg}`);
        }
      }
    };
    await walk(rootNorm, 0);
  }

  if (importBatchId) {
    try {
      await prisma.mediaIngestBatch.update({
        where: { id: importBatchId },
        data: {
          status: errors.length > 0 ? MediaIngestBatchStatus.PARTIAL : MediaIngestBatchStatus.COMPLETE,
          finishedAt: new Date(),
          importedCount: created,
          duplicateCount,
          failedCount: errors.length,
          notes:
            errors.length > 0
              ? `Completed with ${errors.length} error line(s). Duplicates: ${duplicateCount}, other skips: ${skippedOtherCount}.`
              : `Imported ${created}, duplicate SHA skips: ${duplicateCount}, other skips: ${skippedOtherCount}.`,
          metadataJson: {
            roots: absoluteRoots.map((r) => path.basename(path.normalize(r))),
            rootPathsCount: absoluteRoots.length,
            duplicatePathSamples,
            duplicateCount,
            skippedOtherCount,
            finishedAt: new Date().toISOString(),
          },
        },
      });
    } catch (e) {
      errors.push(`Failed to finalize import batch: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  const skipped = duplicateCount + skippedOtherCount;
  return { created, skipped, duplicateCount, skippedOtherCount, errors, indexedPaths, importBatchId };
}
