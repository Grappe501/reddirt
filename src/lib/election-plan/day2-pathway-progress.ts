/**
 * Day 2 linear pathway — client-side completion (localStorage).
 */
import { DEBATE_PREP_DAY2_PATHWAY_STORAGE_VERSION } from "@/lib/election-plan/debate-prep-day2-release";
import { notifyDebateCourseProgressChanged } from "@/lib/election-plan/debate-prep-course-progress-events";
import { buildDay2PathwaySteps, DAY2_MINIMUM_BLOCK_IDS, isDay2PathwayStepOptional } from "@/lib/election-plan/day2-learning-pathway";

const STORAGE_KEY = `kelly-day2-pathway-${DEBATE_PREP_DAY2_PATHWAY_STORAGE_VERSION}`;

export type Day2PathwayProgressSnapshot = {
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
  return buildDay2PathwaySteps()
    .filter((s) => !isDay2PathwayStepOptional(s.id))
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

export function markDay2PathwayStepComplete(stepId: string): void {
  const ids = readIds();
  if (!ids.includes(stepId)) {
    writeIds([...ids, stepId]);
    notifyDebateCourseProgressChanged();
  }
}

export function isDay2PathwayStepComplete(stepId: string): boolean {
  return readIds().includes(stepId);
}

export function getDay2PathwayProgress(): Day2PathwayProgressSnapshot {
  const completed = new Set(readIds());
  const allSteps = buildDay2PathwaySteps();
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
    isMinimumComplete: DAY2_MINIMUM_BLOCK_IDS.every((id) => completed.has(id)),
    isFullyComplete: required.every((id) => completed.has(id)),
  };
}
