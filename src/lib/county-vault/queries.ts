import { OwnedMediaReviewStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ownedMediaFileUrl, ownedMediaPreviewUrl } from "@/lib/media-library/public-urls";
import type { CountyVaultAssetDetail, CountyVaultListItem, CountyVaultSort, VaultEnrichmentMetadata } from "./types";

export type { CountyVaultSort } from "./types";

function parseEnrichment(raw: unknown): VaultEnrichmentMetadata {
  if (!raw || typeof raw !== "object") return {};
  return raw as VaultEnrichmentMetadata;
}

function publicVaultWhere(countySlug: string) {
  return {
    countySlug,
    OR: [
      { isPublic: true, reviewStatus: OwnedMediaReviewStatus.APPROVED },
      { approvedForPublicSite: true },
    ],
  };
}

function mapListItem(
  a: {
    id: string;
    title: string;
    kind: CountyVaultListItem["kind"];
    mimeType: string;
    fileName: string;
    city: string | null;
    eventDate: Date | null;
    capturedAt: Date | null;
    durationSeconds: number | null;
    issueTags: string[];
    enrichmentMetadata: unknown;
    transcripts: { transcriptText: string }[];
  },
): CountyVaultListItem {
  const enrichment = parseEnrichment(a.enrichmentMetadata);
  const t = a.transcripts[0];
  const excerpt = t?.transcriptText ? t.transcriptText.replace(/\s+/g, " ").trim().slice(0, 220) : null;
  return {
    id: a.id,
    title: enrichment.seo?.title ?? a.title,
    kind: a.kind,
    mimeType: a.mimeType,
    fileName: a.fileName,
    city: a.city,
    eventDate: a.eventDate ? a.eventDate.toISOString() : null,
    capturedAt: a.capturedAt ? a.capturedAt.toISOString() : null,
    previewUrl: ownedMediaPreviewUrl(a.id),
    fileUrl: ownedMediaFileUrl(a.id),
    hasTranscript: a.transcripts.length > 0,
    transcriptExcerpt: excerpt,
    summary: enrichment.vaultAnalysis?.summary ?? null,
    seoTitle: enrichment.seo?.title ?? null,
    durationSeconds: a.durationSeconds,
    issueTags: a.issueTags,
  };
}

export async function queryCountyVaultAssets(
  countySlug: string,
  opts?: { sort?: CountyVaultSort; kind?: string; q?: string; limit?: number },
): Promise<CountyVaultListItem[]> {
  const sort = opts?.sort ?? "newest";
  const orderBy =
    sort === "title"
      ? [{ title: "asc" as const }]
      : sort === "oldest"
        ? [{ capturedAt: "asc" as const }, { createdAt: "asc" as const }]
        : sort === "kind"
          ? [{ kind: "asc" as const }, { capturedAt: "desc" as const }]
          : [{ capturedAt: "desc" as const }, { createdAt: "desc" as const }];

  const rows = await prisma.ownedMediaAsset.findMany({
    where: {
      ...publicVaultWhere(countySlug),
      ...(opts?.kind ? { kind: opts.kind as never } : {}),
      ...(opts?.q?.trim()
        ? {
            OR: [
              { title: { contains: opts.q.trim(), mode: "insensitive" } },
              { description: { contains: opts.q.trim(), mode: "insensitive" } },
              { issueTags: { has: opts.q.trim().toLowerCase() } },
            ],
          }
        : {}),
    },
    orderBy,
    take: opts?.limit ?? 120,
    include: {
      transcripts: { select: { transcriptText: true }, take: 1, orderBy: { updatedAt: "desc" } },
    },
  });

  return rows.map(mapListItem);
}

export async function getCountyVaultAssetDetail(
  countySlug: string,
  assetId: string,
): Promise<CountyVaultAssetDetail | null> {
  const a = await prisma.ownedMediaAsset.findFirst({
    where: { id: assetId, ...publicVaultWhere(countySlug) },
    include: {
      transcripts: { orderBy: { updatedAt: "desc" }, take: 1 },
    },
  });
  if (!a) return null;

  const enrichment = parseEnrichment(a.enrichmentMetadata);
  const base = mapListItem({ ...a, transcripts: a.transcripts });
  return {
    ...base,
    description: a.description,
    speakerName: a.speakerName,
    transcriptText: a.transcripts[0]?.transcriptText ?? null,
    analysis: enrichment.vaultAnalysis ?? null,
    seo: enrichment.seo ?? null,
    metadataJson: a.metadataJson,
    fileSizeBytes: a.fileSizeBytes,
  };
}

export async function countCountyVaultAssets(countySlug: string): Promise<number> {
  return prisma.ownedMediaAsset.count({ where: publicVaultWhere(countySlug) });
}

/** Admin/operator view — all county assets regardless of publish state. */
export async function queryCountyVaultAssetsAdmin(countySlug: string, limit = 200) {
  return prisma.ownedMediaAsset.findMany({
    where: { countySlug },
    orderBy: [{ createdAt: "desc" }],
    take: limit,
    select: {
      id: true,
      title: true,
      kind: true,
      reviewStatus: true,
      isPublic: true,
      approvedForPublicSite: true,
      transcriptJobStatus: true,
      enrichmentMetadata: true,
      createdAt: true,
      mediaIngestBatchId: true,
    },
  });
}

export async function getCountyVaultStats(countySlug: string) {
  const [total, publicCount, withTranscript, videos] = await Promise.all([
    prisma.ownedMediaAsset.count({ where: { countySlug } }),
    prisma.ownedMediaAsset.count({ where: publicVaultWhere(countySlug) }),
    prisma.ownedMediaAsset.count({
      where: { countySlug, transcripts: { some: {} } },
    }),
    prisma.ownedMediaAsset.count({ where: { countySlug, kind: "VIDEO" } }),
  ]);
  return { total, publicCount, withTranscript, videos };
}
