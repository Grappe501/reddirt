/**
 * Day 4 — single linear learning pathway (forum lab ingest → SOS map → recovery → bios re-read).
 */
import {
  epDebatePrepDayBlockHref,
  epDebatePrepDayExampleHref,
  epDebatePrepDayHref,
  epDebatePrepDayMicroLessonHref,
  epDebatePrepDayRehearsalHref,
} from "@/lib/election-plan/debate-prep-links";
import { DAY4_ID } from "@/lib/election-plan/debate-prep-day-ids";
import { getDebateWeekIntensiveDay } from "@/lib/intelligence/v4/debateWeekIntensive2026";

export type Day4PathwayStepKind = "block" | "rehearsal" | "example" | "micro-lesson" | "close";

export type Day4PathwayStep = {
  id: string;
  kind: Day4PathwayStepKind;
  label: string;
  minutes: number;
  href: string;
  teaser: string;
};

const DAY4_PLAN = () => getDebateWeekIntensiveDay(DAY4_ID)!;

export function buildDay4PathwaySteps(): Day4PathwayStep[] {
  const plan = DAY4_PLAN();
  const blocks: Day4PathwayStep[] = plan.blocks.map((block) => ({
    id: block.id,
    kind: "block" as const,
    label: block.title,
    minutes: block.minutes,
    href: epDebatePrepDayBlockHref(DAY4_ID, block.id),
    teaser: block.activity,
  }));

  return [
    ...blocks,
    {
      id: "d4-lab-workflow",
      kind: "micro-lesson",
      label: "Micro-lesson · forum lab workflow",
      minutes: 5,
      href: epDebatePrepDayMicroLessonHref(DAY4_ID, "d4-lab-workflow"),
      teaser: "Upload → transcript → v1 → v2 → capitalize moves for Day 5.",
    },
    {
      id: "rehearse-forum-counter-60s",
      kind: "rehearsal",
      label: "60s counter to predicted Hammer line from lab",
      minutes: 10,
      href: epDebatePrepDayRehearsalHref(DAY4_ID, "rehearse-forum-counter-60s"),
      teaser: plan.rehearsalOutLoud[0] ?? "Read AI-predicted line — clerk-centered counter only.",
    },
    {
      id: "ex4-forum",
      kind: "example",
      label: "Forum integrity one-liner (optional)",
      minutes: 10,
      href: epDebatePrepDayExampleHref(DAY4_ID, "ex4-forum"),
      teaser: "Refine after forum lab ingest — claims gate on every quote.",
    },
    {
      id: "evening-close",
      kind: "close",
      label: "Evening success check",
      minutes: 5,
      href: epDebatePrepDayHref(DAY4_ID),
      teaser: "Forum uploaded? Deep analysis run? Five capitalize moves on notecard?",
    },
  ];
}

export function getDay4PathwayStep(stepId: string): Day4PathwayStep | undefined {
  return buildDay4PathwaySteps().find((s) => s.id === stepId);
}

export function getNextDay4PathwayStep(stepId: string): Day4PathwayStep | undefined {
  const steps = buildDay4PathwaySteps();
  const idx = steps.findIndex((s) => s.id === stepId);
  if (idx < 0 || idx >= steps.length - 1) return undefined;
  return steps[idx + 1];
}

export function getFirstDay4PathwayStep(): Day4PathwayStep {
  return buildDay4PathwaySteps()[0]!;
}

export function isDay4PathwayStepOptional(stepId: string): boolean {
  return buildDay4PathwaySteps().some((s) => s.id === stepId && s.kind === "example");
}

export const DAY4_MINIMUM_BLOCK_IDS = ["b4-lab"] as const;

export const DAY4_EVENING_REVIEW = [
  "Forum uploaded or transcript pasted?",
  "Deep analysis run?",
  "Five capitalize moves copied to notecard?",
] as const;

export const DAY4_DAY5_TEASER = {
  title: "Tomorrow · Day 5 — Anticipate & capitalize",
  body: "Turn forum transcript analysis into when-X-say-Y pairs — timed drills until muscle memory.",
  href: epDebatePrepDayHref("day-5-anticipate-and-capitalize"),
} as const;
