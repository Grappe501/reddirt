/**
 * Phase 11 P6 — Strategy alignment chunk preview inventory (async chunk matching).
 */
import {
  loadAllStrategyManualChunks,
  type StrategyManualChunk,
} from "@/lib/campaign-strategy/strategy-chunking";
import {
  resolvePromotionBatchId,
} from "@/lib/intelligence/v4/fieldBookChunkPromotionInventory";
import {
  getStrategyAlignmentChunkPreviewOverlay,
  type AlignmentChunkPreviewLaneId,
  ALIGNMENT_CHUNK_PREVIEW_LANE_IDS,
  strategyAlignmentChunkPreviewMeetsPhase11P6Bar,
} from "@/lib/intelligence/v4/phase11P6StrategyAlignmentChunkPreviewDepth";
import type { AlignmentChunkFilter } from "@/lib/intelligence/v4/phase11P6StrategyAlignmentChunkPreviewDepth";

export type AlignmentChunkPreviewLaneRow = {
  laneId: AlignmentChunkPreviewLaneId;
  label: string;
  href: string;
  matchingChunkCount: number;
  sampleChunkIds: string[];
  alignmentDoctrineIds: string[];
  phase11P6Enriched: boolean;
};

export type StrategyAlignmentChunkPreviewReport = {
  generatedAt: string;
  totalMatchingChunks: number;
  lanes: AlignmentChunkPreviewLaneRow[];
};

function chunkMatchesFilter(chunk: StrategyManualChunk, filter: AlignmentChunkFilter): boolean {
  if (filter.promotionBatchIds.length > 0) {
    const batchId = resolvePromotionBatchId(chunk);
    if (!filter.promotionBatchIds.includes(batchId)) return false;
  }
  if (filter.manualDomain && chunk.manualDomain !== filter.manualDomain) return false;
  if (filter.laneSection && chunk.laneSection !== filter.laneSection) return false;
  if (filter.pathKeyPrefix && !chunk.pathKey.startsWith(filter.pathKeyPrefix)) return false;
  return true;
}

export async function buildStrategyAlignmentChunkPreviewReport(): Promise<StrategyAlignmentChunkPreviewReport> {
  const chunks = await loadAllStrategyManualChunks();

  const lanes: AlignmentChunkPreviewLaneRow[] = ALIGNMENT_CHUNK_PREVIEW_LANE_IDS.map((laneId) => {
    const overlay = getStrategyAlignmentChunkPreviewOverlay(laneId);
    const matching = chunks.filter((c) => chunkMatchesFilter(c, overlay.chunkFilter));
    return {
      laneId,
      label: overlay.label,
      href: `/admin/intelligence/strategy-alignment-chunk-preview/${laneId}`,
      matchingChunkCount: matching.length,
      sampleChunkIds: matching.slice(0, 5).map((c) => c.id),
      alignmentDoctrineIds: overlay.alignmentDoctrineIds,
      phase11P6Enriched: strategyAlignmentChunkPreviewMeetsPhase11P6Bar(overlay),
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    totalMatchingChunks: lanes.reduce((s, l) => s + l.matchingChunkCount, 0),
    lanes,
  };
}

export function getChunksForLane(
  chunks: StrategyManualChunk[],
  laneId: AlignmentChunkPreviewLaneId,
  limit = 12,
): StrategyManualChunk[] {
  const overlay = getStrategyAlignmentChunkPreviewOverlay(laneId);
  return chunks.filter((c) => chunkMatchesFilter(c, overlay.chunkFilter)).slice(0, limit);
}
