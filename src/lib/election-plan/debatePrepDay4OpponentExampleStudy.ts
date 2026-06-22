/**
 * Day 4 opponent examples — deep drill-down study guides.
 */
import {
  EP_FORUM_LAB_CAPITALIZE_MOVES_HREF,
  EP_FORUM_TRANSCRIPT_LAB_HREF,
  epDebatePrepDayBlockHref,
  epDebatePrepDayExampleHref,
  epDebatePrepDayRehearsalHref,
} from "@/lib/election-plan/debate-prep-links";
import {
  DAY4_FORUM_INTERNAL_INTEL_LABEL,
  DAY4_FORUM_TRANSCRIPT_CLAIMS_GATE,
} from "@/lib/election-plan/debate-prep-day4-forum-intelligence-copy";
import { DAY4_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import type { OpponentExampleStudyDeep } from "@/lib/election-plan/debatePrepDay1OpponentExampleStudy";

const claimsGateLines = [...DAY4_FORUM_TRANSCRIPT_CLAIMS_GATE];

export const DAY4_OPPONENT_EXAMPLE_STUDY: Record<string, OpponentExampleStudyDeep> = {
  "ex4-forum": {
    exampleId: "ex4-forum",
    drillDownTitle: "Forum integrity one-liner — clerk-centered after lab ingest",
    opponent: "Moderator",
    theirMove: "Forum moderator asks all three to define 'election integrity' in one sentence.",
    kellyResponse:
      "Integrity is clerks with funded equipment, transparent processes, and a SOS office that picks up the phone.",
    whyItWorks: "Concrete, clerk-centered — contrasts abstract opponent answers without fear-mongering.",
    sourceNote: "Refine after forum transcript lab ingest — claims gate on every forum quote before stage.",
    overview:
      "Optional stretch after forum lab ingest. Kelly delivers a clerk-centered integrity one-liner — pattern language OK; verbatim forum quotes only if source, timestamp, and claims review cleared them.",
    professorLead:
      "Frank Donnelly wants integrity without fear-mongering. One sentence — clerks, equipment, phone line. Do not quote Hammer's forum answer unless claims-green.",
    phases: [
      {
        minutesLabel: "0–3 min",
        title: "Forum lab prerequisite",
        steps: [
          "Confirm forum lab ingest complete — v1 + v2 analysis run.",
          "Label notebook: internal tactical intelligence until claims-cleared.",
          "Optional example — skip if tired after b4-lab minimum.",
        ],
      },
      {
        minutesLabel: "3–8 min",
        title: "Decode moderator prompt",
        steps: [
          "Read moderator integrity prompt twice.",
          "Note: Hammer and Pakko likely gave abstract answers — Kelly gives concrete clerk image.",
          "Do not memorize opponent forum quotes for this drill — pattern contrast only.",
        ],
      },
      {
        minutesLabel: "8–15 min",
        title: "Primary one-liner reps",
        steps: [
          "Staff reads moderator prompt verbatim.",
          "Kelly delivers primary line under 30 seconds.",
          "Alternate: clerk grant question answered this week.",
          "Alternate: equipment + transparent process + SOS desk that picks up.",
          "Three clean takes — slow voice, concrete image.",
        ],
      },
      {
        minutesLabel: "15–20 min",
        title: "Refine after lab + claims gate",
        steps: [
          "If forum lab surfaced a Hammer abstract integrity line — compare pattern only unless claims-green.",
          "Update one word if capitalize moves suggest sharper clerk beat.",
          "Claims gate: no verbatim forum quote on stage without green status.",
          "Mark optional example complete.",
        ],
      },
    ],
    deepSections: [
      {
        title: "Integrity without fear-mongering",
        body:
          "Frank Donnelly profile — concrete clerk funding and service desk beats abstract 'secure elections' slogans. No opponent character attacks.",
      },
      {
        title: "Forum intel labeling",
        body: DAY4_FORUM_INTERNAL_INTEL_LABEL,
      },
      {
        title: "Refine after ingest",
        body:
          "Primary line works before forum lab; sharpen after capitalize moves if a clerk beat surfaced in analysis — still claims-gated if quoting transcript.",
      },
      {
        title: "Common mistakes",
        body:
          "Quoting Hammer forum answer without claims review. Fear-mongering instead of clerk service. Running this before forum lab completes.",
      },
    ],
    psychology: [
      {
        title: "Frank Donnelly · integrity voter",
        body:
          "Rewards specific clerk image over partisan abstract integrity talk. One sentence — equipment, process, phone line.",
      },
    ],
    opponentForecast: [
      {
        title: "Hammer forum abstract answer",
        body:
          "Likely ranking or Capitol credit frame — Kelly contrasts with county clerk execution. Pattern language until claims-verified quote.",
      },
    ],
    sampleLines: [
      {
        label: "Primary",
        text: "Integrity is clerks with funded equipment, transparent processes, and a SOS office that picks up the phone.",
      },
      {
        label: "Alternate",
        text: "Integrity is whether your clerk got her equipment question answered this week — not abstract slogans from the Capitol.",
      },
    ],
    doNotSay: [
      "Unverified verbatim Hammer forum quotes.",
      "Fear-mongering about election fraud.",
      "Character attacks based on forum snippets.",
    ],
    claimsGate: [
      ...claimsGateLines,
      "Optional example: refine lines after lab but gate every forum verbatim quote.",
    ],
    keyTakeaways: [
      "Clerk-centered integrity one-liner under 30s.",
      "Forum lab ingest complete before optional refine.",
      "Zero unverified forum quotes on stage.",
    ],
    practiceSteps: [
      "Staff reads moderator prompt.",
      "Kelly delivers primary line three times.",
      "Claims-check any forum quote before refine.",
    ],
    relatedLinks: [
      { href: EP_FORUM_TRANSCRIPT_LAB_HREF, label: "Forum transcript lab" },
      { href: EP_FORUM_LAB_CAPITALIZE_MOVES_HREF, label: "Capitalize moves" },
      { href: epDebatePrepDayBlockHref(DAY4_ID, "b4-lab"), label: "Forum lab block" },
      { href: epDebatePrepDayRehearsalHref(DAY4_ID, "rehearse-forum-counter-60s"), label: "Forum counter rehearsal" },
      { href: epDebatePrepDayExampleHref(DAY4_ID, "ex4-forum"), label: "This example" },
    ],
  },
};

export function getDay4OpponentExampleStudy(exampleId: string): OpponentExampleStudyDeep | undefined {
  return DAY4_OPPONENT_EXAMPLE_STUDY[exampleId];
}

export function listDay4OpponentExampleStudyIds(): string[] {
  return Object.keys(DAY4_OPPONENT_EXAMPLE_STUDY);
}
