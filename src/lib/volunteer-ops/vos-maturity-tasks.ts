import { UNIVERSAL_WEEKLY_TASKS } from "@/lib/dashboard/mock-data";
import type { Task } from "@/types/dashboard";

import type { VosMaturityLevel } from "@/lib/volunteer-ops/vos-team-maturity";

export type MaturityScoredTask = Task & { minMaturity: VosMaturityLevel };

function minMaturityForUniversalWeekly(id: string): VosMaturityLevel {
  switch (id) {
    case "u-w-1":
      return 1;
    case "u-w-2":
    case "u-w-3":
    case "u-w-4":
    case "u-w-5":
      return 2;
    default:
      return 1;
  }
}

/** Universal weekly tasks with minimum maturity — ordering preserved from mock-data. */
export const UNIVERSAL_WEEKLY_MATURITY_TASKS: MaturityScoredTask[] = UNIVERSAL_WEEKLY_TASKS.map((t) => ({
  ...t,
  minMaturity: minMaturityForUniversalWeekly(t.id),
}));

export type MaturityTaskBuckets = {
  neededNow: MaturityScoredTask[];
  comingUp: MaturityScoredTask[];
  nextAfter: MaturityScoredTask[];
};

/**
 * Surface only a few tasks: in-band work, then near-term pipeline, then next unlocks.
 */
export function selectMaturityTaskBuckets(
  tasks: readonly MaturityScoredTask[],
  level: VosMaturityLevel,
): MaturityTaskBuckets {
  const eligible = tasks.filter((t) => t.minMaturity <= level);
  const neededNow = eligible.slice(0, 2);
  const comingUp = eligible.slice(2, 4);
  const nextAfter = tasks.filter((t) => t.minMaturity > level).slice(0, 3);
  return { neededNow, comingUp, nextAfter };
}
