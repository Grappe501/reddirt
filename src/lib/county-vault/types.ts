import type { OwnedMediaKind } from "@prisma/client";

export type CountyVaultSort = "newest" | "oldest" | "title" | "kind";

/** Stored in `OwnedMediaAsset.enrichmentMetadata` for vault AI + SEO. */
export type VaultEnrichmentMetadata = {
  vaultAnalysis?: VaultAnalysisBlock;
  seo?: VaultSeoBlock;
  ingest?: {
    batchId?: string;
    zipSource?: string;
    extractedFromZip?: boolean;
    analyzedAt?: string;
  };
};

export type VaultAnalysisBlock = {
  status: "pending" | "running" | "complete" | "error" | "skipped";
  analyzedAt?: string;
  model?: string;
  summary?: string;
  analysis?: string;
  topics?: string[];
  speakers?: string[];
  mood?: string;
  audience?: string;
  keyMoments?: Array<{ timestamp?: string; label: string; quote?: string }>;
  pullQuotes?: string[];
  claimsNotes?: string[];
  error?: string;
};

export type VaultSeoBlock = {
  title: string;
  description: string;
  keywords: string[];
  slug: string;
  ogTitle?: string;
  ogDescription?: string;
  canonicalPath?: string;
  fileTitle?: string;
};

export type CountyVaultListItem = {
  id: string;
  title: string;
  kind: OwnedMediaKind;
  mimeType: string;
  fileName: string;
  city: string | null;
  eventDate: string | null;
  capturedAt: string | null;
  previewUrl: string;
  fileUrl: string;
  hasTranscript: boolean;
  transcriptExcerpt: string | null;
  summary: string | null;
  seoTitle: string | null;
  durationSeconds: number | null;
  issueTags: string[];
};

export type CountyVaultAssetDetail = CountyVaultListItem & {
  description: string | null;
  speakerName: string | null;
  transcriptText: string | null;
  analysis: VaultAnalysisBlock | null;
  seo: VaultSeoBlock | null;
  metadataJson: unknown;
  fileSizeBytes: number;
};

export type CountyVaultUploadResult = {
  ok: true;
  batchId: string;
  assetIds: string[];
  imported: number;
  skipped: number;
  errors: string[];
  analysisQueued: number;
};
