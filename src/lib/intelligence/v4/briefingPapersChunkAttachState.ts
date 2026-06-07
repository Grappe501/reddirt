/**
 * Phase 11 P7 — persisted briefing papers chunk attach state.
 */
import fs from "node:fs";
import path from "node:path";
import type { BriefingPaperAttachLaneId } from "@/lib/intelligence/v4/phase11P7BriefingPapersChunkAttachDepth";

export type BriefingPaperAttachLaneState = {
  laneId: BriefingPaperAttachLaneId;
  attachableChunkCount: number;
};

export type BriefingPapersChunkAttachStateFile = {
  generatedAt: string;
  totalAttachableChunks: number;
  lanes: BriefingPaperAttachLaneState[];
};

const STATE_REL = path.join("data", "intelligence", "briefing-papers-chunk-attach-state.json");

export function briefingPapersChunkAttachStatePath(root = process.cwd()): string {
  return path.join(root, STATE_REL);
}

export function loadBriefingPapersChunkAttachState(
  root = process.cwd(),
): BriefingPapersChunkAttachStateFile | null {
  const file = briefingPapersChunkAttachStatePath(root);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as BriefingPapersChunkAttachStateFile;
  } catch {
    return null;
  }
}

export function saveBriefingPapersChunkAttachState(
  state: BriefingPapersChunkAttachStateFile,
  root = process.cwd(),
): void {
  const file = briefingPapersChunkAttachStatePath(root);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

export function stateFromAttachReport(report: {
  generatedAt: string;
  totalAttachableChunks: number;
  lanes: Array<{ laneId: BriefingPaperAttachLaneId; attachableChunkCount: number }>;
}): BriefingPapersChunkAttachStateFile {
  return {
    generatedAt: report.generatedAt,
    totalAttachableChunks: report.totalAttachableChunks,
    lanes: report.lanes.map((l) => ({
      laneId: l.laneId,
      attachableChunkCount: l.attachableChunkCount,
    })),
  };
}
