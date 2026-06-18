import type { Prisma } from "@prisma/client";
import { OwnedMediaKind } from "@prisma/client";
import { isZipArchive } from "@/lib/owned-media/storage";
import { extractMediaFromZipBuffer } from "./zip-ingest";
import {
  createVaultIngestBatch,
  finalizeVaultIngestBatch,
  ingestSingleVaultAsset,
} from "./ingest-asset";
import { runVaultAnalysisForAssets } from "./vault-analysis";
import type { CountyVaultUploadResult } from "./types";

export type VaultUploadFile = {
  fileName: string;
  mimeType: string;
  buffer: Buffer;
};

export type RunCountyVaultIngestInput = {
  countySlug: string;
  countyId: string | null;
  countyFips: string | null;
  city?: string | null;
  files: VaultUploadFile[];
  createdBy?: string | null;
  createdByUserId?: string | null;
  sourceLabel: string;
  runAnalysis?: boolean;
};

export async function runCountyVaultIngest(input: RunCountyVaultIngestInput): Promise<CountyVaultUploadResult> {
  const batch = await createVaultIngestBatch({
    countySlug: input.countySlug,
    sourceLabel: input.sourceLabel,
    notes: `County vault upload — ${input.files.length} file(s)`,
    createdByUserId: input.createdByUserId ?? null,
    metadataJson: { countySlug: input.countySlug, city: input.city ?? null } as Prisma.InputJsonValue,
  });

  const assetIds: string[] = [];
  const errors: string[] = [];
  let skipped = 0;
  let sortOrder = 0;

  for (const file of input.files) {
    try {
      if (isZipArchive(file.fileName, file.mimeType)) {
        const { files: extracted, skipped: zipSkipped } = await extractMediaFromZipBuffer(file.buffer, file.fileName);
        skipped += zipSkipped.length;
        for (const entry of extracted) {
          const id = await ingestSingleVaultAsset({
            buffer: entry.buffer,
            fileName: entry.fileName,
            mimeType: entry.mimeType,
            kind: entry.kind as OwnedMediaKind,
            countySlug: input.countySlug,
            countyId: input.countyId,
            countyFips: input.countyFips,
            city: input.city,
            batchId: batch.id,
            createdBy: input.createdBy,
            zipSource: file.fileName,
            sortOrder: sortOrder++,
          });
          assetIds.push(id);
        }
      } else {
        const kind = inferKindFromMime(file.mimeType);
        const id = await ingestSingleVaultAsset({
          buffer: file.buffer,
          fileName: file.fileName,
          mimeType: file.mimeType,
          kind,
          countySlug: input.countySlug,
          countyId: input.countyId,
          countyFips: input.countyFips,
          city: input.city,
          batchId: batch.id,
          createdBy: input.createdBy,
          sortOrder: sortOrder++,
        });
        assetIds.push(id);
      }
    } catch (e) {
      errors.push(`${file.fileName}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  await finalizeVaultIngestBatch(batch.id, {
    imported: assetIds.length,
    skipped,
    failed: errors.length,
  });

  let analysisQueued = 0;
  if (input.runAnalysis !== false && assetIds.length > 0) {
    analysisQueued = await runVaultAnalysisForAssets(assetIds);
  }

  return {
    ok: true,
    batchId: batch.id,
    assetIds,
    imported: assetIds.length,
    skipped,
    errors,
    analysisQueued,
  };
}

function inferKindFromMime(mime: string): OwnedMediaKind {
  if (mime.startsWith("image/")) return OwnedMediaKind.IMAGE;
  if (mime.startsWith("video/")) return OwnedMediaKind.VIDEO;
  if (mime.startsWith("audio/")) return OwnedMediaKind.AUDIO;
  if (mime === "application/pdf" || mime.startsWith("text/")) return OwnedMediaKind.DOCUMENT;
  return OwnedMediaKind.OTHER;
}
