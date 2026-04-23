import { createHash, randomUUID } from "node:crypto";
import { readFile, rename, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { Prisma, OwnedMediaKind, OwnedMediaReviewStatus, OwnedMediaRole, OwnedMediaSourceType, OwnedMediaStorageBackend } from "@prisma/client";
import { prisma } from "@/lib/db";
import { extractOwnedMediaMetadata } from "@/lib/owned-media/metadata/extract-owned-media-metadata";
import type { IngestLogger } from "./logger";
import { guessMimeType, isSupportedExt, kindFromMime } from "./mime";
import { getCampaignMediaBucketName, getPublicUrlForPath, uploadObject } from "./supabase-storage";
import { isProbablyVideo, tryBuildImageThumbnail, videoFrameThumbnailStub } from "./thumbnails";

const processing = new Set<string>();

function sha256(buf: Buffer): string {
  return createHash("sha256").update(buf).digest("hex");
}

function sanitizeFileNameForKey(name: string): string {
  return path
    .basename(name)
    .replace(/[^\w.\-()\säöüß]/gi, "_")
    .replace(/\s+/g, "_")
    .slice(0, 200) || "file.bin";
}

async function buildUniqueObjectPath(fileName: string, hashPrefix: string): Promise<string> {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const base = sanitizeFileNameForKey(fileName);
  let rel = `media/${y}/${m}/${base}`;
  const exists = await prisma.ownedMediaAsset.findFirst({ where: { storageKey: rel } });
  if (exists) {
    const short = hashPrefix.slice(0, 8);
    const ext = path.extname(base) || ".bin";
    const stem = path.basename(base, ext);
    rel = `media/${y}/${m}/${stem}_${short}${ext}`;
  }
  return rel;
}

/**
 * Ingests one file from disk into Supabase Storage + `OwnedMediaAsset` (idempotent on SHA-256).
 */
export async function ingestFileFromPath(params: {
  absolutePath: string;
  watchRoot: string;
  campaignMediaRoot: string;
  logger: IngestLogger;
}) {
  const { absolutePath, watchRoot, campaignMediaRoot, logger } = params;
  const abs = path.resolve(absolutePath);
  if (processing.has(abs)) {
    return;
  }
  processing.add(abs);
  const root = campaignMediaRoot;
  try {
    if (!(await import("node:fs/promises").then((fs) => fs.stat(abs).then(() => true).catch(() => false)))) {
      return;
    }
    const st = await stat(abs);
    if (st.isDirectory()) {
      return;
    }

    const baseName = path.basename(abs);
    if (baseName.startsWith(".") || baseName === "Thumbs.db" || baseName === "ingest.log") {
      return;
    }

    logger.info("file detected", { path: abs, size: st.size, birthtime: st.birthtime.toISOString(), mtime: st.mtime.toISOString() });

    if (!isSupportedExt(abs)) {
      logger.warn("skipping unsupported type", { path: abs });
      return;
    }

    const buffer = await readFile(abs);
    if (buffer.length === 0) {
      logger.warn("empty file skipped", { path: abs });
      return;
    }

    const contentHash = sha256(buffer);
    const dupe = await prisma.ownedMediaAsset.findFirst({ where: { ingestContentSha256: contentHash } });
    if (dupe) {
      logger.warn("duplicate content hash, skipping", { path: abs, existingId: dupe.id });
      await moveUnderCampaignRoot(abs, "duplicate", baseName, campaignMediaRoot, logger);
      return;
    }

    const mime = guessMimeType(abs);
    const kind = kindFromMime(mime) as OwnedMediaKind;
    if (kind === "OTHER") {
      logger.warn("skipping unclassified kind", { path: abs, mime });
      return;
    }

    if (isProbablyVideo(baseName, mime) || kind === "VIDEO") {
      videoFrameThumbnailStub(buffer, baseName, logger);
    }

    const extracted = await extractOwnedMediaMetadata({
      buffer,
      fileName: baseName,
      mime,
      kind,
      fileStat: { birthtime: st.birthtime, mtime: st.mtime, ctime: st.ctime },
    });
    const { metadataJson, issueTagsFromFilename, gpsLat, gpsLng, ...geoRest } = extracted;
    const { capturedAt, countySlug, countyFips, city, geoSource, geoConfidence, needsGeoReview, width, height } = geoRest;
    const issueTags: string[] = [...issueTagsFromFilename];

    const id = randomUUID();
    const objectPath = await buildUniqueObjectPath(baseName, contentHash);

    const upload = await uploadObject({ path: objectPath, data: buffer, contentType: mime });
    logger.success("storage upload success", { path: objectPath, bucket: getCampaignMediaBucketName() });

    let thumbStorageKey: string | null = null;
    let thumbPublicUrl: string | null = null;
    if (kind === "IMAGE") {
      const tb = await tryBuildImageThumbnail(buffer, mime, baseName, logger);
      if (tb) {
        const d = new Date();
        const y = d.getUTCFullYear();
        const m = String(d.getUTCMonth() + 1).padStart(2, "0");
        thumbStorageKey = `media/${y}/${m}/thumbs/${id}.jpg`;
        const supabase = (await import("./supabase-storage")).getSupabaseServiceClient();
        const bucket = (await import("./supabase-storage")).getCampaignMediaBucketName();
        const { error: te } = await supabase.storage.from(bucket).upload(thumbStorageKey, tb, { contentType: "image/jpeg", upsert: false });
        if (!te) {
          thumbPublicUrl = getPublicUrlForPath(thumbStorageKey);
          logger.success("thumbnail upload success", { thumbStorageKey });
        } else {
          logger.warn("thumbnail upload failed", { err: String(te) });
        }
      }
    }

    const relFromWatch = path.relative(watchRoot, abs) || baseName;
    const role: OwnedMediaRole =
      kind === "IMAGE" ? OwnedMediaRole.PHOTO : kind === "VIDEO" ? OwnedMediaRole.B_ROLL : kind === "AUDIO" ? OwnedMediaRole.SPEECH : OwnedMediaRole.OTHER;

    await prisma.ownedMediaAsset.create({
      data: {
        id,
        storageKey: objectPath,
        storageBackend: OwnedMediaStorageBackend.SUPABASE,
        publicUrl: upload.publicUrl,
        thumbStorageKey,
        thumbPublicUrl,
        fileName: baseName,
        originalFileName: baseName,
        fileSizeBytes: buffer.length,
        mimeType: mime,
        kind,
        role,
        title: path.basename(baseName, path.extname(baseName)) || baseName,
        sourceType: OwnedMediaSourceType.UPLOADED_CAMPAIGN,
        reviewStatus: OwnedMediaReviewStatus.PENDING_REVIEW,
        isPublic: false,
        metadataJson: metadataJson as Prisma.InputJsonValue,
        capturedAt,
        eventDate: null,
        width,
        height,
        gpsLat,
        gpsLng,
        countySlug,
        countyFips,
        city,
        issueTags,
        geoSource,
        geoConfidence,
        needsGeoReview,
        ingestContentSha256: contentHash,
        localIngestRelativePath: relFromWatch,
        uploaderName: null,
        uploaderEmail: null,
        consentCampaignUse: null,
      },
    });
    logger.success("database insert success", { id, storageKey: objectPath });

    await moveUnderCampaignRoot(
      abs,
      path.join("processed", String(new Date().getUTCFullYear()), String(new Date().getUTCMonth() + 1).padStart(2, "0")),
      baseName,
      campaignMediaRoot,
      logger
    );
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    logger.error("ingest failed", { path: absolutePath, err });
    try {
      const baseName = path.basename(absolutePath);
      await moveUnderCampaignRoot(absolutePath, "failed", baseName, root, logger);
    } catch (moveErr) {
      logger.error("failed to move to failed/ folder", { err: String(moveErr) });
    }
  } finally {
    processing.delete(path.resolve(absolutePath));
  }
}

async function moveUnderCampaignRoot(
  src: string,
  subDir: string,
  baseName: string,
  campaignMediaRoot: string,
  logger: IngestLogger
) {
  const destDir = path.join(campaignMediaRoot, subDir);
  await mkdir(destDir, { recursive: true });
  const dest = path.join(destDir, `${Date.now()}_${baseName}`);
  await rename(src, dest);
  logger.info("moved file", { to: dest });
}
