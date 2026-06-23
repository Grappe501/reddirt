/**
 * Day 7 opponent examples — deep drill-down study guides (Pass 2).
 */
import {
  EP_DEBATE_PREP_REHEARSAL_HREF,
  EP_OPPONENT_BIOS_HREF,
  epDebatePrepDayBlockHref,
  epDebatePrepDayConceptHref,
  epDebatePrepDayDrillHref,
  epDebatePrepDayExampleHref,
  epDebatePrepDayRehearsalHref,
  epOpponentBioHref,
} from "@/lib/election-plan/debate-prep-links";
import {
  DAY7_CUT_DONT_ADD,
  DAY7_QUOTABLE_RULE,
} from "@/lib/election-plan/debate-prep-day7-polish-copy";
import { DAY7_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import type { OpponentExampleStudyDeep } from "@/lib/election-plan/debatePrepDay1OpponentExampleStudy";
import { buildDay7PolishSurface } from "@/lib/election-plan/load-day7-polish-surface";

const claimsGateLines = [DAY7_CUT_DONT_ADD, DAY7_QUOTABLE_RULE];

const polishSurface = () => buildDay7PolishSurface();

export const DAY7_OPPONENT_EXAMPLE_STUDY: Record<string, OpponentExampleStudyDeep> = {
  "ex7-show-steal": {
    exampleId: "ex7-show-steal",
    drillDownTitle: "Show-steal pivot — Hammer closes with ranking and authorship",
    opponent: "Hammer",
    theirMove: "Closes with ranking and 'I wrote the law.'",
    kellyResponse:
      "Clerks don't need another author in the Capitol — they need a Secretary of State who shows up. I'll be that administrator.",
    whyItWorks: "Quotable, contrast, no smear — newspaper-friendly clerk invoke beats authorship credit.",
    sourceNote: "Claims verify before stage — pattern from Hammer campaign messaging, not live quote invention.",
    overview:
      "Hammer's closing move bundles integrity ranking with legislative authorship — same trap as opening, but under peak-end pressure. Your job is one calm quotable line that credits clerks and names the administrator job without smear.",
    professorLead:
      "Steal the show with contrast, not volume. Hammer may perform for crowd energy — slow down, one breath pause, deliver the clerk-centered line the paper can print tomorrow.",
    phases: [
      {
        minutesLabel: "0–3 min",
        title: "Decode the closing move",
        steps: [
          "Read Hammer's closing line twice — hear ranking + authorship bundled.",
          "Label notebook: authorship trap at peak-end — not a new attack type.",
          "Open Kim Hammer bio memory lines — no full dossier tonight.",
          "Confirm claims-green before rehearsing Kelly response.",
        ],
      },
      {
        minutesLabel: "3–8 min",
        title: "Primary quotable line reps",
        steps: [
          "Staff reads Hammer closing setup — paraphrase OK.",
          "Kelly delivers primary show-steal line in 30s.",
          "Hold silence 2 seconds after pivot — peak-end discipline.",
          "Alternate: use d7-close template if primary feels hot.",
        ],
      },
      {
        minutesLabel: "8–12 min",
        title: "Newspaper test × three",
        steps: [
          "Three cold reps — staff varies Hammer wording slightly.",
          "Each rep: one breath pause before quotable line.",
          "Ask: would Carroll County editor print this without fact-check panic?",
          "Staff picks one line for stage — log in bookends block.",
        ],
      },
      {
        minutesLabel: "12–15 min",
        title: "Claims gate + bookends handoff",
        steps: [
          "Claims-check: no new Hammer quotes invented in setup.",
          "Weave staff pick into closing beat 3 if cleared.",
          "Connect to b7-open-close three-rep rehearsal.",
          "Evening close: one quotable line staff cleared?",
        ],
      },
    ],
    deepSections: [
      {
        title: "Peak-end geometry",
        body: "Closing is what papers remember — quotable line earns coverage without gimmick or smear.",
      },
      {
        title: "Authorship pivot",
        body: "Redirect Capitol credit to county service — clerks secured elections; SOS job is showing up.",
      },
      {
        title: "Relation to d7-close",
        body: `Closing template: "${polishSurface().bookends.closing.script.slice(0, 80)}…" — show-steal line may replace beat 3 when staff clears.`,
      },
      {
        title: "Common mistakes",
        body: "Matching Hammer volume. Inventing ranking stats. Skipping newspaper test before stage lock.",
      },
    ],
    psychology: [
      {
        title: "Calm contrast",
        body: "When Hammer performs for crowd, slow down — command reads as competence, not reaction.",
      },
    ],
    opponentForecast: [
      {
        title: "Ranking + authorship bundle",
        body: "Hammer repeats integrity ranking and bill authorship at open and close — predictable pivot beats surprise.",
      },
    ],
    sampleLines: polishSurface().quotableCandidates.map((text, i) => ({
      label: i === 0 ? "Primary (d7-close)" : i === 1 ? "Show-steal" : "Alternate",
      text,
    })),
    doNotSay: [
      "Unverified integrity ranking numbers from memory.",
      "Personal attacks on pastor identity or party label.",
      "Fresh opponent quotes invented under peak-end pressure.",
    ],
    claimsGate: [
      ...claimsGateLines,
      "Show-steal example uses claims-verified contrast — no new Hammer character claims tonight.",
    ],
    keyTakeaways: [
      "One staff-cleared quotable line — newspaper test passed.",
      "Three cold reps — calm contrast, not volume.",
      "Closing beat 3 ready for bookends rehearsal.",
    ],
    practiceSteps: [
      "Staff simulates Hammer closing with ranking + authorship.",
      "Kelly delivers show-steal line three times.",
      "Staff confirms claims-green before stage lock.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayDrillHref(DAY7_ID, "d7-close"), label: "Closing clerk invoke drill" },
      { href: epDebatePrepDayBlockHref(DAY7_ID, "b7-open-close"), label: "Bookends polish block" },
      { href: epDebatePrepDayRehearsalHref(DAY7_ID, "rehearse-quotable-line"), label: "Quotable line rehearsal" },
      { href: epDebatePrepDayConceptHref(DAY7_ID, "quotable-without-gimmick-d7"), label: "Quotable concept" },
      { href: epOpponentBioHref("kim-hammer"), label: "Kim Hammer bio" },
      { href: EP_OPPONENT_BIOS_HREF, label: "Opponent bios hub" },
      { href: epDebatePrepDayExampleHref(DAY7_ID, "ex7-show-steal"), label: "This example" },
      { href: EP_DEBATE_PREP_REHEARSAL_HREF, label: "Rehearsal hub" },
    ],
  },
};

export function getDay7OpponentExampleStudy(exampleId: string): OpponentExampleStudyDeep | undefined {
  return DAY7_OPPONENT_EXAMPLE_STUDY[exampleId];
}

export function listDay7OpponentExampleStudyIds(): string[] {
  return Object.keys(DAY7_OPPONENT_EXAMPLE_STUDY);
}
