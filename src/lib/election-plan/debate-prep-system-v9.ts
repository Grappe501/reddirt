/**
 * Debate Prep System v9 — public Debate Command Course edition.
 * Layers v8 staff engine with student-facing course catalog and progress.
 */
import "server-only";

import {
  buildDebatePrepSystemV8Snapshot,
  DEBATE_PREP_SYSTEM_V8_VERSION,
  type DebatePrepSystemV8Snapshot,
} from "@/lib/election-plan/debate-prep-system-v8";
import {
  DEBATE_COMMAND_COURSE_TAGLINE,
  DEBATE_COMMAND_COURSE_TITLE,
  DEBATE_COURSE_MODULES,
  DEBATE_COURSE_TOTAL_HOURS,
} from "@/lib/election-plan/debate-prep-course-catalog-v9";

export const DEBATE_PREP_SYSTEM_V9_VERSION = "debate-prep-system-v9.0-debate-command-course-public";
export const DEBATE_PREP_PACKAGE_LABEL_V9 = "Debate Command Course v9";

export type DebatePrepSystemV9Snapshot = Omit<
  DebatePrepSystemV8Snapshot,
  "version" | "packageLabel" | "headline" | "intro"
> & {
  version: typeof DEBATE_PREP_SYSTEM_V9_VERSION;
  packageLabel: typeof DEBATE_PREP_PACKAGE_LABEL_V9;
  headline: typeof DEBATE_COMMAND_COURSE_TITLE;
  intro: string;
  courseTitle: typeof DEBATE_COMMAND_COURSE_TITLE;
  courseTagline: typeof DEBATE_COMMAND_COURSE_TAGLINE;
  moduleCount: number;
  courseHoursTarget: number;
};

export function buildDebatePrepSystemV9Snapshot(referenceDate?: string): DebatePrepSystemV9Snapshot {
  const v8 = buildDebatePrepSystemV8Snapshot(referenceDate);
  return {
    ...v8,
    version: DEBATE_PREP_SYSTEM_V9_VERSION,
    packageLabel: DEBATE_PREP_PACKAGE_LABEL_V9,
    headline: DEBATE_COMMAND_COURSE_TITLE,
    intro: `${DEBATE_COMMAND_COURSE_TAGLINE} ${DEBATE_COURSE_MODULES.length} modules · ${DEBATE_COURSE_TOTAL_HOURS} hours deep study · Module 8 compresses the full arc into three hours before every stage appearance.`,
    courseTitle: DEBATE_COMMAND_COURSE_TITLE,
    courseTagline: DEBATE_COMMAND_COURSE_TAGLINE,
    moduleCount: DEBATE_COURSE_MODULES.length,
    courseHoursTarget: DEBATE_COURSE_TOTAL_HOURS,
  };
}

export { DEBATE_PREP_SYSTEM_V8_VERSION };
