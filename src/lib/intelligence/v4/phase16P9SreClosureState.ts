/**
 * Phase 16 P9 — SRE stack closure state persistence.
 */
import fs from "node:fs";
import path from "node:path";
import type { Phase16SreCheckpointId } from "@/lib/intelligence/v4/phase16P9SreClosureDepth";

export type Phase16SreCheckpointState = {
  checkpointId: Phase16SreCheckpointId;
  passLabel: string;
  completionPct: number;
  atBar: boolean;
};

export type Phase16SreClosureStateFile = {
  generatedAt: string;
  stackCompletionPct: number;
  passesAtBar: number;
  passTotal: number;
  staffCoachStaffOnly: boolean;
  ipadDrillPlayerWired: boolean;
  drillQueueStageSafe: boolean;
  candidateNavLinkCount: number;
  checkpoints: Phase16SreCheckpointState[];
};

const STATE_REL = path.join("data", "intelligence", "phase-16-sre-closure-state.json");

export function phase16SreClosureStatePath(root = process.cwd()): string {
  return path.join(root, STATE_REL);
}

export function loadPhase16SreClosureState(root = process.cwd()): Phase16SreClosureStateFile | null {
  const file = phase16SreClosureStatePath(root);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as Phase16SreClosureStateFile;
  } catch {
    return null;
  }
}

export function savePhase16SreClosureState(state: Phase16SreClosureStateFile, root = process.cwd()): void {
  const file = phase16SreClosureStatePath(root);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}
