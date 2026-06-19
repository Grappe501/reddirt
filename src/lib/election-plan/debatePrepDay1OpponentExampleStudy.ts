/**
 * Day 1 opponent example — deep drill-down study guides.
 */
import {
  EP_OPPOSITION_RESEARCH_HREF,
  epDebatePrepBriefingHref,
  epDebatePrepDayBlockHref,
  epDebatePrepDayDrillHref,
  epDebatePrepDayExampleHref,
  epForumLabElectionLawTopicHref,
  epTrapLaneHref,
} from "@/lib/election-plan/debate-prep-links";
import type { BlockStudyPhase, BlockStudySampleLine, Day1BlockStudyDeep } from "@/lib/election-plan/debatePrepDay1BlockStudy";

const DAY1 = "day-1-command-foundation" as const;

export type OpponentExampleStudyDeep = Omit<Day1BlockStudyDeep, "blockId" | "studyGuideTitle"> & {
  exampleId: string;
  drillDownTitle: string;
  opponent: string;
  theirMove: string;
  kellyResponse: string;
  whyItWorks: string;
  sourceNote: string;
};

export const DAY1_OPPONENT_EXAMPLE_STUDY: Record<string, OpponentExampleStudyDeep> = {
  "ex1-hammer-open": {
    exampleId: "ex1-hammer-open",
    drillDownTitle: "Hammer opening — integrity ranking & authorship pivot",
    opponent: "Hammer",
    theirMove:
      "Opens with election integrity ranking and 'I wrote the bills that secured Arkansas elections.'",
    kellyResponse:
      "Clerks secured those elections — in every county. I want an office that answers their calls, not one that takes credit from the Capitol.",
    whyItWorks: "Redirects authorship to service without attacking motive.",
    sourceNote: "Pattern from Hammer campaign messaging — verify in claims before broadcast.",
    overview:
      "This is Hammer's most likely opening move: collapse legislative authorship into SOS competence using integrity rankings and 'I wrote the bills.' Your job is not to debate rankings or bill lists on Day 1 — it is to credit clerks and name the administrator job in one breath.",
    phases: [
      {
        minutesLabel: "0–5 min",
        title: "Decode the move",
        steps: [
          "Read Hammer's line verbatim twice — hear authorship + ranking bundled together.",
          "Write in your own words: what job is he claiming?",
          "Write: what job are you asking voters to hire you for?",
          "Note: he wants lawmaking credit to equal election administration.",
        ],
      },
      {
        minutesLabel: "5–15 min",
        title: "Three-step pivot architecture",
        steps: [
          "Step 1 — Credit clerks: who actually runs elections in Arkansas?",
          "Step 2 — Name SOS as service desk: answers calls, training, published rules.",
          "Step 3 — Contrast Capitol credit vs county execution — no motive attack.",
          "Speak primary Kelly line once slowly — pause after 'every county.'",
          "4-4-6 breath before speaking — do not rush because he sounded confident.",
        ],
      },
      {
        minutesLabel: "15–25 min",
        title: "Primary line reps (45-second cap)",
        steps: [
          "Staff reads Hammer line verbatim.",
          "Kelly delivers primary response in under 45 seconds.",
          "Debrief: Did I cite unverified rankings? Did I attack motive?",
          "Repeat until three clean takes on video.",
          "Success: boring automaticity — same frame, natural wording.",
        ],
      },
      {
        minutesLabel: "25–35 min",
        title: "Alternate lines & agree-add stack",
        steps: [
          "Practice alternate: author vs administrator one-liner.",
          "Practice alternate: Friday-afternoon clerk rule (Saline County frame).",
          "Optional stack: agree on secure elections → clerk credit → SOS service desk.",
          "Never end on agree alone if you open with agreement.",
        ],
      },
      {
        minutesLabel: "35–40 min",
        title: "Claims gate & lock-in",
        steps: [
          "Red-line: Heritage rankings, act numbers, fraud stats — staff only until verified.",
          "Green-line: clerks run elections; SOS serves counties; author ≠ administrator.",
          "Journal one line: what I will not say on stage tonight.",
          "Mark example drill complete when primary line is clean on video.",
        ],
      },
    ],
    deepSections: [
      {
        title: "What Hammer is doing",
        body:
          "Hammer collapses legislative authorship into SOS competence. Integrity rankings and 'I wrote the bills' are his default opening — he wants the room to equate lawmaking with running elections. This is experience-equals-SOS-ready trap lane bait.",
      },
      {
        title: "Why the ranking claim works on him",
        body:
          "Ranking language sounds factual and non-partisan. Voters may nod before they ask who implements. Your pivot moves from abstract national scorecards to county clerks voters actually know — without fighting the ranking on its own terms unless staff has verified rebuttal material.",
      },
      {
        title: "Kelly's pivot architecture (detail)",
        body:
          "Credit clerks first — implementation truth voters feel. Name the SOS job as service desk second — answers calls, training calendars, published guidance. Contrast Capitol credit vs county execution third — writing law and running the office clerks depend on are different jobs. Do not debate bill text line-by-line on Day 1 unless claims-verified.",
      },
      {
        title: "Body protocol when Hammer opens first",
        body:
          "Stillness while he speaks is power — hands quiet, shoulders down, one 4-4-6 cycle if needed. Do not fidget or scribble notes on camera. When moderator turns to you, pause two beats, then deliver primary line — rush reads as defensive.",
      },
      {
        title: "What NOT to say",
        body:
          "Do not say stolen election, fraud without evidence, or suppress-votes framing. Do not attack Hammer's motives ('he doesn't care about clerks'). Do not invent funding figures or cite acts you have not verified. Do not list five jobs — one contrast line beats a resume dump.",
      },
      {
        title: "Claims gate",
        body:
          "Do not cite Heritage rankings or specific act numbers on stage until staff verifies in claims ledger. 'Clerks secured those elections' is frame-safe. Forum or AI summaries of Hammer's record are intel — not debate citations.",
      },
    ],
    sampleLines: [
      {
        label: "Primary response (Day 1 default)",
        text: "Clerks secured those elections — in every county. I want an office that answers their calls, not one that takes credit from the Capitol.",
        note: "Pause after 'every county'",
      },
      {
        label: "Author vs administrator",
        text: "Writing law and running the office clerks depend on are different jobs. I am asking for the administrator job.",
      },
      {
        label: "Policy without county cost",
        text: "Senator Hammer helped write policy — the Secretary of State's job is to make sure seventy-five county clerks can execute it without going broke.",
      },
      {
        label: "Agree-add stack",
        text: "We all want secure elections — clerks need a SOS who answers the phone when Saline County gets a new rule at four on a Friday.",
        note: "Use when integrity pile-on already happened",
      },
    ],
    keyTakeaways: [
      "Credit clerks; name SOS service desk; contrast jobs — not motives.",
      "Three clean video takes beats one perfect zinger.",
      "Rankings and act numbers stay behind claims gate until verified.",
    ],
    practiceSteps: [
      "Complete all five phases (~40 min).",
      "Three video reps of primary line after Hammer bait.",
      "Staff claims-gate before adding any ranking rebuttal.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayExampleHref(DAY1, "ex1-hammer-open"), label: "This drill-down" },
      { href: epDebatePrepDayBlockHref(DAY1, "b1-author"), label: "Author vs administrator study" },
      { href: epDebatePrepBriefingHref("author-vs-administrator"), label: "Author vs administrator briefing" },
      { href: epDebatePrepBriefingHref("agree-but-never-only-agree"), label: "Agree-but-never-only-agree briefing" },
      { href: epTrapLaneHref("experience-equals-sos-ready"), label: "Trap lane · experience equals SOS ready" },
      { href: epForumLabElectionLawTopicHref("sos-role-vs-legislature"), label: "Election law · SOS vs legislature" },
      { href: epDebatePrepDayDrillHref(DAY1, "d1-agree-add"), label: "Command drill · agree-add" },
      { href: EP_OPPOSITION_RESEARCH_HREF, label: "Opposition research hub" },
    ],
  },
};

export function getDay1OpponentExampleStudy(exampleId: string): OpponentExampleStudyDeep | undefined {
  return DAY1_OPPONENT_EXAMPLE_STUDY[exampleId];
}
