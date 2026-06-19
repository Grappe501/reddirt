/**
 * Day 1 linear pathway — client-side completion (localStorage).
 * Kelly marks steps via Continue; progress is per-browser, no server file writes on Netlify.
 */
import { buildDay1PathwaySteps, DAY1_MINIMUM_BLOCK_IDS } from "@/lib/election-plan/day1-learning-pathway";

const STORAGE_KEY = "kelly-day1-pathway-v1";

export type Day1PathwayProgressSnapshot = {
  completedStepIds: string[];
  requiredTotal: number;
  requiredDone: number;
  requiredPct: number;
  allTotal: number;
  allDone: number;
  allPct: number;
  isMinimumComplete: boolean;
  isFullyComplete: boolean;
};

function requiredStepIds(): string[] {
  const optional = new Set(["ex1-hammer-open"]);
  return buildDay1PathwaySteps()
    .filter((s) => !optional.has(s.id))
    .map((s) => s.id);
}

function readIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { completedStepIds?: string[] };
    return Array.isArray(parsed.completedStepIds) ? parsed.completedStepIds : [];
  } catch {
    return [];
  }
}

function writeIds(ids: string[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ completedStepIds: ids, updatedAt: new Date().toISOString() }),
  );
}

export function markDay1PathwayStepComplete(stepId: string): void {
  const ids = readIds();
  if (!ids.includes(stepId)) writeIds([...ids, stepId]);
}

export function unmarkDay1PathwayStep(stepId: string): void {
  writeIds(readIds().filter((id) => id !== stepId));
}

export function isDay1PathwayStepComplete(stepId: string): boolean {
  return readIds().includes(stepId);
}

export function getDay1PathwayProgress(): Day1PathwayProgressSnapshot {
  const completed = new Set(readIds());
  const allSteps = buildDay1PathwaySteps();
  const required = requiredStepIds();
  const requiredDone = required.filter((id) => completed.has(id)).length;
  const allDone = allSteps.filter((s) => completed.has(s.id)).length;

  return {
    completedStepIds: [...completed],
    requiredTotal: required.length,
    requiredDone,
    requiredPct: required.length > 0 ? Math.round((requiredDone / required.length) * 100) : 0,
    allTotal: allSteps.length,
    allDone,
    allPct: allSteps.length > 0 ? Math.round((allDone / allSteps.length) * 100) : 0,
    isMinimumComplete: DAY1_MINIMUM_BLOCK_IDS.every((id) => completed.has(id)),
    isFullyComplete: required.every((id) => completed.has(id)),
  };
}
