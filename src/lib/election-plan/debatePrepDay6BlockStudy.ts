/**
 * Day 6 — stub block study guides (Pass 1). Full phases in Pass 2.
 */
import {
  EP_DEBATE_QUESTIONS_HREF,
  EP_OPPONENT_BIOS_HREF,
  EP_TRAP_LANES_HREF,
  epDebatePrepDayBlockHref,
  epDebatePrepDayConceptHref,
  epDebatePrepDayDrillHref,
  epDebatePrepDayMicroLessonHref,
  epDebatePrepDayRehearsalHref,
} from "@/lib/election-plan/debate-prep-links";
import { epDebatePrepLaneHref } from "@/lib/election-plan/debate-prep-route-map";
import { DAY6_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import type { Day1BlockStudyDeep } from "@/lib/election-plan/debatePrepDay1BlockStudy";

const claimsGateLines = [
  "No new stats or opponent quotes during simulation — Days 1–5 claims-green only.",
  "Raw forum verbatim stays off Kelly's sim script until staff claims-clears.",
  "BLOCKED debate-command lanes are cut from sim answers — silence beats unverified lines.",
] as const;

function stubBlock(
  blockId: string,
  title: string,
  overview: string,
  phaseTitles: [string, string, string],
): Day1BlockStudyDeep {
  return {
    blockId,
    studyGuideTitle: `${title} · study guide (Pass 1 stub)`,
    overview,
    professorLead: "Day 6 integrates Days 2–5 under fatigue — simulation fixes what exists, not new research.",
    phases: phaseTitles.map((phaseTitle, i) => ({
      minutesLabel: `Phase ${i + 1}`,
      title: phaseTitle,
      steps: [
        `Open ${blockId} block page in election-plan.`,
        "Follow activity from intensive plan — speak aloud where marked.",
        "Pass 2 expands phased study — mark block in progress if tired.",
      ],
    })),
    deepSections: [{ title: "Pass 1 stub", body: "Full phased study ships in Pass 2 — pathway spine unlocks routes now." }],
    claimsGate: [...claimsGateLines],
    keyTakeaways: [`${blockId} route loads`, "Claims gate acknowledged", "Ready for Pass 2 block study"],
    practiceSteps: [`Complete ${blockId} activity per block page`, "No admin detours on minimum path"],
    relatedLinks: [
      { href: epDebatePrepDayBlockHref(DAY6_ID, blockId), label: title },
      { href: epDebatePrepDayConceptHref(DAY6_ID, "success-check-d6"), label: "Success check" },
    ],
  };
}

export const DAY6_BLOCK_STUDY: Record<string, Day1BlockStudyDeep> = {
  "b6-opponent-bios-lock": stubBlock(
    "b6-opponent-bios-lock",
    "Opponent bios lock-in",
    "Third read: memory lines and command mode sections only — speak aloud until boring, then simulation.",
    ["Memory lines per opponent", "Command mode sections", "Staff bait drill once"],
  ),
  "b6-sim": {
    ...stubBlock(
      "b6-sim",
      "Full simulation block",
      "60-minute three-way simulation + 30-minute debrief — staff plays Hammer and Pakko.",
      ["Opening 90s inside sim frame", "Trap lanes + SOS sprint", "Closing 60s + debrief"],
    ),
    relatedLinks: [
      { href: epDebatePrepLaneHref("lane-d6-full-sim"), label: "Full three-way simulation lane" },
      { href: epDebatePrepDayRehearsalHref(DAY6_ID, "rehearse-open-close-sim"), label: "Opening + closing rehearsal" },
      { href: epDebatePrepDayMicroLessonHref(DAY6_ID, "d6-stress"), label: "Stress inoculation micro-lesson" },
    ],
  },
  "b6-prep": {
    ...stubBlock(
      "b6-prep",
      "Debate prep packet review",
      "Highest trap-density review from Days 2–5 — pocket cards only, no new research.",
      ["Trap lanes 1–6 skim", "Day 5 when-X-say-Y sheet", "Five SOS questions mapped"],
    ),
    relatedLinks: [
      { href: EP_TRAP_LANES_HREF, label: "Trap lanes hub" },
      { href: EP_DEBATE_QUESTIONS_HREF, label: "SOS debate questions hub" },
      { href: epDebatePrepDayBlockHref("day-5-anticipate-and-capitalize", "b5-lab-review"), label: "Day 5 capitalize sheet" },
    ],
  },
  "b6-command": {
    ...stubBlock(
      "b6-command",
      "Debate command readiness check",
      "Review blocked lanes and philosophy feed scores — honest readiness before travel.",
      ["Open readiness audit", "Cut BLOCKED lanes from script", "Target ≥70% all dimensions"],
    ),
    relatedLinks: [
      { href: epDebatePrepLaneHref("lane-d6-readiness"), label: "Readiness audit lane" },
      { href: epDebatePrepDayConceptHref(DAY6_ID, "success-check-d6"), label: "Success check" },
    ],
  },
  "b6-depth": {
    ...stubBlock(
      "b6-depth",
      "If stuck — bridge phrases",
      "Memorize three bridges — honest pause beats fake certainty under pile-on pressure.",
      ["Read three bridge templates", "Speak each aloud twice", "Use one bridge in sim"],
    ),
    relatedLinks: [
      { href: epDebatePrepDayDrillHref(DAY6_ID, "d6-stuck-bridge"), label: "Stuck bridge command drill" },
      { href: epDebatePrepLaneHref("lane-d6-stuck-stretch"), label: "If-stuck bridge lane" },
      { href: EP_OPPONENT_BIOS_HREF, label: "Opponent bios hub" },
    ],
  },
};

export function getDay6BlockStudy(blockId: string): Day1BlockStudyDeep | undefined {
  return DAY6_BLOCK_STUDY[blockId];
}

export function listDay6BlockStudyIds(): string[] {
  return Object.keys(DAY6_BLOCK_STUDY);
}
