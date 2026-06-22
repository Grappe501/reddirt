/**
 * Day 6 supplements — pathway Continue anchors for concepts and micro-lessons.
 */
import {
  epDebatePrepDayBlockHref,
  epDebatePrepDayDrillHref,
  epDebatePrepDayHref,
  epDebatePrepDayMicroLessonHref,
  epDebatePrepDayRehearsalHref,
} from "@/lib/election-plan/debate-prep-links";
import { DAY6_ID } from "@/lib/election-plan/debatePrepDayDrillDown";

export type Day6SupplementAnchor = {
  continueFromStepId: string;
  returnHref: string;
  returnLabel: string;
};

export const DAY6_MICRO_LESSON_ANCHORS: Record<string, Day6SupplementAnchor> = {
  "d6-stress": {
    continueFromStepId: "d6-stress",
    returnHref: epDebatePrepDayBlockHref(DAY6_ID, "b6-sim"),
    returnLabel: "Full simulation block",
  },
};

export const DAY6_CONCEPT_ANCHORS: Record<string, Day6SupplementAnchor> = {
  "stress-inoculation-d6": {
    continueFromStepId: "d6-stress",
    returnHref: epDebatePrepDayMicroLessonHref(DAY6_ID, "d6-stress"),
    returnLabel: "Stress inoculation micro-lesson",
  },
  "integrated-rehearsal-d6": {
    continueFromStepId: "b6-sim",
    returnHref: epDebatePrepDayBlockHref(DAY6_ID, "b6-sim"),
    returnLabel: "Full simulation block",
  },
  "opening-closing-bookends-d6": {
    continueFromStepId: "rehearse-open-close-sim",
    returnHref: epDebatePrepDayRehearsalHref(DAY6_ID, "rehearse-open-close-sim"),
    returnLabel: "Open + close rehearsal",
  },
  "apa-sim-audience-d6": {
    continueFromStepId: "b6-sim",
    returnHref: epDebatePrepDayBlockHref(DAY6_ID, "b6-sim"),
    returnLabel: "Full simulation block",
  },
  "goal-for-kelly-d6": {
    continueFromStepId: "b6-opponent-bios-lock",
    returnHref: epDebatePrepDayBlockHref(DAY6_ID, "b6-opponent-bios-lock"),
    returnLabel: "Bios lock-in block",
  },
  "success-check-d6": {
    continueFromStepId: "evening-close",
    returnHref: epDebatePrepDayHref(DAY6_ID),
    returnLabel: "Day 6 evening check",
  },
};

export function getDay6MicroLessonAnchor(lessonId: string): Day6SupplementAnchor | undefined {
  return DAY6_MICRO_LESSON_ANCHORS[lessonId];
}

export function getDay6ConceptAnchor(conceptId: string): Day6SupplementAnchor | undefined {
  return DAY6_CONCEPT_ANCHORS[conceptId];
}
