/**
 * Day 6 — single linear learning pathway (bios lock-in → full sim → prep review → readiness → bridges).
 */
import {
  epDebatePrepDayBlockHref,
  epDebatePrepDayDrillHref,
  epDebatePrepDayHref,
  epDebatePrepDayMicroLessonHref,
  epDebatePrepDayRehearsalHref,
} from "@/lib/election-plan/debate-prep-links";
import { DAY6_ID } from "@/lib/election-plan/debate-prep-day-ids";
import { getDebateWeekIntensiveDay } from "@/lib/intelligence/v4/debateWeekIntensive2026";

export type Day6PathwayStepKind = "block" | "rehearsal" | "micro-lesson" | "command-drill" | "close";

export type Day6PathwayStep = {
  id: string;
  kind: Day6PathwayStepKind;
  label: string;
  minutes: number;
  href: string;
  teaser: string;
};

const DAY6_PLAN = () => getDebateWeekIntensiveDay(DAY6_ID)!;

export function buildDay6PathwaySteps(): Day6PathwayStep[] {
  const plan = DAY6_PLAN();
  const blocks: Day6PathwayStep[] = plan.blocks.map((block) => ({
    id: block.id,
    kind: "block" as const,
    label: block.title,
    minutes: block.minutes,
    href: epDebatePrepDayBlockHref(DAY6_ID, block.id),
    teaser: block.activity,
  }));

  return [
    ...blocks,
    {
      id: "d6-stress",
      kind: "micro-lesson",
      label: "Micro-lesson · stress inoculation",
      minutes: 6,
      href: epDebatePrepDayMicroLessonHref(DAY6_ID, "d6-stress"),
      teaser: "Fail in the room with staff, not on the APA statewide broadcast.",
    },
    {
      id: "d6-stuck-bridge",
      kind: "command-drill",
      label: "Command drill · if stuck / pile-on bridge",
      minutes: 10,
      href: epDebatePrepDayDrillHref(DAY6_ID, "d6-stuck-bridge"),
      teaser: "Unexpected question or double-team — bridge to clerks first.",
    },
    {
      id: "rehearse-open-close-sim",
      kind: "rehearsal",
      label: "Opening 90s + closing 60s inside sim frame",
      minutes: 20,
      href: epDebatePrepDayRehearsalHref(DAY6_ID, "rehearse-open-close-sim"),
      teaser: plan.rehearsalOutLoud[0] ?? "Full simulation — staff logs weak segments.",
    },
    {
      id: "evening-close",
      kind: "close",
      label: "Evening success check",
      minutes: 5,
      href: epDebatePrepDayHref(DAY6_ID),
      teaser: "Simulation complete? Top 3 fixes logged? Readiness ≥70%?",
    },
  ];
}

export function getDay6PathwayStep(stepId: string): Day6PathwayStep | undefined {
  return buildDay6PathwaySteps().find((s) => s.id === stepId);
}

export function getNextDay6PathwayStep(stepId: string): Day6PathwayStep | undefined {
  const steps = buildDay6PathwaySteps();
  const idx = steps.findIndex((s) => s.id === stepId);
  if (idx < 0 || idx >= steps.length - 1) return undefined;
  return steps[idx + 1];
}

export function getFirstDay6PathwayStep(): Day6PathwayStep {
  return buildDay6PathwaySteps()[0]!;
}

export const DAY6_MINIMUM_BLOCK_IDS = ["b6-sim"] as const;

export const DAY6_EVENING_REVIEW = [
  "Simulation complete?",
  "Top 3 fixes logged?",
  "Readiness ≥70%?",
] as const;

export const DAY6_DAY5_REVIEW = {
  title: "Yesterday · Day 5 — Anticipate & capitalize",
  body: "When-X-say-Y sheet and trap lanes 3–6 feed today's simulation — no new research tonight.",
  href: epDebatePrepDayHref("day-5-anticipate-and-capitalize"),
} as const;

export const DAY6_DAY7_TEASER = {
  title: "Tomorrow · Day 7 — Refine & steal the show",
  body: "Cut weak material; polish opening and closing; one quotable clerk-centered line.",
  href: epDebatePrepDayHref("day-7-refine-and-steal-show"),
} as const;
