/**
 * Phase 11 P8 — Field Book promotion execution inventory.
 */
import { loadFieldBookChunkPromotionState } from "@/lib/intelligence/v4/fieldBookChunkPromotionState";
import {
  fieldBookPromotionExecutionMeetsPhase11P8Bar,
  getFieldBookPromotionExecutionOverlay,
  PROMOTION_EXECUTION_WAVE_IDS,
  type PromotionExecutionWaveId,
  type PromotionExecutionWaveStatus,
} from "@/lib/intelligence/v4/phase11P8FieldBookPromotionExecutionDepth";

export type PromotionExecutionWaveRow = {
  waveId: PromotionExecutionWaveId;
  label: string;
  href: string;
  linkedChunkCount: number;
  linkedBatchCount: number;
  status: PromotionExecutionWaveStatus;
  phase11P8Enriched: boolean;
};

export type FieldBookPromotionExecutionReport = {
  generatedAt: string;
  totalLinkedChunks: number;
  waves: PromotionExecutionWaveRow[];
};

function defaultWaveStatus(waveId: PromotionExecutionWaveId): PromotionExecutionWaveStatus {
  if (waveId === "canon-closure-wave") return "pending";
  return "preview_ready";
}

export function buildFieldBookPromotionExecutionReport(
  statusByWave?: Partial<Record<PromotionExecutionWaveId, PromotionExecutionWaveStatus>>,
): FieldBookPromotionExecutionReport {
  const promoState = loadFieldBookChunkPromotionState();

  const waves: PromotionExecutionWaveRow[] = PROMOTION_EXECUTION_WAVE_IDS.map((waveId) => {
    const overlay = getFieldBookPromotionExecutionOverlay(waveId);
    let linkedChunkCount = 0;
    if (waveId === "canon-closure-wave") {
      linkedChunkCount = promoState?.totalChunks ?? 0;
    } else {
      for (const batchId of overlay.linkedBatchIds) {
        const batch = promoState?.batches.find((b) => b.batchId === batchId);
        linkedChunkCount += batch?.chunkCount ?? 0;
      }
    }
    return {
      waveId,
      label: overlay.label,
      href: `/admin/intelligence/field-book-promotion-execution/${waveId}`,
      linkedChunkCount,
      linkedBatchCount: overlay.linkedBatchIds.length,
      status: statusByWave?.[waveId] ?? defaultWaveStatus(waveId),
      phase11P8Enriched: fieldBookPromotionExecutionMeetsPhase11P8Bar(overlay),
    };
  });

  const uniqueChunkTotal = promoState?.totalChunks ?? waves
    .filter((w) => w.waveId !== "canon-closure-wave")
    .reduce((s, w) => s + w.linkedChunkCount, 0);

  return {
    generatedAt: new Date().toISOString(),
    totalLinkedChunks: uniqueChunkTotal,
    waves,
  };
}
