/**
 * Day 2 — single linear learning pathway for Kelly (read briefs → trap lanes → bios → rehearse → close).
 */
import {
  epDebatePrepDayBlockHref,
  epDebatePrepDayDrillHref,
  epDebatePrepDayExampleHref,
  epDebatePrepDayHref,
  epDebatePrepDayRehearsalHref,
} from "@/lib/election-plan/debate-prep-links";
import { DAY2_ID } from "@/lib/election-plan/debate-prep-day-ids";
import { getDebateWeekIntensiveDay } from "@/lib/intelligence/v4/debateWeekIntensive2026";

export type Day2PathwayStepKind = "block" | "rehearsal" | "example" | "drill" | "close";

export type Day2PathwayStep = {
  id: string;
  kind: Day2PathwayStepKind;
  label: string;
  minutes: number;
  href: string;
  teaser: string;
};

const DAY2_PLAN = () => getDebateWeekIntensiveDay(DAY2_ID)!;

export function buildDay2PathwaySteps(): Day2PathwayStep[] {
  const plan = DAY2_PLAN();
  const blocks: Day2PathwayStep[] = plan.blocks.map((block) => ({
    id: block.id,
    kind: "block" as const,
    label: block.title,
    minutes: block.minutes,
    href: epDebatePrepDayBlockHref(DAY2_ID, block.id),
    teaser: block.activity,
  }));

  return [
    ...blocks,
    {
      id: "rehearse-hammer-bait-60s",
      kind: "rehearsal",
      label: "Hammer bait → 60s rebuttal",
      minutes: 10,
      href: epDebatePrepDayRehearsalHref(DAY2_ID, "rehearse-hammer-bait-60s"),
      teaser: plan.rehearsalOutLoud[0] ?? "Staff reads bait — you pivot without notes.",
    },
    {
      id: "rehearse-pakko-pivot-30s",
      kind: "rehearsal",
      label: "Pakko acknowledge + pivot",
      minutes: 5,
      href: epDebatePrepDayRehearsalHref(DAY2_ID, "rehearse-pakko-pivot-30s"),
      teaser: plan.rehearsalOutLoud[1] ?? "One respect line — no pile-on.",
    },
    {
      id: "d2-authorship-pivot",
      kind: "drill",
      label: "Quick drill · authorship pivot",
      minutes: 5,
      href: epDebatePrepDayDrillHref(DAY2_ID, "d2-authorship-pivot"),
      teaser: "I wrote the bills → administrator job frame.",
    },
    {
      id: "d2-ranking-pivot",
      kind: "drill",
      label: "Quick drill · ranking → clerk service",
      minutes: 5,
      href: epDebatePrepDayDrillHref(DAY2_ID, "d2-ranking-pivot"),
      teaser: "Abstract scorecard → county clerk answered the phone.",
    },
    {
      id: "ex2-hammer-rank",
      kind: "example",
      label: "Heritage ranking pivot (optional)",
      minutes: 15,
      href: epDebatePrepDayExampleHref(DAY2_ID, "ex2-hammer-rank"),
      teaser: "Only if forum briefs left you with energy.",
    },
    {
      id: "ex2-pakko-split",
      kind: "example",
      label: "Pakko libertarian split (optional)",
      minutes: 10,
      href: epDebatePrepDayExampleHref(DAY2_ID, "ex2-pakko-split"),
      teaser: "Steal the reform lane without becoming LP surrogate.",
    },
    {
      id: "evening-close",
      kind: "close",
      label: "Evening success check",
      minutes: 5,
      href: epDebatePrepDayHref(DAY2_ID),
      teaser: "Three Hammer tells? One Pakko pivot? Trap lane 1 under 90 seconds?",
    },
  ];
}

export function getDay2PathwayStep(stepId: string): Day2PathwayStep | undefined {
  return buildDay2PathwaySteps().find((s) => s.id === stepId);
}

export function getNextDay2PathwayStep(stepId: string): Day2PathwayStep | undefined {
  const steps = buildDay2PathwaySteps();
  const idx = steps.findIndex((s) => s.id === stepId);
  if (idx < 0 || idx >= steps.length - 1) return undefined;
  return steps[idx + 1];
}

export function getFirstDay2PathwayStep(): Day2PathwayStep {
  return buildDay2PathwaySteps()[0]!;
}

export function isDay2PathwayStepOptional(stepId: string): boolean {
  return buildDay2PathwaySteps().some((s) => s.id === stepId && s.kind === "example");
}

export const DAY2_MINIMUM_BLOCK_IDS = ["b2-film", "b2-trap1"] as const;

export const DAY2_EVENING_REVIEW = [
  "Three Hammer tells named?",
  "One Pakko pivot rehearsed aloud?",
  "Trap lane 1 under 90 seconds?",
] as const;

export const DAY2_DAY3_TEASER = {
  title: "Tomorrow · Day 3 — Superiority map",
  body: "You will stack qualifications until the list feels boring — organization history beats bill lists. Tonight you earned the eyes to read the table without panic.",
  href: epDebatePrepDayHref("day-3-superiority-map"),
} as const;
