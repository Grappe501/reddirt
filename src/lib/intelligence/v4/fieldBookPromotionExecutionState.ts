/**
 * Phase 11 P8 — persisted Field Book promotion execution state.
 */
import fs from "node:fs";
import path from "node:path";
import type { PromotionExecutionWaveId } from "@/lib/intelligence/v4/phase11P8FieldBookPromotionExecutionDepth";
import type { PromotionExecutionWaveStatus } from "@/lib/intelligence/v4/phase11P8FieldBookPromotionExecutionDepth";

export type PromotionExecutionWaveState = {
  waveId: PromotionExecutionWaveId;
  linkedChunkCount: number;
  status: PromotionExecutionWaveStatus;
};

export type FieldBookPromotionExecutionStateFile = {
  generatedAt: string;
  totalLinkedChunks: number;
  waves: PromotionExecutionWaveState[];
};

const STATE_REL = path.join("data", "intelligence", "field-book-promotion-execution-state.json");

export function fieldBookPromotionExecutionStatePath(root = process.cwd()): string {
  return path.join(root, STATE_REL);
}

export function loadFieldBookPromotionExecutionState(
  root = process.cwd(),
): FieldBookPromotionExecutionStateFile | null {
  const file = fieldBookPromotionExecutionStatePath(root);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as FieldBookPromotionExecutionStateFile;
  } catch {
    return null;
  }
}

export function saveFieldBookPromotionExecutionState(
  state: FieldBookPromotionExecutionStateFile,
  root = process.cwd(),
): void {
  const file = fieldBookPromotionExecutionStatePath(root);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

export function stateFromExecutionReport(report: {
  generatedAt: string;
  totalLinkedChunks: number;
  waves: Array<{
    waveId: PromotionExecutionWaveId;
    linkedChunkCount: number;
    status: PromotionExecutionWaveStatus;
  }>;
}): FieldBookPromotionExecutionStateFile {
  return {
    generatedAt: report.generatedAt,
    totalLinkedChunks: report.totalLinkedChunks,
    waves: report.waves.map((w) => ({
      waveId: w.waveId,
      linkedChunkCount: w.linkedChunkCount,
      status: w.status,
    })),
  };
}
