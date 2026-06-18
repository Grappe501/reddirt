import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import {
  GeoMetadataSource,
  MediaIngestBatchStatus,
  OwnedMediaKind,
  OwnedMediaReviewStatus,
  OwnedMediaRole,
  OwnedMediaSourceType,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { buildIngestOriginalCanonicalName } from "@/lib/owned-media/campaign-filename";
import { extractOwnedMediaMetadata } from "@/lib/owned-media/metadata/extract-owned-media-metadata";
import { saveOwnedMediaForRuntime } from "@/lib/owned-media/runtime-storage";
import { addAssetToCountyCollection, ensureCountyVaultCollection } from "./collections";
import type { VaultEnrichmentMetadata } from "./types";

export type IngestSingleAssetInput = {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  kind: OwnedMediaKind;
  countySlug: string;
  countyId: string | null;
  countyFips: string | null;
  city?: string | null;
  title?: string | null;
  batchId: string;
  createdBy?: string | null;
  zipSource?: string | null;
  sortOrder?: number;
};

export async function ingestSingleVaultAsset(input: IngestSingleAssetInput): Promise<string> {
  const id = randomUUID();
  const saved = await saveOwnedMediaForRuntime({
    assetId: id,
    fileName: input.fileName,
    mimeType: input.mimeType,
    buffer: input.buffer,
  });

  const title = (input.title ?? input.fileName).replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim() || input.fileName;
  const lm = new Date();
  const meta = await extractOwnedMediaMetadata({
    buffer: input.buffer,
    fileName: saved.fileName,
    mime: saved.mimeType,
    kind: input.kind,
    fileStat: { birthtime: lm, mtime: lm, ctime: lm },
  });

  const tagSet = new Set(meta.issueTagsFromFilename);
  const origName = input.fileName;
  const anchor = meta.capturedAt ?? lm;
  const { fileName: canonicalName } = buildIngestOriginalCanonicalName({
    originalBaseName: origName,
    anchorDate: anchor,
    ext: path.extname(origName) || path.extname(saved.fileName) || ".bin",
    ingestMode: "upload",
    countySlug: input.countySlug ?? meta.countySlug,
    subjectHint: title,
    uniquenessKey: id,
  });

  const enrichment: VaultEnrichmentMetadata = {
    vaultAnalysis: { status: "pending" },
    ingest: {
      batchId: input.batchId,
      zipSource: input.zipSource ?? undefined,
      extractedFromZip: Boolean(input.zipSource),
    },
  };

  await prisma.ownedMediaAsset.create({
    data: {
      id,
      storageKey: saved.storageKey,
      storageBackend: saved.storageBackend,
      publicUrl: saved.publicUrl,
      fileName: canonicalName,
      originalFileName: origName,
      canonicalFileName: canonicalName,
      fileSizeBytes: saved.fileSizeBytes,
      mimeType: saved.mimeType,
      kind: input.kind,
      role: OwnedMediaRole.EVENT,
      title,
      countySlug: input.countySlug,
      countyFips: input.countyFips ?? meta.countyFips,
      countyId: input.countyId,
      city: input.city ?? meta.city,
      issueTags: [...tagSet],
      sourceType: OwnedMediaSourceType.DIRECT_UPLOAD,
      reviewStatus: OwnedMediaReviewStatus.PENDING_REVIEW,
      isPublic: false,
      approvedForPublicSite: false,
      mediaIngestBatchId: input.batchId,
      createdBy: input.createdBy ?? null,
      metadataJson: meta.metadataJson as Prisma.InputJsonValue,
      enrichmentMetadata: enrichment as Prisma.InputJsonValue,
      width: meta.width,
      height: meta.height,
      capturedAt: meta.capturedAt,
      gpsLat: meta.gpsLat,
      gpsLng: meta.gpsLng,
      geoSource: meta.geoSource,
      geoConfidence: meta.geoConfidence,
      needsGeoReview: meta.needsGeoReview,
    },
  });

  const county = await prisma.county.findFirst({ where: { slug: input.countySlug }, select: { displayName: true } });
  const collection = await ensureCountyVaultCollection(input.countySlug, county?.displayName ?? input.countySlug);
  await addAssetToCountyCollection(collection.id, id, input.sortOrder ?? 0);

  return id;
}

export async function createVaultIngestBatch(params: {
  countySlug: string;
  sourceLabel: string;
  notes?: string;
  createdByUserId?: string | null;
  metadataJson?: Prisma.InputJsonValue;
}) {
  return prisma.mediaIngestBatch.create({
    data: {
      sourceType: "county_vault_upload",
      sourceLabel: params.sourceLabel,
      status: MediaIngestBatchStatus.STARTED,
      notes: params.notes ?? null,
      createdByUserId: params.createdByUserId ?? null,
      metadataJson: params.metadataJson,
    },
  });
}

export async function finalizeVaultIngestBatch(
  batchId: string,
  counts: { imported: number; skipped: number; failed: number },
) {
  const status =
    counts.failed > 0 && counts.imported === 0
      ? MediaIngestBatchStatus.FAILED
      : counts.failed > 0
        ? MediaIngestBatchStatus.PARTIAL
        : MediaIngestBatchStatus.COMPLETE;

  await prisma.mediaIngestBatch.update({
    where: { id: batchId },
    data: {
      status,
      importedCount: counts.imported,
      duplicateCount: 0,
      failedCount: counts.failed,
      finishedAt: new Date(),
    },
  });
}
