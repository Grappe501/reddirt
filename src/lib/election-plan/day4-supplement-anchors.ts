/**
 * Day 4 supplements — pathway Continue anchors for concepts and micro-lessons.
 */
import {
  epDebatePrepDayBlockHref,
  epDebatePrepDayHref,
  epDebatePrepDayMicroLessonHref,
} from "@/lib/election-plan/debate-prep-links";
import { DAY4_ID } from "@/lib/election-plan/debatePrepDayDrillDown";

export type Day4SupplementAnchor = {
  continueFromStepId: string;
  returnHref: string;
  returnLabel: string;
};

export const DAY4_MICRO_LESSON_ANCHORS: Record<string, Day4SupplementAnchor> = {
  "d4-lab-workflow": {
    continueFromStepId: "d4-lab-workflow",
    returnHref: epDebatePrepDayBlockHref(DAY4_ID, "b4-lab"),
    returnLabel: "Forum lab block",
  },
};

export const DAY4_CONCEPT_ANCHORS: Record<string, Day4SupplementAnchor> = {
  "rosetta-stone-transcript": {
    continueFromStepId: "b4-lab",
    returnHref: epDebatePrepDayBlockHref(DAY4_ID, "b4-lab"),
    returnLabel: "Forum lab block",
  },
  "ingest-not-memorize": {
    continueFromStepId: "b4-lab",
    returnHref: epDebatePrepDayBlockHref(DAY4_ID, "b4-lab"),
    returnLabel: "Forum lab block",
  },
  "moderator-recycles-forum": {
    continueFromStepId: "b4-sos",
    returnHref: epDebatePrepDayBlockHref(DAY4_ID, "b4-sos"),
    returnLabel: "SOS mapping block",
  },
  "recovery-sunday": {
    continueFromStepId: "b4-rest",
    returnHref: epDebatePrepDayBlockHref(DAY4_ID, "b4-rest"),
    returnLabel: "Recovery block",
  },
  "success-check-d4": {
    continueFromStepId: "evening-close",
    returnHref: epDebatePrepDayHref(DAY4_ID),
    returnLabel: "Day 4 evening check",
  },
  "goal-for-kelly-d4": {
    continueFromStepId: "b4-lab",
    returnHref: epDebatePrepDayBlockHref(DAY4_ID, "b4-lab"),
    returnLabel: "Forum lab block",
  },
};

export function getDay4MicroLessonAnchor(lessonId: string): Day4SupplementAnchor | undefined {
  return DAY4_MICRO_LESSON_ANCHORS[lessonId];
}

export function getDay4ConceptAnchor(conceptId: string): Day4SupplementAnchor | undefined {
  return DAY4_CONCEPT_ANCHORS[conceptId];
}

export function getDay4MicroLessonHref(lessonId: string): string {
  return epDebatePrepDayMicroLessonHref(DAY4_ID, lessonId);
}
