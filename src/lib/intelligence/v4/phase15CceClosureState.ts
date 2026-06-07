/**
 * Phase 15 P9 — CCE closure state persistence.
 */
import fs from "node:fs";
import path from "node:path";
import type { Phase15CceCheckpointId } from "@/lib/intelligence/v4/phase15P9CceClosureDepth";

export type Phase15CceCheckpointState = {
  checkpointId: Phase15CceCheckpointId;
  passLabel: string;
  completionPct: number;
  atBar: boolean;
};

export type Phase15CceClosureStateFile = {
  generatedAt: string;
  stackCompletionPct: number;
  passesAtBar: number;
  passTotal: number;
  staffBackstageEnforced: boolean;
  candidateNavLinkCount: number;
  checkpoints: Phase15CceCheckpointState[];
};

const STATE_REL = path.join("data", "intelligence", "phase-15-cce-closure-state.json");

export function phase15CceClosureStatePath(root = process.cwd()): string {
  return path.join(root, STATE_REL);
}

export function loadPhase15CceClosureState(root = process.cwd()): Phase15CceClosureStateFile | null {
  const file = phase15CceClosureStatePath(root);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as Phase15CceClosureStateFile;
  } catch {
    return null;
  }
}

export function savePhase15CceClosureState(
  state: Phase15CceClosureStateFile,
  root = process.cwd(),
): void {
  const file = phase15CceClosureStatePath(root);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}
