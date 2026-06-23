/**
 * Day 7 supplements — pathway Continue anchors for concepts and micro-lessons.
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

export type Day7SupplementAnchor = {
  continueFromStepId: string;
  returnHref: string;
  returnLabel: string;
};

export const DAY7_MICRO_LESSON_ANCHORS: Record<string, Day7SupplementAnchor> = {
  "d7-steal": {
    continueFromStepId: "d7-steal",
    returnHref: epDebatePrepDayBlockHref(DAY7_ID, "b7-open-close"),
    returnLabel: "Bookends polish block",
  },
};

export const DAY7_CONCEPT_ANCHORS: Record<string, Day7SupplementAnchor> = {
  "peak-end-rule-d7": {
    continueFromStepId: "b7-open-close",
    returnHref: epDebatePrepDayBlockHref(DAY7_ID, "b7-open-close"),
    returnLabel: "Opening + closing polish block",
  },
  "quotable-without-gimmick-d7": {
    continueFromStepId: "rehearse-quotable-line",
    returnHref: epDebatePrepDayRehearsalHref(DAY7_ID, "rehearse-quotable-line"),
    returnLabel: "Quotable line rehearsal",
  },
  "claims-final-cut-d7": {
    continueFromStepId: "b7-claims-final",
    returnHref: epDebatePrepDayBlockHref(DAY7_ID, "b7-claims-final"),
    returnLabel: "Final claims scan block",
  },
  "acca-three-way-geometry-d7": {
    continueFromStepId: "b7-psych-three",
    returnHref: epDebatePrepDayBlockHref(DAY7_ID, "b7-psych-three"),
    returnLabel: "Three-way psychology block",
  },
  "steal-the-show-d7": {
    continueFromStepId: "d7-steal",
    returnHref: epDebatePrepDayMicroLessonHref(DAY7_ID, "d7-steal"),
    returnLabel: "Steal the show micro-lesson",
  },
  "success-check-d7": {
    continueFromStepId: "evening-close",
    returnHref: epDebatePrepDayHref(DAY7_ID),
    returnLabel: "Day 7 evening check",
  },
};

export function getDay7MicroLessonAnchor(lessonId: string): Day7SupplementAnchor | undefined {
  return DAY7_MICRO_LESSON_ANCHORS[lessonId];
}

export function getDay7ConceptAnchor(conceptId: string): Day7SupplementAnchor | undefined {
  return DAY7_CONCEPT_ANCHORS[conceptId];
}
