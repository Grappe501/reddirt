/**
 * Day 5 supplements — pathway Continue anchors for concepts and micro-lessons.
 */
import {
  epDebatePrepDayBlockHref,
  epDebatePrepDayDrillHref,
  epDebatePrepDayHref,
  epDebatePrepDayMicroLessonHref,
} from "@/lib/election-plan/debate-prep-links";
import { DAY5_ID } from "@/lib/election-plan/debatePrepDayDrillDown";

export type Day5SupplementAnchor = {
  continueFromStepId: string;
  returnHref: string;
  returnLabel: string;
};

export const DAY5_MICRO_LESSON_ANCHORS: Record<string, Day5SupplementAnchor> = {
  "d5-capitalize": {
    continueFromStepId: "d5-capitalize",
    returnHref: epDebatePrepDayBlockHref(DAY5_ID, "b5-lab-review"),
    returnLabel: "Capitalize sheet block",
  },
};

export const DAY5_CONCEPT_ANCHORS: Record<string, Day5SupplementAnchor> = {
  "spaced-retrieval-d5": {
    continueFromStepId: "b5-lab-review",
    returnHref: epDebatePrepDayBlockHref(DAY5_ID, "b5-lab-review"),
    returnLabel: "Capitalize sheet block",
  },
  "when-x-say-y-d5": {
    continueFromStepId: "b5-lab-review",
    returnHref: epDebatePrepDayBlockHref(DAY5_ID, "b5-lab-review"),
    returnLabel: "Capitalize sheet block",
  },
  "trap-lanes-three-six": {
    continueFromStepId: "b5-trap-all",
    returnHref: epDebatePrepDayBlockHref(DAY5_ID, "b5-trap-all"),
    returnLabel: "Trap sprint block",
  },
  "pile-on-bridge": {
    continueFromStepId: "d5-pileon-pivot",
    returnHref: epDebatePrepDayDrillHref(DAY5_ID, "d5-pileon-pivot"),
    returnLabel: "Pile-on command drill",
  },
  "goal-for-kelly-d5": {
    continueFromStepId: "b5-lab-review",
    returnHref: epDebatePrepDayBlockHref(DAY5_ID, "b5-lab-review"),
    returnLabel: "Capitalize sheet block",
  },
  "retrieval-under-pressure": {
    continueFromStepId: "b5-trap-all",
    returnHref: epDebatePrepDayBlockHref(DAY5_ID, "b5-trap-all"),
    returnLabel: "Trap sprint block",
  },
  "success-check-d5": {
    continueFromStepId: "evening-close",
    returnHref: epDebatePrepDayHref(DAY5_ID),
    returnLabel: "Day 5 evening check",
  },
};

export function getDay5MicroLessonAnchor(lessonId: string): Day5SupplementAnchor | undefined {
  return DAY5_MICRO_LESSON_ANCHORS[lessonId];
}

export function getDay5ConceptAnchor(conceptId: string): Day5SupplementAnchor | undefined {
  return DAY5_CONCEPT_ANCHORS[conceptId];
}

export function getDay5MicroLessonHref(lessonId: string): string {
  return epDebatePrepDayMicroLessonHref(DAY5_ID, lessonId);
}
