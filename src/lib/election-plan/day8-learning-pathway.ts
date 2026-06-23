/**
 * Day 8 — single linear crash course pathway (§0–§8 + course complete).
 */
import {
  epDebatePrepDayBlockHref,
  epDebatePrepDayHref,
} from "@/lib/election-plan/debate-prep-links";
import { DAY8_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import { DAY8_CRASH_SECTION_SPECS } from "@/lib/election-plan/debatePrepDay8Registry";
import { getDebateWeekIntensiveDay } from "@/lib/intelligence/v4/debateWeekIntensive2026";

export type Day8PathwayStepKind = "section" | "close";

export type Day8PathwayStep = {
  id: string;
  kind: Day8PathwayStepKind;
  label: string;
  minutes: number;
  href: string;
  teaser: string;
  sectionLabel?: string;
};

const DAY8_PLAN = () => getDebateWeekIntensiveDay(DAY8_ID)!;

export function buildDay8PathwaySteps(): Day8PathwayStep[] {
  const sections: Day8PathwayStep[] = DAY8_CRASH_SECTION_SPECS.map((section) => ({
    id: section.id,
    kind: "section" as const,
    label: section.title,
    minutes: section.minutes,
    href: epDebatePrepDayBlockHref(DAY8_ID, section.id),
    teaser: section.activity,
    sectionLabel: section.sectionLabel,
  }));

  return [
    ...sections,
    {
      id: "course-complete",
      kind: "close",
      label: "Course complete · stage handoff",
      minutes: 5,
      href: epDebatePrepDayHref(DAY8_ID),
      teaser: DAY8_PLAN().successCheck,
    },
  ];
}

export function getDay8PathwayStep(stepId: string): Day8PathwayStep | undefined {
  return buildDay8PathwaySteps().find((s) => s.id === stepId);
}

export function getNextDay8PathwayStep(stepId: string): Day8PathwayStep | undefined {
  const steps = buildDay8PathwaySteps();
  const idx = steps.findIndex((s) => s.id === stepId);
  if (idx < 0 || idx >= steps.length - 1) return undefined;
  return steps[idx + 1];
}

export function getFirstDay8PathwayStep(): Day8PathwayStep {
  return buildDay8PathwaySteps()[0]!;
}

export function isDay8PathwayStepOptional(_stepId: string): boolean {
  return false;
}

export const DAY8_MINIMUM_SECTION_IDS = [
  "s8-orient",
  "s8-command",
  "s8-opening-workshop",
  "s8-middle-game",
  "s8-closing-workshop",
  "s8-lock-sheet",
] as const;

export const DAY8_EVENING_REVIEW = [
  "Opening 90s names elections, business services, and Capitol management?",
  "Three SOS answers — one per domain — delivered under timer?",
  "Lock sheet exported — green lines only?",
] as const;

export const DAY8_DAY7_REVIEW = {
  title: "Module 7 · Refine & steal the show",
  body: "Bookends and quotable line feed opening and closing workshops — refine, do not expand research.",
  href: epDebatePrepDayHref("day-7-refine-and-steal-show"),
} as const;

export const DAY8_PM_HANDOFF = {
  title: "Stage handoff · Travel → stage → debrief",
  body: "Course ends at lock sheet export — stage is Command Mode execution only.",
} as const;

export function totalDay8PathwayMinutes(): number {
  return buildDay8PathwaySteps().reduce((sum, step) => sum + step.minutes, 0);
}
