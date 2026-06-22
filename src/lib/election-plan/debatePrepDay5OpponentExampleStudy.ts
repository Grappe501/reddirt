/**
 * Day 5 opponent examples — deep drill-down study guides.
 */
import {
  EP_FORUM_LAB_CAPITALIZE_MOVES_HREF,
  EP_TRAP_LANES_HREF,
  epDebatePrepDayBlockHref,
  epDebatePrepDayDrillHref,
  epDebatePrepDayExampleHref,
  epDebatePrepDayRehearsalHref,
} from "@/lib/election-plan/debate-prep-links";
import { DAY5_WHEN_X_SAY_Y_CLAIMS_GATE } from "@/lib/election-plan/debate-prep-day5-anticipate-copy";
import { DAY5_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import type { OpponentExampleStudyDeep } from "@/lib/election-plan/debatePrepDay1OpponentExampleStudy";

const claimsGateLines = [...DAY5_WHEN_X_SAY_Y_CLAIMS_GATE];

export const DAY5_OPPONENT_EXAMPLE_STUDY: Record<string, OpponentExampleStudyDeep> = {
  "ex5-pileon": {
    exampleId: "ex5-pileon",
    drillDownTitle: "Pile-on pivot — Hammer + Pakko on government trust",
    opponent: "Hammer",
    theirMove: "Tries pile-on with Pakko on 'government trust'.",
    kellyResponse:
      "I'll let the Capitol debate trust — I'm asking clerks what they need before November.",
    whyItWorks: "Pile-on survival — rise above, pivot to clerks. Do not fight two fronts.",
    sourceNote: "Philosophy briefing pile-on survival — bridge line claims-green.",
    overview:
      "Optional stretch after trap lanes block. Kelly bridges to clerks in 30s — no counter-punching Pakko.",
    professorLead:
      "Pile-on survival means rising above, not winning a two-front fight. Bridge to clerks — honest pause beats fake certainty.",
    phases: [
      {
        minutesLabel: "0–3 min",
        title: "Pile-on setup — two-front trap",
        steps: [
          "Read Hammer + Pakko pile-on scenario once.",
          "Label notebook: bridge first — do not counter-punch Pakko.",
          "Optional example — skip if tired after capitalize minimum.",
          "Open command drill d5-pileon-pivot if helpful.",
        ],
      },
      {
        minutesLabel: "3–8 min",
        title: "Primary bridge line reps",
        steps: [
          "Staff reads pile-on setup.",
          "Kelly delivers primary bridge line in 30s.",
          "Hold composure 2 seconds after pivot.",
          "Alternate: clerks in your county need answers this week.",
        ],
      },
      {
        minutesLabel: "8–12 min",
        title: "Cold rep × three",
        steps: [
          "Three cold reps — staff varies pile-on wording slightly.",
          "Each rep under 30s — bridge to clerks.",
          "If drift to counter-punching: stop and reset.",
          "Log whether paraphrase feels natural.",
        ],
      },
      {
        minutesLabel: "12–15 min",
        title: "Claims gate + Day 6 handoff",
        steps: [
          "Claims-check: no new Hammer or Pakko quotes invented.",
          "Connect to weakest trap lane logged tonight.",
          "Mark optional example complete.",
          "Evening close: pile-on pivot cold?",
        ],
      },
    ],
    deepSections: [
      {
        title: "Do not fight two fronts",
        body: "Bridge to clerks — let Capitol debate abstract trust.",
      },
      {
        title: "Relation to trap lane 6",
        body: "Culture-war escalation often precedes pile-on.",
      },
      {
        title: "Common mistakes",
        body: "Counter-punching Pakko. Abstract trust debate instead of clerk ask.",
      },
    ],
    psychology: [
      {
        title: "Three-way geometry",
        body: "Kelly engages Hammer on job fit, acknowledges Pakko briefly, never wins a philosophy seminar on stage.",
      },
    ],
    opponentForecast: [
      {
        title: "Hammer + Pakko double-team",
        body: "Trust frames invite pile-on — bridge line should be pre-loaded before sim day.",
      },
    ],
    sampleLines: [
      {
        label: "Primary bridge",
        text: "I'll let the Capitol debate trust — I'm asking clerks what they need before November.",
      },
      {
        label: "Alternate",
        text: "Clerks in your county need answers this week — not a double-team on abstract trust.",
      },
    ],
    doNotSay: [
      "Counter-punch at Pakko instead of bridging to clerks.",
      "Unverified opponent quotes in pile-on setup.",
    ],
    claimsGate: [
      ...claimsGateLines,
      "Pile-on example uses philosophy briefing bridge — no new opponent character claims.",
    ],
    keyTakeaways: [
      "Bridge to clerks in 30s — no two-front fight.",
      "Three cold reps — paraphrase feels natural.",
      "Optional — skip if capitalize minimum complete and tired.",
    ],
    practiceSteps: [
      "Staff simulates Hammer + Pakko pile-on.",
      "Kelly delivers bridge line three times.",
      "Claims-check setup — no invented quotes.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayDrillHref(DAY5_ID, "d5-pileon-pivot"), label: "Pile-on command drill" },
      { href: epDebatePrepDayBlockHref(DAY5_ID, "b5-trap-all"), label: "Trap lanes block" },
      { href: EP_TRAP_LANES_HREF, label: "Trap lanes hub" },
      { href: epDebatePrepDayRehearsalHref(DAY5_ID, "rehearse-capitalize-pairs"), label: "Capitalize pairs rehearsal" },
      { href: epDebatePrepDayExampleHref(DAY5_ID, "ex5-pileon"), label: "This example" },
      { href: EP_FORUM_LAB_CAPITALIZE_MOVES_HREF, label: "Capitalize moves hub" },
    ],
  },
};

export function getDay5OpponentExampleStudy(exampleId: string): OpponentExampleStudyDeep | undefined {
  return DAY5_OPPONENT_EXAMPLE_STUDY[exampleId];
}

export function listDay5OpponentExampleStudyIds(): string[] {
  return Object.keys(DAY5_OPPONENT_EXAMPLE_STUDY);
}
