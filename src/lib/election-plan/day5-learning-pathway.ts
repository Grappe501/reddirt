/**
 * Day 5 — single linear learning pathway (capitalize sheet → trap lanes 3–6 → SOS sprint → moot court).
 */
import {
  epDebatePrepDayBlockHref,
  epDebatePrepDayDrillHref,
  epDebatePrepDayExampleHref,
  epDebatePrepDayHref,
  epDebatePrepDayMicroLessonHref,
  epDebatePrepDayRehearsalHref,
} from "@/lib/election-plan/debate-prep-links";
import { DAY5_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import { getDebateWeekIntensiveDay } from "@/lib/intelligence/v4/debateWeekIntensive2026";

export type Day5PathwayStepKind = "block" | "rehearsal" | "example" | "micro-lesson" | "command-drill" | "close";

export type Day5PathwayStep = {
  id: string;
  kind: Day5PathwayStepKind;
  label: string;
  minutes: number;
  href: string;
  teaser: string;
};

const DAY5_PLAN = () => getDebateWeekIntensiveDay(DAY5_ID)!;

export function buildDay5PathwaySteps(): Day5PathwayStep[] {
  const plan = DAY5_PLAN();
  const blocks: Day5PathwayStep[] = plan.blocks.map((block) => ({
    id: block.id,
    kind: "block" as const,
    label: block.title,
    minutes: block.minutes,
    href: epDebatePrepDayBlockHref(DAY5_ID, block.id),
    teaser: block.activity,
  }));

  return [
    ...blocks,
    {
      id: "d5-capitalize",
      kind: "micro-lesson",
      label: "Micro-lesson · capitalize vs counter",
      minutes: 8,
      href: epDebatePrepDayMicroLessonHref(DAY5_ID, "d5-capitalize"),
      teaser: "Countering puts you in Hammer's frame — capitalize moves to clerks in one sentence.",
    },
    {
      id: "d5-pileon-pivot",
      kind: "command-drill",
      label: "Command drill · pile-on pivot",
      minutes: 10,
      href: epDebatePrepDayDrillHref(DAY5_ID, "d5-pileon-pivot"),
      teaser: "Hammer + Pakko pile-on — rise above, pivot to clerks.",
    },
    {
      id: "rehearse-capitalize-pairs",
      kind: "rehearsal",
      label: "Five forum-derived Q&A pairs timed",
      minutes: 15,
      href: epDebatePrepDayRehearsalHref(DAY5_ID, "rehearse-capitalize-pairs"),
      teaser: plan.rehearsalOutLoud[0] ?? "Time five when-X-say-Y pairs from Day 4 notecard.",
    },
    {
      id: "ex5-pileon",
      kind: "example",
      label: "Pile-on pivot (optional)",
      minutes: 10,
      href: epDebatePrepDayExampleHref(DAY5_ID, "ex5-pileon"),
      teaser: "Hammer tries pile-on with Pakko on government trust — bridge to clerks.",
    },
    {
      id: "evening-close",
      kind: "close",
      label: "Evening success check",
      minutes: 5,
      href: epDebatePrepDayHref(DAY5_ID),
      teaser: "Eight pairs rehearsed? Forum drills timed? Pile-on pivot cold?",
    },
  ];
}

export function getDay5PathwayStep(stepId: string): Day5PathwayStep | undefined {
  return buildDay5PathwaySteps().find((s) => s.id === stepId);
}

export function getNextDay5PathwayStep(stepId: string): Day5PathwayStep | undefined {
  const steps = buildDay5PathwaySteps();
  const idx = steps.findIndex((s) => s.id === stepId);
  if (idx < 0 || idx >= steps.length - 1) return undefined;
  return steps[idx + 1];
}

export function getFirstDay5PathwayStep(): Day5PathwayStep {
  return buildDay5PathwaySteps()[0]!;
}

export function isDay5PathwayStepOptional(stepId: string): boolean {
  return buildDay5PathwaySteps().some((s) => s.id === stepId && s.kind === "example");
}

export const DAY5_MINIMUM_BLOCK_IDS = ["b5-lab-review"] as const;

export const DAY5_EVENING_REVIEW = [
  "Eight when-X-say-Y pairs rehearsed?",
  "Forum-derived drills timed?",
  "Pile-on pivot cold?",
] as const;

export const DAY5_DAY6_TEASER = {
  title: "Tomorrow · Day 6 — Full simulation",
  body: "Run the 60-minute three-way dress rehearsal — staff plays Hammer and Pakko. No new material.",
  href: epDebatePrepDayHref("day-6-full-simulation"),
} as const;

export const DAY5_DAY4_REVIEW = {
  title: "Yesterday · Day 4 — Forum intelligence",
  body: "Green notecard lines from forum lab feed today's when-X-say-Y sheet — claims-gated only.",
  href: epDebatePrepDayHref("day-4-forum-intelligence"),
} as const;
