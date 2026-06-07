/**
 * Phase 11 P5 — persisted chunk promotion batch state (sync reads for closure).
 */
import fs from "node:fs";
import path from "node:path";
import type { PromotionBatchId } from "@/lib/intelligence/v4/phase11P5FieldBookChunkPromotionDepth";
import type { PromotionBatchStatus } from "@/lib/intelligence/v4/fieldBookChunkPromotionInventory";

export type FieldBookChunkPromotionBatchState = {
  batchId: PromotionBatchId;
  chunkCount: number;
  status: PromotionBatchStatus;
};

export type FieldBookChunkPromotionStateFile = {
  generatedAt: string;
  totalChunks: number;
  strategicPlanChunks: number;
  campaignSystemChunks: number;
  batches: FieldBookChunkPromotionBatchState[];
};

const STATE_REL = path.join("data", "intelligence", "field-book-chunk-promotion-state.json");

export function fieldBookChunkPromotionStatePath(root = process.cwd()): string {
  return path.join(root, STATE_REL);
}

export function loadFieldBookChunkPromotionState(root = process.cwd()): FieldBookChunkPromotionStateFile | null {
  const file = fieldBookChunkPromotionStatePath(root);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as FieldBookChunkPromotionStateFile;
  } catch {
    return null;
  }
}

export function saveFieldBookChunkPromotionState(
  state: FieldBookChunkPromotionStateFile,
  root = process.cwd(),
): void {
  const file = fieldBookChunkPromotionStatePath(root);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

export function stateFromInventoryReport(report: {
  generatedAt: string;
  totalChunks: number;
  strategicPlanChunks: number;
  campaignSystemChunks: number;
  batches: Array<{ batchId: PromotionBatchId; chunkCount: number; status: PromotionBatchStatus }>;
}): FieldBookChunkPromotionStateFile {
  return {
    generatedAt: report.generatedAt,
    totalChunks: report.totalChunks,
    strategicPlanChunks: report.strategicPlanChunks,
    campaignSystemChunks: report.campaignSystemChunks,
    batches: report.batches.map((b) => ({
      batchId: b.batchId,
      chunkCount: b.chunkCount,
      status: b.status,
    })),
  };
}

export function getBatchChunkCountFromState(
  state: FieldBookChunkPromotionStateFile | null,
  batchId: PromotionBatchId,
): number {
  return state?.batches.find((b) => b.batchId === batchId)?.chunkCount ?? 0;
}
