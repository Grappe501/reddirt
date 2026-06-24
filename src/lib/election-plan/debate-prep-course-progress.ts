/**
 * Debate Command Course v9 — aggregate pathway progress across all 8 modules.
 * Client-safe: reads per-module localStorage snapshots.
 */
import { getDay1PathwayProgress } from "@/lib/election-plan/day1-pathway-progress";
import { getDay2PathwayProgress } from "@/lib/election-plan/day2-pathway-progress";
import { getDay3PathwayProgress } from "@/lib/election-plan/day3-pathway-progress";
import { getDay4PathwayProgress } from "@/lib/election-plan/day4-pathway-progress";
import { getDay5PathwayProgress } from "@/lib/election-plan/day5-pathway-progress";
import { getDay6PathwayProgress } from "@/lib/election-plan/day6-pathway-progress";
import { getDay7PathwayProgress } from "@/lib/election-plan/day7-pathway-progress";
import { getDay8PathwayProgress } from "@/lib/election-plan/day8-pathway-progress";
import {
  DEBATE_COURSE_MODULES,
  type DebateCourseModuleSpec,
} from "@/lib/election-plan/debate-prep-course-catalog-v9";

export type DebateCourseModuleProgress = {
  module: DebateCourseModuleSpec;
  requiredPct: number;
  requiredDone: number;
  requiredTotal: number;
  isMinimumComplete: boolean;
  isFullyComplete: boolean;
  status: "not_started" | "in_progress" | "complete";
};

export type DebateCourseProgressSnapshot = {
  modules: DebateCourseModuleProgress[];
  modulesComplete: number;
  modulesStarted: number;
  coursePct: number;
  recommendedModuleNumber: number;
  recommendedModule: DebateCourseModuleSpec;
  totalRequiredSteps: number;
  totalRequiredDone: number;
};

const PROGRESS_GETTERS = [
  getDay1PathwayProgress,
  getDay2PathwayProgress,
  getDay3PathwayProgress,
  getDay4PathwayProgress,
  getDay5PathwayProgress,
  getDay6PathwayProgress,
  getDay7PathwayProgress,
  getDay8PathwayProgress,
] as const;

function moduleStatus(p: {
  requiredPct: number;
  isMinimumComplete: boolean;
  isFullyComplete: boolean;
}): DebateCourseModuleProgress["status"] {
  if (p.isFullyComplete || p.isMinimumComplete) return "complete";
  if (p.requiredPct > 0) return "in_progress";
  return "not_started";
}

function buildDebateCourseProgress(): DebateCourseProgressSnapshot {
  const modules: DebateCourseModuleProgress[] = DEBATE_COURSE_MODULES.map((module, index) => {
    const snap = PROGRESS_GETTERS[index]!();
    const status = moduleStatus(snap);
    return {
      module,
      requiredPct: snap.requiredPct,
      requiredDone: snap.requiredDone,
      requiredTotal: snap.requiredTotal,
      isMinimumComplete: snap.isMinimumComplete,
      isFullyComplete: snap.isFullyComplete,
      status,
    };
  });

  const modulesComplete = modules.filter((m) => m.status === "complete").length;
  const modulesStarted = modules.filter((m) => m.status !== "not_started").length;
  const totalRequiredSteps = modules.reduce((sum, m) => sum + m.requiredTotal, 0);
  const totalRequiredDone = modules.reduce((sum, m) => sum + m.requiredDone, 0);
  const coursePct =
    totalRequiredSteps > 0 ? Math.round((totalRequiredDone / totalRequiredSteps) * 100) : 0;

  const recommended =
    modules.find((m) => m.status !== "complete") ?? modules[modules.length - 1]!;

  return {
    modules,
    modulesComplete,
    modulesStarted,
    coursePct,
    recommendedModuleNumber: recommended.module.moduleNumber,
    recommendedModule: recommended.module,
    totalRequiredSteps,
    totalRequiredDone,
  };
}

function buildEmptyDebateCourseProgress(): DebateCourseProgressSnapshot {
  const modules = DEBATE_COURSE_MODULES.map((module) => ({
    module,
    requiredPct: 0,
    requiredDone: 0,
    requiredTotal: 0,
    isMinimumComplete: false,
    isFullyComplete: false,
    status: "not_started" as const,
  }));
  const first = modules[0]!;
  return {
    modules,
    modulesComplete: 0,
    modulesStarted: 0,
    coursePct: 0,
    recommendedModuleNumber: first.module.moduleNumber,
    recommendedModule: first.module,
    totalRequiredSteps: 0,
    totalRequiredDone: 0,
  };
}

/** Stable SSR / hydration snapshot — no localStorage reads. */
export const DEBATE_COURSE_PROGRESS_SERVER_SNAPSHOT: DebateCourseProgressSnapshot =
  buildEmptyDebateCourseProgress();

export function getDebateCourseProgress(): DebateCourseProgressSnapshot {
  try {
    return buildDebateCourseProgress();
  } catch {
    return buildEmptyDebateCourseProgress();
  }
}

