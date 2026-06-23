/**
 * Day 7 — single linear learning pathway (bookends polish → claims cut → psych refresh → optional tutor).
 */
import {
  epDebatePrepDayBlockHref,
  epDebatePrepDayDrillHref,
  epDebatePrepDayExampleHref,
  epDebatePrepDayHref,
  epDebatePrepDayMicroLessonHref,
  epDebatePrepDayRehearsalHref,
} from "@/lib/election-plan/debate-prep-links";
import { DAY7_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import { getDebateWeekIntensiveDay } from "@/lib/intelligence/v4/debateWeekIntensive2026";

export type Day7PathwayStepKind = "block" | "rehearsal" | "micro-lesson" | "command-drill" | "example" | "close";

export type Day7PathwayStep = {
  id: string;
  kind: Day7PathwayStepKind;
  label: string;
  minutes: number;
  href: string;
  teaser: string;
};

const DAY7_PLAN = () => getDebateWeekIntensiveDay(DAY7_ID)!;

export function buildDay7PathwaySteps(): Day7PathwayStep[] {
  const plan = DAY7_PLAN();
  const blocks: Day7PathwayStep[] = plan.blocks.map((block) => ({
    id: block.id,
    kind: "block" as const,
    label: block.title,
    minutes: block.minutes,
    href: epDebatePrepDayBlockHref(DAY7_ID, block.id),
    teaser: block.activity,
  }));

  return [
    ...blocks,
    {
      id: "d7-steal",
      kind: "micro-lesson",
      label: "Micro-lesson · steal the show without gimmick",
      minutes: 8,
      href: epDebatePrepDayMicroLessonHref(DAY7_ID, "d7-steal"),
      teaser: "Calm competence + one quotable clerk-centered line — not volume.",
    },
    {
      id: "d7-close",
      kind: "command-drill",
      label: "Command drill · closing clerk invoke",
      minutes: 10,
      href: epDebatePrepDayDrillHref(DAY7_ID, "d7-close"),
      teaser: "Hold silence 2 seconds after the last word.",
    },
    {
      id: "ex7-show-steal",
      kind: "example",
      label: "Example · Hammer closes with ranking",
      minutes: 12,
      href: epDebatePrepDayExampleHref(DAY7_ID, "ex7-show-steal"),
      teaser: "Quotable contrast — administrator promise, no smear.",
    },
    {
      id: "rehearse-bookends-three-reps",
      kind: "rehearsal",
      label: "Opening + closing · 3 reps each",
      minutes: 25,
      href: epDebatePrepDayRehearsalHref(DAY7_ID, "rehearse-bookends-three-reps"),
      teaser: plan.rehearsalOutLoud[0] ?? "Memorize bookends — peak-end rule.",
    },
    {
      id: "rehearse-quotable-line",
      kind: "rehearsal",
      label: "Quotable line · one breath pause",
      minutes: 10,
      href: epDebatePrepDayRehearsalHref(DAY7_ID, "rehearse-quotable-line"),
      teaser: plan.rehearsalOutLoud[1] ?? "One staff-cleared line for the newspaper.",
    },
    {
      id: "evening-close",
      kind: "close",
      label: "Evening success check",
      minutes: 5,
      href: epDebatePrepDayHref(DAY7_ID),
      teaser: "Opening/closing memorized? One quotable line cleared?",
    },
  ];
}

export function getDay7PathwayStep(stepId: string): Day7PathwayStep | undefined {
  return buildDay7PathwaySteps().find((s) => s.id === stepId);
}

export function getNextDay7PathwayStep(stepId: string): Day7PathwayStep | undefined {
  const steps = buildDay7PathwaySteps();
  const idx = steps.findIndex((s) => s.id === stepId);
  if (idx < 0 || idx >= steps.length - 1) return undefined;
  return steps[idx + 1];
}

export function getFirstDay7PathwayStep(): Day7PathwayStep {
  return buildDay7PathwaySteps()[0]!;
}

export const DAY7_MINIMUM_BLOCK_IDS = ["b7-open-close"] as const;

export const DAY7_EVENING_REVIEW = [
  "Opening/closing memorized?",
  "One quotable line cleared?",
  "Claims final scan complete?",
] as const;

export const DAY7_DAY6_REVIEW = {
  title: "Yesterday · Day 6 — Full simulation",
  body: "Top 3 sim fixes feed tonight's closing polish — cut weak material, do not add new research.",
  href: epDebatePrepDayHref("day-6-full-simulation"),
} as const;

export const DAY7_DAY8_TEASER = {
  title: "Tomorrow · Debate day — Command Mode",
  body: "Execute protocol — breath, scan, respond. Trust the seven days.",
  href: epDebatePrepDayHref("day-8-command-mode-debate"),
} as const;
