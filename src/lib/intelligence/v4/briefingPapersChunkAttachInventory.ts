/**
 * Phase 11 P7 — Briefing papers chunk attach inventory.
 */
import { loadAllStrategyManualChunks, type StrategyManualChunk } from "@/lib/campaign-strategy/strategy-chunking";
import { resolvePromotionBatchId } from "@/lib/intelligence/v4/fieldBookChunkPromotionInventory";
import {
  getStrategyAlignmentChunkPreviewOverlay,
  type AlignmentChunkPreviewLaneId,
} from "@/lib/intelligence/v4/phase11P6StrategyAlignmentChunkPreviewDepth";
import {
  BRIEFING_PAPER_ATTACH_LANE_IDS,
  briefingPaperAttachMeetsPhase11P7Bar,
  getBriefingPaperAttachOverlay,
  type BriefingPaperAttachLaneId,
} from "@/lib/intelligence/v4/phase11P7BriefingPapersChunkAttachDepth";

export type BriefingPaperAttachLaneRow = {
  laneId: BriefingPaperAttachLaneId;
  paperId: string;
  label: string;
  href: string;
  attachableChunkCount: number;
  sampleChunkIds: string[];
  linkedPreviewLanes: AlignmentChunkPreviewLaneId[];
  phase11P7Enriched: boolean;
};

export type BriefingPapersChunkAttachReport = {
  generatedAt: string;
  totalAttachableChunks: number;
  lanes: BriefingPaperAttachLaneRow[];
};

function chunkInPreviewLane(chunk: StrategyManualChunk, previewLaneId: AlignmentChunkPreviewLaneId): boolean {
  const overlay = getStrategyAlignmentChunkPreviewOverlay(previewLaneId);
  const filter = overlay.chunkFilter;
  if (filter.promotionBatchIds.length > 0) {
    const batchId = resolvePromotionBatchId(chunk);
    if (!filter.promotionBatchIds.includes(batchId)) return false;
  }
  if (filter.manualDomain && chunk.manualDomain !== filter.manualDomain) return false;
  if (filter.laneSection && chunk.laneSection !== filter.laneSection) return false;
  if (filter.pathKeyPrefix && !chunk.pathKey.startsWith(filter.pathKeyPrefix)) return false;
  return true;
}

function chunkMatchesAttachLane(chunk: StrategyManualChunk, laneId: BriefingPaperAttachLaneId): boolean {
  const overlay = getBriefingPaperAttachOverlay(laneId);
  const batchId = resolvePromotionBatchId(chunk);
  const inBatch = overlay.linkedPromotionBatches.includes(batchId);
  const inPreview =
    overlay.linkedPreviewLanes.length === 0 ||
    overlay.linkedPreviewLanes.some((pl) => chunkInPreviewLane(chunk, pl));
  return inBatch || inPreview;
}

export async function buildBriefingPapersChunkAttachReport(): Promise<BriefingPapersChunkAttachReport> {
  const chunks = await loadAllStrategyManualChunks();

  const lanes: BriefingPaperAttachLaneRow[] = BRIEFING_PAPER_ATTACH_LANE_IDS.map((laneId) => {
    const overlay = getBriefingPaperAttachOverlay(laneId);
    const matching = chunks.filter((c) => chunkMatchesAttachLane(c, laneId));
    return {
      laneId,
      paperId: overlay.paperId,
      label: overlay.label,
      href: `/admin/intelligence/briefing-papers-chunk-attach/${laneId}`,
      attachableChunkCount: matching.length,
      sampleChunkIds: matching.slice(0, 5).map((c) => c.id),
      linkedPreviewLanes: overlay.linkedPreviewLanes,
      phase11P7Enriched: briefingPaperAttachMeetsPhase11P7Bar(overlay),
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    totalAttachableChunks: lanes.reduce((s, l) => s + l.attachableChunkCount, 0),
    lanes,
  };
}

export function getAttachLaneSampleChunks(
  chunks: StrategyManualChunk[],
  laneId: BriefingPaperAttachLaneId,
  limit = 8,
): StrategyManualChunk[] {
  return chunks.filter((c) => chunkMatchesAttachLane(c, laneId)).slice(0, limit);
}
