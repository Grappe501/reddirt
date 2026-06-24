/**
 * Debate Command Course v9 — public-facing 8-module catalog.
 */
import { epDebatePrepDayHref } from "@/lib/election-plan/debate-prep-links";
import {
  DAY1_ID,
  DAY2_ID,
  DAY3_ID,
  DAY4_ID,
  DAY5_ID,
  DAY6_ID,
  DAY7_ID,
  DAY8_ID,
} from "@/lib/election-plan/debate-prep-day-ids";

export const DEBATE_COMMAND_COURSE_TITLE = "Arkansas Secretary of State Debate Command Course";
export const DEBATE_COMMAND_COURSE_TAGLINE =
  "Eight modules · one stage-ready system · reusable before every debate through November.";

export type DebateCourseModuleSpec = {
  moduleNumber: number;
  dayId: string;
  label: string;
  title: string;
  subtitle: string;
  hoursTarget: number;
  outcomes: readonly string[];
  href: string;
  /** Module 8 is the compressed 3-hour command replay */
  isCommandReplay?: boolean;
};

export const DEBATE_COURSE_MODULES: readonly DebateCourseModuleSpec[] = [
  {
    moduleNumber: 1,
    dayId: DAY1_ID,
    label: "Module 1",
    title: "Command foundation",
    subtitle: "Body, breath, administrator frame, 90-second opening",
    hoursTarget: 5,
    outcomes: [
      "Command Mode posture and listen-face under bait",
      "Author vs administrator distinction",
      "Claims-green 90s opening skeleton",
    ],
    href: epDebatePrepDayHref(DAY1_ID),
  },
  {
    moduleNumber: 2,
    dayId: DAY2_ID,
    label: "Module 2",
    title: "Read the table",
    subtitle: "Opponent tells, trap lanes 1–2, stage presence",
    hoursTarget: 6,
    outcomes: [
      "Hammer and Pakko pattern recognition on film",
      "When-X-say-Y for ranking and clerk frames",
      "Scan protocol under pressure",
    ],
    href: epDebatePrepDayHref(DAY2_ID),
  },
  {
    moduleNumber: 3,
    dayId: DAY3_ID,
    label: "Module 3",
    title: "Superiority map",
    subtitle: "SOS manual, platform proof, claims gate",
    hoursTarget: 5,
    outcomes: [
      "Three SOS domains — elections, business, Capitol",
      "Qualification stack without invented stats",
      "Superiority without smear",
    ],
    href: epDebatePrepDayHref(DAY3_ID),
  },
  {
    moduleNumber: 4,
    dayId: DAY4_ID,
    label: "Module 4",
    title: "Forum intelligence",
    subtitle: "Transcript intel, SOS bank, capitalize notecard",
    hoursTarget: 5,
    outcomes: [
      "Forum lines distilled to claims-green pairs",
      "Moderator SOS answer templates",
      "Opponent bio refresh",
    ],
    href: epDebatePrepDayHref(DAY4_ID),
  },
  {
    moduleNumber: 5,
    dayId: DAY5_ID,
    label: "Module 5",
    title: "Anticipate & capitalize",
    subtitle: "Timed trap pairs, SOS sprint, pile-on pivots",
    hoursTarget: 5,
    outcomes: [
      "Eight when-X-say-Y pairs under 60s",
      "Capitalize vs counter framing",
      "Trap lanes 3–6 integration",
    ],
    href: epDebatePrepDayHref(DAY5_ID),
  },
  {
    moduleNumber: 6,
    dayId: DAY6_ID,
    label: "Module 6",
    title: "Full simulation",
    subtitle: "End-to-end debate arc with staff opposition",
    hoursTarget: 5,
    outcomes: [
      "Opening → traps → SOS → closing without stopping",
      "Top three debrief fixes logged",
      "Readiness audit ≥70%",
    ],
    href: epDebatePrepDayHref(DAY6_ID),
  },
  {
    moduleNumber: 7,
    dayId: DAY7_ID,
    label: "Module 7",
    title: "Refine & steal the show",
    subtitle: "Bookends polish, quotable lock, claims final cut",
    hoursTarget: 4,
    outcomes: [
      "Opening and closing at broadcast pace",
      "One quotable line with peak-end pause",
      "BLOCKED lines removed from stage script",
    ],
    href: epDebatePrepDayHref(DAY7_ID),
  },
  {
    moduleNumber: 8,
    dayId: DAY8_ID,
    label: "Module 8",
    title: "Debate command course",
    subtitle: "Compressed 3-hour replay · nine sections · lock sheet export",
    hoursTarget: 3,
    isCommandReplay: true,
    outcomes: [
      "Modules 1–7 in stage order — orient through lock sheet",
      "Three SOS domains in opening and moderator answers",
      "Export lock sheet before every stage appearance",
    ],
    href: epDebatePrepDayHref(DAY8_ID),
  },
] as const;

export function getDebateCourseModule(dayId: string): DebateCourseModuleSpec | undefined {
  return DEBATE_COURSE_MODULES.find((m) => m.dayId === dayId);
}

export function getDebateCourseModuleByNumber(n: number): DebateCourseModuleSpec | undefined {
  return DEBATE_COURSE_MODULES.find((m) => m.moduleNumber === n);
}

export const DEBATE_COURSE_TOTAL_HOURS = DEBATE_COURSE_MODULES.reduce((sum, m) => sum + m.hoursTarget, 0);
