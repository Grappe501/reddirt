/**
 * Client-safe day id constants for Debate Command Course pathways.
 * Keep free of debatePrepDayDrillDown (server/heavy import graph with node:fs).
 */
import type { IntensiveDayId } from "@/lib/intelligence/v4/debateWeekIntensive2026";

export const DAY1_ID = "day-1-command-foundation" as const satisfies IntensiveDayId;
export const DAY2_ID = "day-2-read-the-table" as const satisfies IntensiveDayId;
export const DAY3_ID = "day-3-superiority-map" as const satisfies IntensiveDayId;
export const DAY4_ID = "day-4-forum-intelligence" as const satisfies IntensiveDayId;
export const DAY5_ID = "day-5-anticipate-and-capitalize" as const satisfies IntensiveDayId;
export const DAY6_ID = "day-6-full-simulation" as const satisfies IntensiveDayId;
export const DAY7_ID = "day-7-refine-and-steal-show" as const satisfies IntensiveDayId;
export const DAY8_ID = "day-8-command-mode-debate" as const satisfies IntensiveDayId;

export type DebatePrepDayId =
  | typeof DAY1_ID
  | typeof DAY2_ID
  | typeof DAY3_ID
  | typeof DAY4_ID
  | typeof DAY5_ID
  | typeof DAY6_ID
  | typeof DAY7_ID
  | typeof DAY8_ID;

export const DEBATE_PREP_DAY_IDS = [
  DAY1_ID,
  DAY2_ID,
  DAY3_ID,
  DAY4_ID,
  DAY5_ID,
  DAY6_ID,
  DAY7_ID,
  DAY8_ID,
] as const satisfies readonly IntensiveDayId[];
