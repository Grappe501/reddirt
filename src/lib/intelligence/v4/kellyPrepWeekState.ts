/**
 * Phase 15 P2 — Kelly prep week progress state.
 */
import fs from "node:fs";
import path from "node:path";
import type { KellyPrepWeekDayId } from "@/lib/intelligence/v4/kellyPrepWeekPath";

export type KellyPrepWeekDayState = {
  dayId: KellyPrepWeekDayId;
  day: number;
  status: "open" | "in_progress" | "complete";
  completedAt?: string;
};

export type KellyPrepWeekStateFile = {
  generatedAt: string;
  daysComplete: number;
  dayTotal: number;
  days: KellyPrepWeekDayState[];
};

const STATE_REL = path.join("data", "intelligence", "kelly-prep-week-state.json");

export function kellyPrepWeekStatePath(root = process.cwd()): string {
  return path.join(root, STATE_REL);
}

export function loadKellyPrepWeekState(root = process.cwd()): KellyPrepWeekStateFile | null {
  const file = kellyPrepWeekStatePath(root);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as KellyPrepWeekStateFile;
  } catch {
    return null;
  }
}

export function saveKellyPrepWeekState(state: KellyPrepWeekStateFile, root = process.cwd()): void {
  const file = kellyPrepWeekStatePath(root);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

export function buildDefaultKellyPrepWeekState(dayTotal: number): KellyPrepWeekStateFile {
  return {
    generatedAt: new Date().toISOString(),
    daysComplete: 0,
    dayTotal,
    days: [],
  };
}
