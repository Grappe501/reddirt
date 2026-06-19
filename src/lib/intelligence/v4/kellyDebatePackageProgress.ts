/**
 * v8 — Tonight package step completion tracking.
 */
import fs from "node:fs";
import path from "node:path";

export type KellyDebatePackageProgress = {
  version: 1;
  updatedAt: string;
  completedStepIds: string[];
  lastModeUsed: string | null;
  notes: string | null;
};

const STATE_REL = path.join("data", "intelligence", "kelly-debate-package-progress.json");

const EMPTY: KellyDebatePackageProgress = {
  version: 1,
  updatedAt: new Date(0).toISOString(),
  completedStepIds: [],
  lastModeUsed: null,
  notes: null,
};

export function kellyDebatePackageProgressPath(root = process.cwd()): string {
  return path.join(root, STATE_REL);
}

export function loadKellyDebatePackageProgress(root = process.cwd()): KellyDebatePackageProgress {
  const file = kellyDebatePackageProgressPath(root);
  if (!fs.existsSync(file)) {
    return { ...EMPTY, updatedAt: new Date().toISOString() };
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as Partial<KellyDebatePackageProgress>;
    return {
      ...EMPTY,
      ...parsed,
      version: 1,
      completedStepIds: parsed.completedStepIds ?? [],
    };
  } catch {
    return { ...EMPTY, updatedAt: new Date().toISOString() };
  }
}

export function saveKellyDebatePackageProgress(state: KellyDebatePackageProgress, root = process.cwd()): void {
  const file = kellyDebatePackageProgressPath(root);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(
    file,
    `${JSON.stringify({ ...state, updatedAt: new Date().toISOString() }, null, 2)}\n`,
    "utf8",
  );
}

export function togglePackageStepProgress(
  state: KellyDebatePackageProgress,
  stepId: string,
): KellyDebatePackageProgress {
  const done = state.completedStepIds.includes(stepId);
  return {
    ...state,
    completedStepIds: done
      ? state.completedStepIds.filter((id) => id !== stepId)
      : [...state.completedStepIds, stepId],
  };
}
