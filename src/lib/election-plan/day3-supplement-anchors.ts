/**
 * Day 3 supplements (micro-lessons, concepts) — which pathway step they continue from.
 */
import { epDebatePrepDayBlockHref } from "@/lib/election-plan/debate-prep-links";
import { DAY3_ID } from "@/lib/election-plan/debatePrepDayDrillDown";

export type Day3SupplementAnchor = {
  /** Pathway step id passed to ElectionPlanDay3ContinueButton */
  continueFromStepId: string;
  returnHref: string;
  returnLabel: string;
};

export const DAY3_MICRO_LESSON_ANCHORS: Record<string, Day3SupplementAnchor> = {
  "d3-overwhelm": {
    continueFromStepId: "b3-manual",
    returnHref: epDebatePrepDayBlockHref(DAY3_ID, "b3-manual"),
    returnLabel: "Manual / framework block",
  },
};

export const DAY3_CONCEPT_ANCHORS: Record<string, Day3SupplementAnchor> = {
  "overwhelm-with-competence": {
    continueFromStepId: "b3-manual",
    returnHref: epDebatePrepDayBlockHref(DAY3_ID, "b3-manual"),
    returnLabel: "Manual block",
  },
  "three-beats-only": {
    continueFromStepId: "b3-manual",
    returnHref: epDebatePrepDayBlockHref(DAY3_ID, "b3-manual"),
    returnLabel: "Manual block",
  },
  "administrator-vs-author": {
    continueFromStepId: "b3-opposition",
    returnHref: epDebatePrepDayBlockHref(DAY3_ID, "b3-opposition"),
    returnLabel: "Opposition strategy block",
  },
  "research-question-frame": {
    continueFromStepId: "b3-funding",
    returnHref: epDebatePrepDayBlockHref(DAY3_ID, "b3-funding"),
    returnLabel: "Election funding block",
  },
  "goal-for-kelly-d3": {
    continueFromStepId: "b3-manual",
    returnHref: epDebatePrepDayBlockHref(DAY3_ID, "b3-manual"),
    returnLabel: "Manual block",
  },
  "success-check-d3": {
    continueFromStepId: "b3-claims",
    returnHref: epDebatePrepDayBlockHref(DAY3_ID, "b3-claims"),
    returnLabel: "Claims gate block",
  },
};

export function getDay3MicroLessonAnchor(lessonId: string): Day3SupplementAnchor | undefined {
  return DAY3_MICRO_LESSON_ANCHORS[lessonId];
}

export function getDay3ConceptAnchor(conceptId: string): Day3SupplementAnchor | undefined {
  return DAY3_CONCEPT_ANCHORS[conceptId];
}
