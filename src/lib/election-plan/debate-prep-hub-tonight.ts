/**
 * Which intensive day is "tonight" on the debate-prep hub (calendar-driven).
 */
import { DAY1_ID, DAY2_ID, DAY3_ID, DAY4_ID, DAY5_ID, DAY6_ID, DAY7_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import { getFirstDay1PathwayStep } from "@/lib/election-plan/day1-learning-pathway";
import { getFirstDay2PathwayStep } from "@/lib/election-plan/day2-learning-pathway";
import { getFirstDay3PathwayStep } from "@/lib/election-plan/day3-learning-pathway";
import { getFirstDay4PathwayStep } from "@/lib/election-plan/day4-learning-pathway";
import { getFirstDay5PathwayStep } from "@/lib/election-plan/day5-learning-pathway";
import { getFirstDay6PathwayStep } from "@/lib/election-plan/day6-learning-pathway";
import { getFirstDay7PathwayStep } from "@/lib/election-plan/day7-learning-pathway";
import { DAY5_HUB_TONIGHT_SUMMARY } from "@/lib/election-plan/debate-prep-day5-anticipate-copy";
import { DAY6_HUB_TONIGHT_SUMMARY } from "@/lib/election-plan/debate-prep-day6-simulation-copy";
import { DAY7_HUB_TONIGHT_SUMMARY } from "@/lib/election-plan/debate-prep-day7-polish-copy";
import {
  DEBATE_WEEK_INTENSIVE_DAYS,
  type IntensiveDayId,
} from "@/lib/intelligence/v4/debateWeekIntensive2026";

export const DEFAULT_DEBATE_WEEK_TODAY = "2026-06-19";

export type DebatePrepHubPrimaryDayId =
  | typeof DAY1_ID
  | typeof DAY2_ID
  | typeof DAY3_ID
  | typeof DAY4_ID
  | typeof DAY5_ID
  | typeof DAY6_ID
  | typeof DAY7_ID;

export function resolveDebateWeekReferenceDate(referenceDate?: string): string {
  return referenceDate ?? process.env.DEBATE_WEEK_TODAY ?? DEFAULT_DEBATE_WEEK_TODAY;
}

export function resolveDebatePrepTonightDayId(referenceDate?: string): IntensiveDayId | null {
  const ref = resolveDebateWeekReferenceDate(referenceDate);
  const match = DEBATE_WEEK_INTENSIVE_DAYS.find((day) => day.calendarDate === ref);
  return match?.dayId ?? null;
}

export function isDebatePrepTonightDay(dayId: IntensiveDayId, referenceDate?: string): boolean {
  return resolveDebatePrepTonightDayId(referenceDate) === dayId;
}

export function debatePrepHubPrimaryDayId(referenceDate?: string): DebatePrepHubPrimaryDayId {
  const tonight = resolveDebatePrepTonightDayId(referenceDate);
  if (tonight === DAY7_ID) return DAY7_ID;
  if (tonight === DAY6_ID) return DAY6_ID;
  if (tonight === DAY5_ID) return DAY5_ID;
  if (tonight === DAY4_ID) return DAY4_ID;
  if (tonight === DAY3_ID) return DAY3_ID;
  if (tonight === DAY2_ID) return DAY2_ID;
  return DAY1_ID;
}

export function buildDebatePrepPathwayTonightFocus(referenceDate?: string): string {
  const primaryDayId = debatePrepHubPrimaryDayId(referenceDate);
  if (primaryDayId === DAY7_ID) {
    return `Day 7 pathway — start ${getFirstDay7PathwayStep().label}. ${DAY7_HUB_TONIGHT_SUMMARY}`;
  }
  if (primaryDayId === DAY6_ID) {
    return `Day 6 pathway — start ${getFirstDay6PathwayStep().label}. ${DAY6_HUB_TONIGHT_SUMMARY}`;
  }
  if (primaryDayId === DAY5_ID) {
    return `Day 5 pathway — start ${getFirstDay5PathwayStep().label}. ${DAY5_HUB_TONIGHT_SUMMARY}`;
  }
  if (primaryDayId === DAY4_ID) {
    return `Day 4 pathway — start ${getFirstDay4PathwayStep().label}. Forum lab ingest + claims-gated notecard minimum tonight.`;
  }
  if (primaryDayId === DAY3_ID) {
    return `Day 3 pathway — start ${getFirstDay3PathwayStep().label}. Manual + claims gate minimum tonight.`;
  }
  if (primaryDayId === DAY2_ID) {
    return `Day 2 pathway — start ${getFirstDay2PathwayStep().label}. Film tells + trap lane 1 minimum tonight.`;
  }
  return `Day 1 pathway — start ${getFirstDay1PathwayStep().label}. Posture + author/administrator minimum tonight.`;
}
