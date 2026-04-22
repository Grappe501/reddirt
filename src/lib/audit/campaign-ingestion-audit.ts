import type { FolderInventoryEntry } from "./campaign-ingestion-inventory";
import { prisma } from "@/lib/db";

export const DEFAULT_CAMPAIGN_INGEST_FOLDER =
  process.platform === "win32"
    ? "H:\\SOSWebsite\\campaign information for ingestion"
    : "/mnt/data/campaign information for ingestion";

export type DbAuditRow = {
  id: string;
  fileName: string;
  localIngestRelativePath: string | null;
  ingestContentSha256: string | null;
  reviewStatus: string;
  isPublic: boolean;
  kind: string;
  mediaIngestBatchId: string | null;
  createdAt: string;
  ingestSourceBundle: string | null;
  ingestFrom: string | null;
  originalEntry: string | null;
  linkedCampaignEventId: string | null;
  countySlug: string | null;
  transcriptImportCount: number;
  transcriptAsrJobStatus: string | null;
  searchChunkCount: number;
  searchChunkPaths: string[];
};

export type ReconcileBuckets = {
  onDiskAndInDbByHash: string[];
  onDiskSupportedNotInDb: FolderInventoryEntry[];
  inDbButNotPublicEligible: DbAuditRow[];
  inDbZeroSearchChunks: DbAuditRow[];
  inDbNoImportTranscript: DbAuditRow[];
  duplicateHashesOnDisk: { hash: string; paths: string[] }[];
};

function metaBundle(m: unknown): string | null {
  if (!m || typeof m !== "object") return null;
  const b = (m as Record<string, unknown>).ingestSourceBundle;
  return typeof b === "string" ? b : null;
}

function metaFrom(m: unknown): string | null {
  if (!m || typeof m !== "object") return null;
  const b = (m as Record<string, unknown>).ingestFrom;
  return typeof b === "string" ? b : null;
}

function metaEntry(m: unknown): string | null {
  if (!m || typeof m !== "object") return null;
  const b = (m as Record<string, unknown>).originalEntry;
  return typeof b === "string" ? b : null;
}

export async function fetchMediaIngestBatchesForFolder(folderAbsPath: string): Promise<
  {
    id: string;
    sourceLabel: string;
    ingestPath: string | null;
    status: string;
    importedCount: number;
    duplicateCount: number;
    startedAt: string;
    finishedAt: string | null;
  }[]
> {
  const base = folderAbsPath.replace(/\\/g, "/");
  const tail = base.split("/").filter(Boolean).pop() ?? "";
  const rows = await prisma.mediaIngestBatch.findMany({
    where: {
      OR: [
        { ingestPath: { contains: tail } },
        { sourceLabel: { equals: tail } },
        { ingestPath: { contains: "campaign information for ingestion" } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return rows.map((r) => ({
    id: r.id,
    sourceLabel: r.sourceLabel,
    ingestPath: r.ingestPath,
    status: r.status,
    importedCount: r.importedCount,
    duplicateCount: r.duplicateCount,
    startedAt: r.startedAt.toISOString(),
    finishedAt: r.finishedAt?.toISOString() ?? null,
  }));
}

export async function fetchOwnedMediaForFolderAudit(options: {
  folderBasename: string;
  batchIds: string[];
}): Promise<DbAuditRow[]> {
  const { folderBasename, batchIds } = options;
  const needle = `%${folderBasename}%`;

  const metaHits = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM "OwnedMediaAsset"
    WHERE CAST("metadataJson" AS TEXT) ILIKE ${needle}
  `;
  const metaIds = new Set(metaHits.map((r) => r.id));

  const batchRows =
    batchIds.length > 0
      ? await prisma.ownedMediaAsset.findMany({
          where: { mediaIngestBatchId: { in: batchIds } },
          select: { id: true },
        })
      : [];
  for (const r of batchRows) metaIds.add(r.id);

  const idList = [...metaIds];
  if (idList.length === 0) return [];

  const candidates = await prisma.ownedMediaAsset.findMany({
    where: { id: { in: idList } },
    include: {
      transcripts: true,
      _count: { select: { transcripts: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const needleLower = folderBasename.toLowerCase();
  const filtered = candidates.filter((a) => {
    if (a.mediaIngestBatchId && batchIds.includes(a.mediaIngestBatchId)) return true;
    const bundle = metaBundle(a.metadataJson)?.toLowerCase() ?? "";
    return bundle.includes(needleLower);
  });

  const ids = filtered.map((a) => a.id);
  const chunkPaths = ids.flatMap((id) => [`briefing-doc:${id}`, `comms-doc:${id}`, `community-training-doc:${id}`]);
  const chunkGroups =
    chunkPaths.length === 0
      ? []
      : await prisma.searchChunk.groupBy({
          by: ["path"],
          where: { path: { in: chunkPaths } },
          _count: { _all: true },
        });

  const chunkCountByAsset = new Map<string, number>();
  const pathsByAsset = new Map<string, string[]>();
  for (const g of chunkGroups) {
    const pathVal = g.path;
    const m = /^(briefing-doc|comms-doc|community-training-doc):(.+)$/.exec(pathVal);
    if (!m) continue;
    const assetId = m[2]!;
    chunkCountByAsset.set(assetId, (chunkCountByAsset.get(assetId) ?? 0) + g._count._all);
    const arr = pathsByAsset.get(assetId) ?? [];
    arr.push(pathVal);
    pathsByAsset.set(assetId, arr);
  }

  return filtered.map((a) => ({
    id: a.id,
    fileName: a.fileName,
    localIngestRelativePath: a.localIngestRelativePath,
    ingestContentSha256: a.ingestContentSha256,
    reviewStatus: a.reviewStatus,
    isPublic: a.isPublic,
    kind: a.kind,
    mediaIngestBatchId: a.mediaIngestBatchId,
    createdAt: a.createdAt.toISOString(),
    ingestSourceBundle: metaBundle(a.metadataJson),
    ingestFrom: metaFrom(a.metadataJson),
    originalEntry: metaEntry(a.metadataJson),
    linkedCampaignEventId: a.linkedCampaignEventId,
    countySlug: a.countySlug,
    transcriptImportCount: a.transcripts.filter((t) => t.source === "IMPORT").length,
    transcriptAsrJobStatus: a.transcriptJobStatus,
    searchChunkCount: chunkCountByAsset.get(a.id) ?? 0,
    searchChunkPaths: pathsByAsset.get(a.id) ?? [],
  }));
}

export function reconcileFolderWithDb(
  inventory: FolderInventoryEntry[],
  dbRows: DbAuditRow[],
): ReconcileBuckets {
  const hashToDisk = new Map<string, string[]>();
  for (const e of inventory) {
    if (!e.contentSha256 || !e.wouldProcessAsLooseFile) continue;
    const arr = hashToDisk.get(e.contentSha256) ?? [];
    arr.push(e.relativePath);
    hashToDisk.set(e.contentSha256, arr);
  }

  const duplicateHashesOnDisk = [...hashToDisk.entries()]
    .filter(([, paths]) => paths.length > 1)
    .map(([hash, paths]) => ({ hash, paths }));

  const dbByHash = new Map<string, DbAuditRow>();
  for (const r of dbRows) {
    if (r.ingestContentSha256) dbByHash.set(r.ingestContentSha256, r);
  }

  const onDiskAndInDbByHash: string[] = [];
  const onDiskSupportedNotInDb: FolderInventoryEntry[] = [];

  for (const e of inventory) {
    if (!e.wouldProcessAsLooseFile || !e.contentSha256) continue;
    if (dbByHash.has(e.contentSha256)) onDiskAndInDbByHash.push(e.relativePath);
    else onDiskSupportedNotInDb.push(e);
  }

  const inDbButNotPublicEligible = dbRows.filter((r) => !(r.reviewStatus === "APPROVED" && r.isPublic));
  const inDbZeroSearchChunks = dbRows.filter((r) => r.searchChunkCount === 0 && r.kind === "DOCUMENT");
  const inDbNoImportTranscript = dbRows.filter((r) => {
    if (r.kind !== "DOCUMENT") return false;
    if (r.fileName.toLowerCase().endsWith(".pptx")) return false;
    return r.transcriptImportCount === 0;
  });

  return {
    onDiskAndInDbByHash,
    onDiskSupportedNotInDb,
    inDbButNotPublicEligible,
    inDbZeroSearchChunks,
    inDbNoImportTranscript,
    duplicateHashesOnDisk,
  };
}
