/**
 * Phase 11 P9 — Stack closure state persistence.
 */
import fs from "node:fs";
import path from "node:path";
import type { Phase11StackCheckpointId } from "@/lib/intelligence/v4/phase11P9StackClosureDepth";

export type Phase11StackCheckpointState = {
  checkpointId: Phase11StackCheckpointId;
  passLabel: string;
  completionPct: number;
  atBar: boolean;
};

export type Phase11StackClosureStateFile = {
  generatedAt: string;
  stackCompletionPct: number;
  passesAtBar: number;
  passTotal: number;
  promotionPipelineReady: boolean;
  checkpoints: Phase11StackCheckpointState[];
};

const STATE_REL = path.join("data", "intelligence", "phase-11-stack-closure-state.json");

export function phase11StackClosureStatePath(root = process.cwd()): string {
  return path.join(root, STATE_REL);
}

export function loadPhase11StackClosureState(root = process.cwd()): Phase11StackClosureStateFile | null {
  const file = phase11StackClosureStatePath(root);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as Phase11StackClosureStateFile;
  } catch {
    return null;
  }
}

export function savePhase11StackClosureState(
  state: Phase11StackClosureStateFile,
  root = process.cwd(),
): void {
  const file = phase11StackClosureStatePath(root);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}
