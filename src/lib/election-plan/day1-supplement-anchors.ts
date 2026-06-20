/**
 * Day 1 supplements (micro-lessons, concepts) — which pathway step they continue from.
 */
import { epDebatePrepDayBlockHref } from "@/lib/election-plan/debate-prep-links";
import { DAY1_ID } from "@/lib/election-plan/debatePrepDayDrillDown";

export type Day1SupplementAnchor = {
  continueFromStepId: string;
  returnHref: string;
  returnLabel: string;
};

export const DAY1_MICRO_LESSON_ANCHORS: Record<string, Day1SupplementAnchor> = {
  "d1-asp-protocol": {
    continueFromStepId: "b1-posture",
    returnHref: epDebatePrepDayBlockHref(DAY1_ID, "b1-posture"),
    returnLabel: "Posture & breathing block",
  },
  "d1-innocence": {
    continueFromStepId: "b1-author",
    returnHref: epDebatePrepDayBlockHref(DAY1_ID, "b1-author"),
    returnLabel: "Author vs administrator block",
  },
};

export const DAY1_CONCEPT_ANCHORS: Record<string, Day1SupplementAnchor> = {
  "command-focus": {
    continueFromStepId: "b1-posture",
    returnHref: epDebatePrepDayBlockHref(DAY1_ID, "b1-posture"),
    returnLabel: "Posture block",
  },
  "psychology-principle": {
    continueFromStepId: "b1-psych",
    returnHref: epDebatePrepDayBlockHref(DAY1_ID, "b1-psych"),
    returnLabel: "Psychology block",
  },
  "goal-for-kelly": {
    continueFromStepId: "b1-author",
    returnHref: epDebatePrepDayBlockHref(DAY1_ID, "b1-author"),
    returnLabel: "Author vs administrator block",
  },
  "success-check": {
    continueFromStepId: "b1-tutor",
    returnHref: epDebatePrepDayBlockHref(DAY1_ID, "b1-tutor"),
    returnLabel: "AI tutor block",
  },
  "newspaper-angle": {
    continueFromStepId: "b1-philosophy",
    returnHref: epDebatePrepDayBlockHref(DAY1_ID, "b1-philosophy"),
    returnLabel: "Philosophy spine block",
  },
};

export function getDay1MicroLessonAnchor(lessonId: string): Day1SupplementAnchor | undefined {
  return DAY1_MICRO_LESSON_ANCHORS[lessonId];
}

export function getDay1ConceptAnchor(conceptId: string): Day1SupplementAnchor | undefined {
  return DAY1_CONCEPT_ANCHORS[conceptId];
}
