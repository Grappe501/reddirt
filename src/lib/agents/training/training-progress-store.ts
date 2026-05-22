import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import type { RoleCopilotId } from "@/lib/agents/role-copilots/role-copilot-types";
import type { TrainingProgressRecord } from "./training-types";

const REL = "data/campaign-events/training-progress.json";

function filePath(repoRoot?: string): string {
  return path.join(repoRoot ?? process.cwd(), REL);
}

export function loadAllTrainingProgress(repoRoot?: string): TrainingProgressRecord[] {
  const p = filePath(repoRoot);
  if (!existsSync(p)) return [];
  try {
    const raw = JSON.parse(readFileSync(p, "utf8"));
    return Array.isArray(raw) ? (raw as TrainingProgressRecord[]) : [];
  } catch {
    return [];
  }
}

export function getTrainingProgress(
  operatorId: string,
  repoRoot?: string,
): TrainingProgressRecord | undefined {
  return loadAllTrainingProgress(repoRoot).find((r) => r.operatorId === operatorId);
}

export function upsertTrainingProgress(
  patch: Partial<TrainingProgressRecord> & { operatorId: string; role: RoleCopilotId },
  repoRoot?: string,
): TrainingProgressRecord {
  const p = filePath(repoRoot);
  const dir = path.dirname(p);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const all = loadAllTrainingProgress(repoRoot);
  const idx = all.findIndex((r) => r.operatorId === patch.operatorId);
  const prev = idx >= 0 ? all[idx] : null;
  const next: TrainingProgressRecord = {
    operatorId: patch.operatorId,
    role: patch.role,
    completedModuleIds: patch.completedModuleIds ?? prev?.completedModuleIds ?? [],
    startedModuleIds: patch.startedModuleIds ?? prev?.startedModuleIds ?? [],
    currentPathId: patch.currentPathId ?? prev?.currentPathId,
    level: patch.level ?? prev?.level ?? 1,
    updatedAt: new Date().toISOString(),
  };
  if (idx >= 0) all[idx] = next;
  else all.push(next);
  writeFileSync(p, JSON.stringify(all, null, 2), "utf8");
  return next;
}

export function markModuleStarted(
  operatorId: string,
  role: RoleCopilotId,
  moduleId: string,
  repoRoot?: string,
): TrainingProgressRecord {
  const prev = getTrainingProgress(operatorId, repoRoot);
  const started = new Set(prev?.startedModuleIds ?? []);
  started.add(moduleId);
  return upsertTrainingProgress(
    {
      operatorId,
      role,
      startedModuleIds: [...started],
      completedModuleIds: prev?.completedModuleIds ?? [],
      level: prev?.level ?? 1,
    },
    repoRoot,
  );
}

export function markModuleCompleted(
  operatorId: string,
  role: RoleCopilotId,
  moduleId: string,
  repoRoot?: string,
): TrainingProgressRecord {
  const prev = getTrainingProgress(operatorId, repoRoot);
  const completed = new Set(prev?.completedModuleIds ?? []);
  completed.add(moduleId);
  const started = new Set(prev?.startedModuleIds ?? []);
  started.add(moduleId);
  return upsertTrainingProgress(
    {
      operatorId,
      role,
      completedModuleIds: [...completed],
      startedModuleIds: [...started],
      level: prev?.level ?? 1,
    },
    repoRoot,
  );
}

export type { LocalTrainingProgress } from "./training-progress-client";
