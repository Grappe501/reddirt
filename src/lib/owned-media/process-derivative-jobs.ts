/**
 * WEB_JPEG + THUMBNAIL derivative worker — claim jobs, write child assets, retry-safe.
 */

import {
  OwnedMediaDerivativeJobStatus,
  OwnedMediaDerivativeType,
  OwnedMediaKind,
  OwnedMediaReviewStatus,
  OwnedMediaSourceType,
  type Prisma,
} from "@prisma/client";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import { resolveOwnedMediaAbsolutePath, saveOwnedMediaForRuntime } from "@/lib/owned-media/runtime-storage";
import { readFile } from "node:fs/promises";

const WORKER_TYPES: OwnedMediaDerivativeType[] = [
  OwnedMediaDerivativeType.WEB_JPEG,
  OwnedMediaDerivativeType.THUMBNAIL,
];

export type DerivativeWorkerResult = {
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
  errors: { jobId: string; message: string }[];
};

async function loadSourceBuffer(sourceAssetId: string): Promise<{
  buffer: Buffer;
  mimeType: string;
  fileName: string;
  kind: OwnedMediaKind;
  title: string;
  approvedForPublicSite: boolean;
  rootAssetId: string | null;
}> {
  const source = await prisma.ownedMediaAsset.findUniqueOrThrow({ where: { id: sourceAssetId } });
  if (source.kind !== OwnedMediaKind.IMAGE) {
    throw new Error("WEB/THUMB worker supports IMAGE sources only in Phase 1");
  }
  const abs = await resolveOwnedMediaAbsolutePath(source);
  const buffer = await readFile(abs);
  return {
    buffer,
    mimeType: source.mimeType,
    fileName: source.fileName,
    kind: source.kind,
    title: source.title,
    approvedForPublicSite: source.approvedForPublicSite,
    rootAssetId: source.rootAssetId ?? source.id,
  };
}

async function renderDerivative(
  buffer: Buffer,
  type: OwnedMediaDerivativeType,
): Promise<{ out: Buffer; width: number; height: number; mimeType: string }> {
  const sharpMod = await import("sharp");
  const sharp = sharpMod.default;
  const pipeline = sharp(buffer).rotate();
  const meta = await pipeline.metadata();

  if (type === OwnedMediaDerivativeType.THUMBNAIL) {
    const out = await sharp(buffer)
      .rotate()
      .resize(640, 640, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 84, mozjpeg: true })
      .toBuffer({ resolveWithObject: true });
    return {
      out: out.data,
      width: out.info.width,
      height: out.info.height,
      mimeType: "image/jpeg",
    };
  }

  // WEB_JPEG
  const maxEdge = 1920;
  const out = await sharp(buffer)
    .rotate()
    .resize(maxEdge, maxEdge, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });

  return {
    out: out.data,
    width: out.info.width ?? meta.width ?? maxEdge,
    height: out.info.height ?? meta.height ?? maxEdge,
    mimeType: "image/jpeg",
  };
}

async function claimNextJob(): Promise<{ id: string; sourceAssetId: string; targetDerivativeType: OwnedMediaDerivativeType } | null> {
  const candidate = await prisma.ownedMediaDerivativeJob.findFirst({
    where: {
      targetDerivativeType: { in: WORKER_TYPES },
      status: { in: [OwnedMediaDerivativeJobStatus.PLANNED, OwnedMediaDerivativeJobStatus.QUEUED] },
    },
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
  });
  if (!candidate) return null;

  const updated = await prisma.ownedMediaDerivativeJob.updateMany({
    where: {
      id: candidate.id,
      status: { in: [OwnedMediaDerivativeJobStatus.PLANNED, OwnedMediaDerivativeJobStatus.QUEUED] },
    },
    data: {
      status: OwnedMediaDerivativeJobStatus.RUNNING,
      startedAt: new Date(),
      lastError: null,
    },
  });
  if (updated.count !== 1) return null;

  return {
    id: candidate.id,
    sourceAssetId: candidate.sourceAssetId,
    targetDerivativeType: candidate.targetDerivativeType,
  };
}

async function processOneJob(job: {
  id: string;
  sourceAssetId: string;
  targetDerivativeType: OwnedMediaDerivativeType;
}): Promise<void> {
  const existingChild = await prisma.ownedMediaAsset.findFirst({
    where: {
      parentAssetId: job.sourceAssetId,
      derivativeType: job.targetDerivativeType,
    },
    select: { id: true },
  });
  if (existingChild) {
    await prisma.ownedMediaDerivativeJob.update({
      where: { id: job.id },
      data: {
        status: OwnedMediaDerivativeJobStatus.SUCCEEDED,
        finishedAt: new Date(),
        lastError: null,
        payloadJson: { skipped: true, reason: "derivative_already_exists", childAssetId: existingChild.id } as Prisma.InputJsonValue,
      },
    });
    return;
  }

  const source = await loadSourceBuffer(job.sourceAssetId);
  const rendered = await renderDerivative(source.buffer, job.targetDerivativeType);
  const childId = randomUUID();
  const suffix = job.targetDerivativeType === OwnedMediaDerivativeType.THUMBNAIL ? "thumb" : "web";
  const fileName = `${suffix}-${source.fileName.replace(/\.[^.]+$/, "")}.jpg`;

  const saved = await saveOwnedMediaForRuntime({
    assetId: childId,
    fileName,
    mimeType: rendered.mimeType,
    buffer: rendered.out,
  });

  await prisma.ownedMediaAsset.create({
    data: {
      id: childId,
      storageKey: saved.storageKey,
      storageBackend: saved.storageBackend,
      publicUrl: saved.publicUrl,
      fileName: saved.fileName,
      fileSizeBytes: saved.fileSizeBytes,
      mimeType: saved.mimeType,
      kind: OwnedMediaKind.IMAGE,
      title: `${source.title} (${job.targetDerivativeType})`,
      width: rendered.width,
      height: rendered.height,
      sourceType: OwnedMediaSourceType.IMPORT,
      reviewStatus: OwnedMediaReviewStatus.APPROVED,
      parentAssetId: job.sourceAssetId,
      rootAssetId: source.rootAssetId,
      derivativeType: job.targetDerivativeType,
      approvedForPublicSite: source.approvedForPublicSite,
      isPublic: source.approvedForPublicSite,
    },
  });

  await prisma.ownedMediaDerivativeJob.update({
    where: { id: job.id },
    data: {
      status: OwnedMediaDerivativeJobStatus.SUCCEEDED,
      finishedAt: new Date(),
      lastError: null,
      payloadJson: {
        childAssetId: childId,
        width: rendered.width,
        height: rendered.height,
        bytes: rendered.out.length,
        mimeType: rendered.mimeType,
      } as Prisma.InputJsonValue,
    },
  });
}

/** Process up to `limit` WEB/THUMB jobs. Safe to call repeatedly. */
export async function processOwnedMediaDerivativeJobs(limit = 5): Promise<DerivativeWorkerResult> {
  const result: DerivativeWorkerResult = {
    processed: 0,
    succeeded: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  for (let i = 0; i < limit; i += 1) {
    const job = await claimNextJob();
    if (!job) break;
    result.processed += 1;
    try {
      await processOneJob(job);
      result.succeeded += 1;
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      result.failed += 1;
      result.errors.push({ jobId: job.id, message });
      await prisma.ownedMediaDerivativeJob.update({
        where: { id: job.id },
        data: {
          status: OwnedMediaDerivativeJobStatus.FAILED,
          finishedAt: new Date(),
          lastError: message.slice(0, 2000),
        },
      });
    }
  }

  return result;
}
