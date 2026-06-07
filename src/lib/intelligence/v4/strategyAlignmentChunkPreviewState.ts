/**
 * Phase 11 P6 — persisted strategy alignment chunk preview state (sync reads for closure).
 */
import fs from "node:fs";
import path from "node:path";
import type { AlignmentChunkPreviewLaneId } from "@/lib/intelligence/v4/phase11P6StrategyAlignmentChunkPreviewDepth";

export type AlignmentChunkPreviewLaneState = {
  laneId: AlignmentChunkPreviewLaneId;
  matchingChunkCount: number;
};

export type StrategyAlignmentChunkPreviewStateFile = {
  generatedAt: string;
  totalMatchingChunks: number;
  lanes: AlignmentChunkPreviewLaneState[];
};

const STATE_REL = path.join("data", "intelligence", "strategy-alignment-chunk-preview-state.json");

export function strategyAlignmentChunkPreviewStatePath(root = process.cwd()): string {
  return path.join(root, STATE_REL);
}

export function loadStrategyAlignmentChunkPreviewState(
  root = process.cwd(),
): StrategyAlignmentChunkPreviewStateFile | null {
  const file = strategyAlignmentChunkPreviewStatePath(root);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as StrategyAlignmentChunkPreviewStateFile;
  } catch {
    return null;
  }
}

export function saveStrategyAlignmentChunkPreviewState(
  state: StrategyAlignmentChunkPreviewStateFile,
  root = process.cwd(),
): void {
  const file = strategyAlignmentChunkPreviewStatePath(root);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

export function stateFromPreviewReport(report: {
  generatedAt: string;
  totalMatchingChunks: number;
  lanes: Array<{ laneId: AlignmentChunkPreviewLaneId; matchingChunkCount: number }>;
}): StrategyAlignmentChunkPreviewStateFile {
  return {
    generatedAt: report.generatedAt,
    totalMatchingChunks: report.totalMatchingChunks,
    lanes: report.lanes.map((l) => ({
      laneId: l.laneId,
      matchingChunkCount: l.matchingChunkCount,
    })),
  };
}
