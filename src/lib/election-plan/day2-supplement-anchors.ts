/**
 * Day 2 supplements (micro-lessons, concepts) — which pathway step they continue from.
 */
import { epDebatePrepDayBlockHref } from "@/lib/election-plan/debate-prep-links";
import { DAY2_ID } from "@/lib/election-plan/debatePrepDayDrillDown";

export type Day2SupplementAnchor = {
  /** Pathway step id passed to ElectionPlanDay2ContinueButton */
  continueFromStepId: string;
  returnHref: string;
  returnLabel: string;
};

export const DAY2_MICRO_LESSON_ANCHORS: Record<string, Day2SupplementAnchor> = {
  "d2-watch-hammer": {
    continueFromStepId: "b2-film",
    returnHref: epDebatePrepDayBlockHref(DAY2_ID, "b2-film"),
    returnLabel: "Film tells worksheet",
  },
  "d2-three-way": {
    continueFromStepId: "b2-coaching",
    returnHref: epDebatePrepDayBlockHref(DAY2_ID, "b2-coaching"),
    returnLabel: "Stage presence block",
  },
};

export const DAY2_CONCEPT_ANCHORS: Record<string, Day2SupplementAnchor> = {
  "scan-before-speak": {
    continueFromStepId: "b2-film",
    returnHref: epDebatePrepDayBlockHref(DAY2_ID, "b2-film"),
    returnLabel: "Film room block",
  },
  "observational-learning": {
    continueFromStepId: "b2-film",
    returnHref: epDebatePrepDayBlockHref(DAY2_ID, "b2-film"),
    returnLabel: "Film room block",
  },
  "goal-for-kelly-d2": {
    continueFromStepId: "b2-film",
    returnHref: epDebatePrepDayBlockHref(DAY2_ID, "b2-film"),
    returnLabel: "Film room block",
  },
  "success-check-d2": {
    continueFromStepId: "b2-trap1",
    returnHref: epDebatePrepDayBlockHref(DAY2_ID, "b2-trap1"),
    returnLabel: "Trap lanes block",
  },
  "three-way-geometry": {
    continueFromStepId: "b2-coaching",
    returnHref: epDebatePrepDayBlockHref(DAY2_ID, "b2-coaching"),
    returnLabel: "Stage presence block",
  },
};

export function getDay2MicroLessonAnchor(lessonId: string): Day2SupplementAnchor | undefined {
  return DAY2_MICRO_LESSON_ANCHORS[lessonId];
}

export function getDay2ConceptAnchor(conceptId: string): Day2SupplementAnchor | undefined {
  return DAY2_CONCEPT_ANCHORS[conceptId];
}
