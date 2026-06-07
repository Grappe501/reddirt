/**
 * Phase 11 P5 — Field Book chunk promotion inventory & batch assignment.
 */
import { categoryIdFromRelativePath } from "@/lib/campaign-strategy/campaign-system-nav";
import {
  loadAllStrategyManualChunks,
  type StrategyManualChunk,
} from "@/lib/campaign-strategy/strategy-chunking";
import {
  getFieldBookChunkPromotionOverlay,
  type PromotionBatchId,
  PROMOTION_BATCH_IDS,
} from "@/lib/intelligence/v4/phase11P5FieldBookChunkPromotionDepth";

export type PromotionBatchStatus = "catalogued" | "preview_ready" | "claims_gated" | "promotion_ready";

export type PromotionBatchInventoryRow = {
  batchId: PromotionBatchId;
  label: string;
  chunkCount: number;
  status: PromotionBatchStatus;
  strategicPlanChunks: number;
  campaignSystemChunks: number;
  sampleChunkIds: string[];
  targetFieldBookSlugs: string[];
  phase11P5Enriched: boolean;
  href: string;
};

export type FieldBookChunkPromotionInventoryReport = {
  generatedAt: string;
  totalChunks: number;
  strategicPlanChunks: number;
  campaignSystemChunks: number;
  batches: PromotionBatchInventoryRow[];
};

export function resolvePromotionBatchId(chunk: StrategyManualChunk): PromotionBatchId {
  if (chunk.manualDomain === "strategic-plan") {
    if (chunk.laneSection === "foundation") return "kelly-foundation";
    if (chunk.laneSection === "programs") return "kelly-programs";
    return "kelly-operations";
  }

  const rel = chunk.sourceFile.replace(/^campaign-system-manual\//, "");
  const categoryId = categoryIdFromRelativePath(rel);
  return `csm-${categoryId}` as PromotionBatchId;
}

function defaultBatchStatus(chunkCount: number): PromotionBatchStatus {
  if (chunkCount === 0) return "catalogued";
  return "catalogued";
}

export async function buildFieldBookChunkPromotionInventory(
  statusByBatch?: Partial<Record<PromotionBatchId, PromotionBatchStatus>>,
): Promise<FieldBookChunkPromotionInventoryReport> {
  const chunks = await loadAllStrategyManualChunks();
  const byBatch = new Map<PromotionBatchId, StrategyManualChunk[]>();

  for (const id of PROMOTION_BATCH_IDS) {
    byBatch.set(id, []);
  }

  for (const chunk of chunks) {
    const batchId = resolvePromotionBatchId(chunk);
    byBatch.get(batchId)?.push(chunk);
  }

  const batches: PromotionBatchInventoryRow[] = PROMOTION_BATCH_IDS.map((batchId) => {
    const list = byBatch.get(batchId) ?? [];
    const overlay = getFieldBookChunkPromotionOverlay(batchId);
    const strategicPlanChunks = list.filter((c) => c.manualDomain === "strategic-plan").length;
    const campaignSystemChunks = list.filter((c) => c.manualDomain === "campaign-system").length;
    return {
      batchId,
      label: overlay.label,
      chunkCount: list.length,
      status: statusByBatch?.[batchId] ?? defaultBatchStatus(list.length),
      strategicPlanChunks,
      campaignSystemChunks,
      sampleChunkIds: list.slice(0, 3).map((c) => c.id),
      targetFieldBookSlugs: overlay.targetFieldBookSlugs,
      phase11P5Enriched: overlay.operatorSteps.length >= 3,
      href: `/admin/intelligence/field-book-chunk-promotion/${batchId}`,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    totalChunks: chunks.length,
    strategicPlanChunks: chunks.filter((c) => c.manualDomain === "strategic-plan").length,
    campaignSystemChunks: chunks.filter((c) => c.manualDomain === "campaign-system").length,
    batches,
  };
}

export function summarizePromotionInventory(report: FieldBookChunkPromotionInventoryReport): {
  batchesAtBar: number;
  batchTotal: number;
} {
  const batchTotal = report.batches.length;
  const batchesAtBar = report.batches.filter((b) => b.phase11P5Enriched).length;
  return { batchesAtBar, batchTotal };
}
