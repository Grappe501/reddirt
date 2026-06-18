/**
 * Debate Week Intensive v2 — Kelly progress tracking (blocks, drills, day completion).
 */
import fs from "node:fs";
import path from "node:path";
import type { IntensiveDayId } from "@/lib/intelligence/v4/debateWeekIntensive2026";

export type KellyDebateIntensiveProgress = {
  version: 3;
  updatedAt: string;
  completedBlocks: Partial<Record<IntensiveDayId, string[]>>;
  completedDrills: string[];
  completedLanes: string[];
  completedDays: IntensiveDayId[];
  notes: Partial<Record<IntensiveDayId, string>>;
};

const STATE_REL = path.join("data", "intelligence", "kelly-debate-intensive-progress.json");

const EMPTY: KellyDebateIntensiveProgress = {
  version: 3,
  updatedAt: new Date(0).toISOString(),
  completedBlocks: {},
  completedDrills: [],
  completedLanes: [],
  completedDays: [],
  notes: {},
};

export function kellyDebateIntensiveProgressPath(root = process.cwd()): string {
  return path.join(root, STATE_REL);
}

export function loadKellyDebateIntensiveProgress(root = process.cwd()): KellyDebateIntensiveProgress {
  const file = kellyDebateIntensiveProgressPath(root);
  if (!fs.existsSync(file)) {
    return { ...EMPTY, updatedAt: new Date().toISOString() };
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as Partial<KellyDebateIntensiveProgress>;
    return {
      ...EMPTY,
      ...parsed,
      version: 3,
      completedBlocks: parsed.completedBlocks ?? {},
      completedDrills: parsed.completedDrills ?? [],
      completedLanes: parsed.completedLanes ?? [],
      completedDays: parsed.completedDays ?? [],
      notes: parsed.notes ?? {},
    };
  } catch {
    return { ...EMPTY, updatedAt: new Date().toISOString() };
  }
}

export function saveKellyDebateIntensiveProgress(
  state: KellyDebateIntensiveProgress,
  root = process.cwd(),
): void {
  const file = kellyDebateIntensiveProgressPath(root);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify({ ...state, updatedAt: new Date().toISOString() }, null, 2)}\n`, "utf8");
}

export function toggleBlockProgress(
  state: KellyDebateIntensiveProgress,
  dayId: IntensiveDayId,
  blockId: string,
): KellyDebateIntensiveProgress {
  const current = state.completedBlocks[dayId] ?? [];
  const next = current.includes(blockId)
    ? current.filter((id) => id !== blockId)
    : [...current, blockId];
  return {
    ...state,
    completedBlocks: { ...state.completedBlocks, [dayId]: next },
  };
}

export function toggleDrillProgress(
  state: KellyDebateIntensiveProgress,
  drillId: string,
): KellyDebateIntensiveProgress {
  const next = state.completedDrills.includes(drillId)
    ? state.completedDrills.filter((id) => id !== drillId)
    : [...state.completedDrills, drillId];
  return { ...state, completedDrills: next };
}

export function toggleLaneProgress(
  state: KellyDebateIntensiveProgress,
  laneId: string,
): KellyDebateIntensiveProgress {
  const next = state.completedLanes.includes(laneId)
    ? state.completedLanes.filter((id) => id !== laneId)
    : [...state.completedLanes, laneId];
  return { ...state, completedLanes: next };
}

export function markDayComplete(
  state: KellyDebateIntensiveProgress,
  dayId: IntensiveDayId,
): KellyDebateIntensiveProgress {
  const next = state.completedDays.includes(dayId)
    ? state.completedDays.filter((id) => id !== dayId)
    : [...state.completedDays, dayId];
  return { ...state, completedDays: next };
}
