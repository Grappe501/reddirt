/**
 * Day 2 opponent examples — deep drill-down study guides.
 */
import {
  EP_OPPOSITION_RESEARCH_HREF,
  epDebatePrepDayBlockHref,
  epDebatePrepDayDrillHref,
  epDebatePrepDayExampleHref,
  epDebatePrepDayMicroLessonHref,
  epOpponentBioHref,
  epTrapLaneHref,
} from "@/lib/election-plan/debate-prep-links";
import { DAY2_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import type { OpponentExampleStudyDeep } from "@/lib/election-plan/debatePrepDay1OpponentExampleStudy";

export const DAY2_OPPONENT_EXAMPLE_STUDY: Record<string, OpponentExampleStudyDeep> = {
  "ex2-hammer-rank": {
    exampleId: "ex2-hammer-rank",
    drillDownTitle: "Hammer ranking cite — Heritage / integrity scorecard pivot",
    opponent: "Hammer",
    theirMove: "Cites Heritage Foundation or similar ranking on election integrity.",
    kellyResponse:
      "Rankings measure rhetoric. I measure whether a county clerk in Montgomery County got her grant question answered this week.",
    whyItWorks: "Moves abstract scorecard to concrete service — Kelly's lane.",
    sourceNote: "Contrast frame KH-2 — control vs trust. Verify ranking claims before broadcast.",
    overview:
      "Hammer uses abstract integrity rankings to avoid county implementation detail. Your job is not to debate the scorecard — pivot to the clerk phone and grant ledger in one breath.",
    professorLead:
      "This is the second most common Hammer tell after authorship. If you hear Heritage or '#1 state,' your hands stay still and your voice slows — then local service.",
    phases: [
      {
        minutesLabel: "0–8 min",
        title: "Decode the ranking move",
        steps: [
          "Read Hammer line twice — hear abstract national frame.",
          "Write: what voter fear is he activating?",
          "Write: what concrete image answers that fear better?",
          "Note: he wants rhetoric debate; you want clerk service debate.",
        ],
      },
      {
        minutesLabel: "8–20 min",
        title: "Primary pivot reps",
        steps: [
          "Staff reads ranking cite verbatim.",
          "Kelly delivers primary response under 45 seconds.",
          "Alternate: Montgomery County grant question line.",
          "Alternate: 'Clerks know whether SOS answered the phone.'",
          "Three clean takes on video — no ranking statistics back.",
        ],
      },
      {
        minutesLabel: "20–30 min",
        title: "Speak-order & trap link",
        steps: [
          "Practice pivot in speak positions 1, 2, 3.",
          "Link to trap lane 1 if authorship bundled with ranking.",
          "Open ranking pivot drill — one round.",
          "Claims gate: red-line Heritage stats until verified.",
        ],
      },
      {
        minutesLabel: "30–35 min",
        title: "Lock-in",
        steps: [
          "One ranking pivot without notes.",
          "Body check: still hands when Hammer voice would accelerate.",
          "Mark optional example complete.",
        ],
      },
    ],
    deepSections: [
      {
        title: "Why rankings land",
        body:
          "National scorecards feel authoritative to anxious voters. Kelly does not dispute Arkansas elections — she moves the conversation to whether SOS serves clerks this week.",
      },
      {
        title: "County frame",
        body:
          "Saline, Phillips, Sebastian — pick a county clerk image voters recognize. Abstract vs concrete is the whole debate.",
      },
      {
        title: "Body protocol when ranking cite lands",
        body:
          "Hammer often speeds up on ranking lines. Kelly slows down, looks at moderator, delivers clerk phone line — contrast reads as command, not rebuttal panic.",
      },
      {
        title: "Speak-order positions",
        body:
          "Ranking cite works in first, second, or third speak position — practice all three so you are not surprised by timing.",
      },
      {
        title: "Bundled authorship + ranking",
        body:
          "If Hammer stacks bill list with Heritage cite, bridge to author vs administrator — do not debate two scorecards in one answer.",
      },
    ],
    psychology: [
      {
        title: "Integrity-anxious viewer",
        body:
          "They want calm competence, not a fight about national indices. Clerk service is the emotional antidote to abstract fear.",
      },
    ],
    opponentForecast: [
      {
        title: "Hammer follow-up",
        body: "May double down on bill list after ranking — bridge to author vs administrator, not bill tennis.",
      },
    ],
    sampleLines: [
      {
        label: "Primary",
        text: "Rankings measure rhetoric. I measure whether a county clerk got her grant question answered this week.",
      },
      {
        label: "Phone line",
        text: "Clerks in your county know whether the SOS office answered the phone last week.",
      },
      {
        label: "Author bridge",
        text: "Writing law and running the office clerks depend on are different jobs — I am asking for the administrator job.",
      },
      {
        label: "Agree-add",
        text: "We all want secure elections — clerks in every county made that happen. I want an SOS who serves them.",
      },
    ],
    doNotSay: [
      "Debating Heritage methodology",
      "Arkansas is not #1 — unverified counter-ranking",
      "Attacking Hammer's motives",
    ],
    claimsGate: [
      "No Heritage or ranking statistics on stage unless claims-verified.",
      "Montgomery County example — generic clerk frame OK; specific grant claims need verification.",
    ],
    keyTakeaways: [
      "Abstract → concrete in one sentence.",
      "Slow voice when Hammer accelerates.",
      "Optional example — skip if film + trap lanes ran long.",
    ],
    practiceSteps: [
      "Three ranking pivot reps.",
      "One video take under 45s.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayDrillHref(DAY2_ID, "d2-ranking-pivot"), label: "Ranking pivot drill" },
      { href: epTrapLaneHref("experience-equals-sos-ready"), label: "Trap lane 1" },
      { href: epDebatePrepDayBlockHref(DAY2_ID, "b2-film"), label: "Film tells worksheet" },
      { href: epOpponentBioHref("kim-hammer"), label: "Hammer bio" },
      { href: EP_OPPOSITION_RESEARCH_HREF, label: "Opposition research" },
    ],
  },
  "ex2-pakko-split": {
    exampleId: "ex2-pakko-split",
    drillDownTitle: "Pakko libertarian split — steal the reform lane",
    opponent: "Pakko",
    theirMove: "Libertarian frame on government overreach in elections.",
    kellyResponse:
      "I agree bureaucracy can burden clerks — that's why I want unfunded mandates on the record, not more Capitol mandates without funding.",
    whyItWorks: "Agree on clerk burden, steal the reform lane from both sides.",
    sourceNote: "Pakko scaffold — no unsourced attacks.",
    overview:
      "Pakko will agree that government burdens clerks — Kelly agrees too, then owns the administrator fix. Do not fight libertarian voters; bridge to SOS service desk and published rules.",
    professorLead:
      "This is your steal-the-reform-lane move. Pakko wants government friction; you want clerk relief with transparent SOS implementation — same voter, better job fit.",
    phases: [
      {
        minutesLabel: "0–8 min",
        title: "Decode libertarian frame",
        steps: [
          "Read Pakko line — find the agreeable kernel (clerk burden).",
          "Write agree sentence — one breath.",
          "Write pivot sentence — SOS administrator, not Capitol credit.",
          "No attack on ballot access or third-party status.",
        ],
      },
      {
        minutesLabel: "8–20 min",
        title: "30-second pivot reps",
        steps: [
          "Staff reads Pakko overreach line.",
          "Kelly 30s acknowledge + pivot — three rounds.",
          "If Hammer piles on, bridge to moderator eye-line — one sentence.",
          "Record one clean take.",
        ],
      },
      {
        minutesLabel: "20–28 min",
        title: "Three-way link",
        steps: [
          "Open three-way geometry micro-lesson skim.",
          "Practice with staff simulating Hammer + Pakko tags.",
          "Mark optional example complete.",
        ],
      },
      {
        minutesLabel: "28–35 min",
        title: "Lock-in & claims gate",
        steps: [
          "One 30s pivot on video without notes.",
          "Read claims gate aloud — no unsourced Pakko quotes.",
          "Mark optional example complete.",
        ],
      },
    ],
    deepSections: [
      {
        title: "Reform lane steal",
        body:
          "Both opponents can sound anti-bureaucracy. Kelly agrees on clerk burden, differentiates who will publish rules and answer phones Monday morning.",
      },
      {
        title: "Respect without patronizing",
        body:
          "Third-candidate status is not your target. Acknowledge reform concern in one sentence — pivot to seventy-five county administratorship.",
      },
      {
        title: "Pile-on after Pakko agree",
        body:
          "Hammer may tag-team when you agree with Pakko. Bridge to moderator, one clerk sentence, stop — never fight two fronts.",
      },
    ],
    psychology: [
      {
        title: "Libertarian-leaning viewer",
        body:
          "They reward authenticity over party labels. Agree on clerk burden, then name SOS as service desk — not Capitol credit.",
      },
    ],
    opponentForecast: [
      {
        title: "Hammer after Pakko",
        body: "May pivot to authorship when Kelly agrees on reform — ready author vs administrator bridge.",
      },
      {
        title: "Pakko follow-up",
        body: "May cite unfunded mandates — Kelly owns that lane with on-the-record clerk burden framing.",
      },
    ],
    sampleLines: [
      {
        label: "Primary",
        text: "I agree bureaucracy can burden clerks — that is why I want unfunded mandates on the record, not more Capitol mandates without funding.",
      },
      {
        label: "Respect + pivot",
        text: "Dr. Pakko raises fair questions — my job is administering elections fairly in all seventy-five counties every day.",
      },
    ],
    doNotSay: [
      "Anti-petition framing",
      "Attacking libertarian voters",
      "Fighting Pakko and Hammer in same answer",
    ],
    claimsGate: ["No unsourced Pakko quotes — verify in forum lab."],
    keyTakeaways: [
      "Agree on clerk burden — add SOS implementation.",
      "30 seconds max for optional example.",
      "Respect third candidate.",
    ],
    practiceSteps: [
      "Three 30s pivot reps.",
      "One pile-on bridge if time allows.",
    ],
    relatedLinks: [
      { href: epOpponentBioHref("michael-packo"), label: "Pakko bio" },
      { href: epDebatePrepDayMicroLessonHref(DAY2_ID, "d2-three-way"), label: "Three-way geometry" },
      { href: epDebatePrepDayBlockHref(DAY2_ID, "b2-packo"), label: "Pakko contrast block" },
      { href: epDebatePrepDayExampleHref(DAY2_ID, "ex2-hammer-rank"), label: "Hammer ranking example" },
      { href: EP_OPPOSITION_RESEARCH_HREF, label: "Opposition research" },
    ],
  },
};

export function getDay2OpponentExampleStudy(exampleId: string): OpponentExampleStudyDeep | undefined {
  return DAY2_OPPONENT_EXAMPLE_STUDY[exampleId];
}
