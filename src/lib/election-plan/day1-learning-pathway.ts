/**
 * Day 1 — single linear learning pathway for Kelly (blocks → rehearse → close → Day 2).
 */
import {
  epDebatePrepDayBlockHref,
  epDebatePrepDayDrillHref,
  epDebatePrepDayExampleHref,
  epDebatePrepDayHref,
  epDebatePrepDayRehearsalHref,
} from "@/lib/election-plan/debate-prep-links";
import { getDay1BlockStudy } from "@/lib/election-plan/debatePrepDay1BlockStudy";
import { DAY1_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import { getDebateWeekIntensiveDay } from "@/lib/intelligence/v4/debateWeekIntensive2026";

export type Day1PathwayStepKind = "block" | "rehearsal" | "example" | "drill" | "close";

export type Day1PathwayStep = {
  id: string;
  kind: Day1PathwayStepKind;
  label: string;
  minutes: number;
  href: string;
  teaser: string;
};

const DAY1_PLAN = () => getDebateWeekIntensiveDay(DAY1_ID)!;

export function buildDay1PathwaySteps(): Day1PathwayStep[] {
  const plan = DAY1_PLAN();
  const blocks: Day1PathwayStep[] = plan.blocks.map((block) => {
    const study = getDay1BlockStudy(block.id);
    return {
      id: block.id,
      kind: "block" as const,
      label: study?.studyGuideTitle ?? block.title,
      minutes: block.minutes,
      href: epDebatePrepDayBlockHref(DAY1_ID, block.id),
      teaser: block.activity,
    };
  });

  return [
    ...blocks,
    {
      id: "rehearse-opening-90s",
      kind: "rehearsal",
      label: "90s opening — say it aloud",
      minutes: 10,
      href: epDebatePrepDayRehearsalHref(DAY1_ID, "rehearse-opening-90s"),
      teaser: plan.rehearsalOutLoud[0] ?? "Opening with no opponent names.",
    },
    {
      id: "rehearse-agree-contrast-30s",
      kind: "rehearsal",
      label: "30s agree-and-add on secure elections",
      minutes: 5,
      href: epDebatePrepDayRehearsalHref(DAY1_ID, "rehearse-agree-contrast-30s"),
      teaser: plan.rehearsalOutLoud[1] ?? "Agree, then add the clerk layer.",
    },
    {
      id: "d1-agree-add",
      kind: "drill",
      label: "Quick drill · agree-add muscle memory",
      minutes: 5,
      href: epDebatePrepDayDrillHref(DAY1_ID, "d1-agree-add"),
      teaser: "Staff reads bait — you pivot in one breath.",
    },
    {
      id: "ex1-hammer-open",
      kind: "example",
      label: "One Hammer pivot (optional tonight)",
      minutes: 15,
      href: epDebatePrepDayExampleHref(DAY1_ID, "ex1-hammer-open"),
      teaser: "Only if you have energy after opening rehearsal.",
    },
    {
      id: "evening-close",
      kind: "close",
      label: "Evening success check",
      minutes: 5,
      href: epDebatePrepDayHref(DAY1_ID),
      teaser: "Breathing twice? Author vs administrator line? One fear named?",
    },
  ];
}

export function getDay1PathwayStep(stepId: string): Day1PathwayStep | undefined {
  return buildDay1PathwaySteps().find((s) => s.id === stepId);
}

export function getNextDay1PathwayStep(stepId: string): Day1PathwayStep | undefined {
  const steps = buildDay1PathwaySteps();
  const idx = steps.findIndex((s) => s.id === stepId);
  if (idx < 0 || idx >= steps.length - 1) return undefined;
  return steps[idx + 1];
}

export function getFirstDay1PathwayStep(): Day1PathwayStep {
  return buildDay1PathwaySteps()[0]!;
}

export const DAY1_MINIMUM_BLOCK_IDS = ["b1-posture", "b1-author"] as const;

export const DAY1_EVENING_REVIEW = [
  "Did I finish breathing protocol twice without rushing?",
  "Can I say author vs administrator in one breath?",
  "What one fear did I name honestly?",
] as const;

export const DAY1_DAY2_TEASER = {
  title: "Tomorrow · Day 2 — Read the table",
  body: "You will watch Hammer and Pakko on film, learn their three tells each, and drill trap lanes 1–2. Tonight you earned the body to absorb that without panic.",
  href: epDebatePrepDayHref("day-2-read-the-table"),
} as const;
