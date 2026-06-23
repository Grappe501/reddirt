/**
 * Day 7 — stub block study guides (Pass 1). Full depth in Pass 2.
 */
import {
  epDebatePrepDayBlockHref,
  epDebatePrepDayConceptHref,
  epDebatePrepDayRehearsalHref,
} from "@/lib/election-plan/debate-prep-links";
import {
  DAY7_CUT_DONT_ADD,
  DAY7_PEAK_END_FRAME,
  DAY7_QUOTABLE_RULE,
} from "@/lib/election-plan/debate-prep-day7-polish-copy";
import { DAY7_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import type { Day1BlockStudyDeep } from "@/lib/election-plan/debatePrepDay1BlockStudy";

const claimsGateLines = [DAY7_CUT_DONT_ADD, DAY7_QUOTABLE_RULE];

function stubPhases(blockLabel: string) {
  return [
    {
      minutesLabel: "0–15 min",
      title: `${blockLabel} · read & orient`,
      steps: [
        "Read block activity and why-this-block sections.",
        "Confirm claims-green discipline — cut, do not add.",
        "Set timer for block minutes.",
      ],
    },
    {
      minutesLabel: "15–30 min",
      title: `${blockLabel} · speak aloud`,
      steps: [
        "Run practice steps in order.",
        "Staff notes one fix only — no new research.",
        "Log whether block felt boring (good) or rushed (repeat once).",
      ],
    },
    {
      minutesLabel: "30+ min",
      title: `${blockLabel} · gate`,
      steps: [
        "Answer success check for this block.",
        "Mark complete — Continue to next pathway step.",
        "If tired: minimum block only tonight.",
      ],
    },
  ];
}

export const DAY7_BLOCK_STUDY: Record<string, Day1BlockStudyDeep> = {
  "b7-open-close": {
    blockId: "b7-open-close",
    studyGuideTitle: "Opening + closing polish · stub study (Pass 1)",
    professorLead: DAY7_PEAK_END_FRAME,
    overview: "Polish Day 1 opening and Day 7 closing template — weave Day 6 debrief fixes into closing beat 2.",
    phases: stubPhases("Bookends"),
    deepSections: [
      { title: "Peak-end", body: "Press remembers first calm minute and last quotable minute." },
      { title: "Day 6 import", body: "Top 3 sim fixes feed closing — do not rewrite whole script." },
      { title: "Pass 2 depth", body: "Full phased study ships in Pass 2 with rep tracker UI." },
    ],
    claimsGate: claimsGateLines,
    keyTakeaways: ["Three reps each bookend", "Clerk invoke on closing", "No new stats"],
    practiceSteps: ["Polish opening 90s", "Polish closing 60s", "Log three reps"],
    relatedLinks: [
      { href: epDebatePrepDayRehearsalHref(DAY7_ID, "rehearse-bookends-three-reps"), label: "3 reps rehearsal" },
      { href: epDebatePrepDayBlockHref("day-6-full-simulation", "b6-sim"), label: "Day 6 sim debrief" },
    ],
  },
  "b7-claims-final": {
    blockId: "b7-claims-final",
    studyGuideTitle: "Final claims scan · stub study (Pass 1)",
    professorLead: DAY7_CUT_DONT_ADD,
    overview: "Red-line review — BLOCKED lines cut from stage script. Nothing new after today.",
    phases: stubPhases("Claims final"),
    deepSections: [
      { title: "Cut gate", body: "Unverified stats and opponent quotes stay off broadcast." },
      { title: "Staff sign-off", body: "Final script is claims-green end-to-end." },
    ],
    claimsGate: claimsGateLines,
    keyTakeaways: ["No new material", "BLOCKED lines cut", "Staff cleared script"],
    practiceSteps: ["Scan script", "Cut BLOCKED", "Sign off"],
    relatedLinks: [
      { href: epDebatePrepDayConceptHref(DAY7_ID, "claims-final-cut-d7"), label: "Claims final concept" },
    ],
  },
  "b7-psych-three": {
    blockId: "b7-psych-three",
    studyGuideTitle: "Three-way + ACCA psychology · stub study (Pass 1)",
    professorLead: "Eureka Springs geometry matches ACCA — pile-on survival with calm contrast.",
    overview: "Refresh three-way dynamics — Hammer performs, Kelly commands with clerk bridges.",
    phases: stubPhases("Three-way psych"),
    deepSections: [
      { title: "Geometry", body: "Kelly vs Hammer vs Pakko — not a two-way debate." },
      { title: "Calm contrast", body: "Slow down when opponents perform for crowd." },
    ],
    claimsGate: claimsGateLines,
    keyTakeaways: ["One pile-on pivot cold", "Bridge to clerks", "No new attacks"],
    practiceSteps: ["Read refresh", "One pivot cold", "Claims scan after"],
    relatedLinks: [
      { href: epDebatePrepDayConceptHref(DAY7_ID, "acca-three-way-geometry-d7"), label: "Three-way concept" },
    ],
  },
  "b7-tutor-final": {
    blockId: "b7-tutor-final",
    studyGuideTitle: "Final tutor office hours · stub study (Pass 1)",
    professorLead: "One weakness from simulation — one drill only. Optional stretch after bookends minimum.",
    overview: "Final correction while material is fresh — not new content.",
    phases: stubPhases("Final drill"),
    deepSections: [
      { title: "Optional", body: "Bookends block is minimum — tutor rolls to AM if tired." },
    ],
    claimsGate: claimsGateLines,
    keyTakeaways: ["One weakness", "One drill", "No new research"],
    practiceSteps: ["Pick weakness", "Run one drill", "Stop"],
    relatedLinks: [{ href: epDebatePrepDayBlockHref(DAY7_ID, "b7-open-close"), label: "Bookends block" }],
  },
};

export function getDay7BlockStudy(blockId: string): Day1BlockStudyDeep | undefined {
  return DAY7_BLOCK_STUDY[blockId];
}

export function listDay7BlockStudyIds(): string[] {
  return Object.keys(DAY7_BLOCK_STUDY);
}
