/**
 * Day 3 — single linear learning pathway for Kelly (qualification stack → claims → rehearse → close).
 */
import {
  epDebatePrepDayBlockHref,
  epDebatePrepDayDrillHref,
  epDebatePrepDayExampleHref,
  epDebatePrepDayHref,
  epDebatePrepDayRehearsalHref,
} from "@/lib/election-plan/debate-prep-links";
import { DAY3_ID } from "@/lib/election-plan/debate-prep-day-ids";
import { getDebateWeekIntensiveDay } from "@/lib/intelligence/v4/debateWeekIntensive2026";

export type Day3PathwayStepKind = "block" | "rehearsal" | "example" | "drill" | "close";

export type Day3PathwayStep = {
  id: string;
  kind: Day3PathwayStepKind;
  label: string;
  minutes: number;
  href: string;
  teaser: string;
};

const DAY3_PLAN = () => getDebateWeekIntensiveDay(DAY3_ID)!;

export function buildDay3PathwaySteps(): Day3PathwayStep[] {
  const plan = DAY3_PLAN();
  const blocks: Day3PathwayStep[] = plan.blocks.map((block) => ({
    id: block.id,
    kind: "block" as const,
    label: block.title,
    minutes: block.minutes,
    href: epDebatePrepDayBlockHref(DAY3_ID, block.id),
    teaser: block.activity,
  }));

  return [
    ...blocks,
    {
      id: "rehearse-qualified-90s",
      kind: "rehearsal",
      label: "90s why I'm qualified — three jobs, no bill numbers",
      minutes: 10,
      href: epDebatePrepDayRehearsalHref(DAY3_ID, "rehearse-qualified-90s"),
      teaser: plan.rehearsalOutLoud[0] ?? "Stack three operational beats aloud.",
    },
    {
      id: "rehearse-clerk-funding-60s",
      kind: "rehearsal",
      label: "60s clerk funding — research frame only",
      minutes: 8,
      href: epDebatePrepDayRehearsalHref(DAY3_ID, "rehearse-clerk-funding-60s"),
      teaser: plan.rehearsalOutLoud[1] ?? "Ask for the ledger — do not invent numbers.",
    },
    {
      id: "d3-qual-stack",
      kind: "drill",
      label: "Quick drill · qualification stack (three beats)",
      minutes: 5,
      href: epDebatePrepDayDrillHref(DAY3_ID, "d3-qual-stack"),
      teaser: "Stop at three beats. Smile. Wait.",
    },
    {
      id: "ex3-hammer-admin",
      kind: "example",
      label: "Hammer bill list vs administrator (optional)",
      minutes: 12,
      href: epDebatePrepDayExampleHref(DAY3_ID, "ex3-hammer-admin"),
      teaser: "Only if claims gate is green on every line you plan to use.",
    },
    {
      id: "evening-close",
      kind: "close",
      label: "Evening success check",
      minutes: 5,
      href: epDebatePrepDayHref(DAY3_ID),
      teaser: "Three superiority points verified? Offense move natural? Any stat red-lined?",
    },
  ];
}

export function getDay3PathwayStep(stepId: string): Day3PathwayStep | undefined {
  return buildDay3PathwaySteps().find((s) => s.id === stepId);
}

export function getNextDay3PathwayStep(stepId: string): Day3PathwayStep | undefined {
  const steps = buildDay3PathwaySteps();
  const idx = steps.findIndex((s) => s.id === stepId);
  if (idx < 0 || idx >= steps.length - 1) return undefined;
  return steps[idx + 1];
}

export function getFirstDay3PathwayStep(): Day3PathwayStep {
  return buildDay3PathwaySteps()[0]!;
}

export function isDay3PathwayStepOptional(stepId: string): boolean {
  return buildDay3PathwaySteps().some((s) => s.id === stepId && s.kind === "example");
}

export const DAY3_MINIMUM_BLOCK_IDS = ["b3-manual", "b3-claims"] as const;

export const DAY3_EVENING_REVIEW = [
  "Three superiority points verified in claims?",
  "Offense move felt natural?",
  "Any stat red-lined?",
] as const;

export const DAY3_DAY4_TEASER = {
  title: "Tomorrow · Day 4 — Forum intelligence lab",
  body: "Upload the three-candidate forum recording — real words beat abstract fear. Tonight you stacked qualifications until the list felt boring.",
  href: epDebatePrepDayHref("day-4-forum-intelligence"),
} as const;
