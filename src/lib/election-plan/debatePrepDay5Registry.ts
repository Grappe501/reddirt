/**
 * Day 5 drill-down registry content (anticipate & capitalize).
 */
import {
  EP_DEBATE_PREP_TUTOR_HREF,
  EP_DEBATE_QUESTIONS_HREF,
  EP_FORUM_LAB_CAPITALIZE_MOVES_HREF,
  EP_FORUM_TRANSCRIPT_LAB_HREF,
  EP_TRAP_LANES_HREF,
  epDebatePrepDayBlockHref,
  epDebatePrepDayConceptHref,
  epDebatePrepDayDrillHref,
  epDebatePrepDayExampleHref,
  epDebatePrepDayMicroLessonHref,
  epDebatePrepDayRehearsalHref,
  epTrapLaneHref,
} from "@/lib/election-plan/debate-prep-links";
import { epDebatePrepLaneHref } from "@/lib/election-plan/debate-prep-route-map";
import type {
  DayBlockDrillDown,
  DayCommandDrillDown,
  DayConceptDrillDown,
  DayExampleDrillDown,
  DayMicroLessonDrillDown,
  DayRehearsalDrillDown,
} from "@/lib/election-plan/debatePrepDayDrillDown";
import { getBlockTheoryExpansion } from "@/lib/intelligence/v4/debateWeekIntensive2026V3";
import { getDayDeepOverlay } from "@/lib/intelligence/v4/debateWeekIntensive2026Deep";
import { getDebateWeekIntensiveDay } from "@/lib/intelligence/v4/debateWeekIntensive2026";

const DAY5 = "day-5-anticipate-and-capitalize" as const;

const TRAP_LANES_DAY5 = [
  { id: "county-champion", label: "Trap lane 3 · county champion" },
  { id: "integrity-without-participation", label: "Trap lane 4 · integrity without participation" },
  { id: "fraud-data-dare", label: "Trap lane 5 · fraud data dare" },
  { id: "culture-war-escalation", label: "Trap lane 6 · culture-war escalation" },
] as const;

export const DAY5_CONCEPTS: DayConceptDrillDown[] = [
  {
    id: "spaced-retrieval-d5",
    label: "Spaced retrieval",
    summary: "Pull yesterday's forum intel forward under time pressure — Command Mode is preparation, not improvisation.",
    sections: [
      {
        title: "Forum intel must be pullable",
        body:
          "Day 4 ingested the transcript. Day 5 tests whether Kelly can retrieve capitalize moves in under ten seconds when a moderator or Hammer opens a lane.",
      },
      {
        title: "No new stats today",
        body: "Timed pairs use claims-green lines from Day 4 only. Adding fresh research under the clock bypasses the claims gate.",
      },
    ],
    practiceSteps: [
      "Open Day 4 green notecard lines — confirm eight pair candidates.",
      "Time one pair at 45s — answer starts before Hammer finishes.",
      "Log weakest lane for Day 6 simulation.",
    ],
    relatedLinks: [
      { href: EP_FORUM_TRANSCRIPT_LAB_HREF, label: "Forum transcript lab" },
      { href: EP_FORUM_LAB_CAPITALIZE_MOVES_HREF, label: "Capitalize moves hub" },
      { href: epDebatePrepDayBlockHref(DAY5, "b5-lab-review"), label: "Capitalize sheet block" },
    ],
  },
  {
    id: "when-x-say-y-d5",
    label: "When X, say Y",
    summary: "Implementation intentions outperform generic prep under stress — eight timed pairs minimum.",
    sections: [
      {
        title: "Capitalize vs counter",
        body:
          "Countering puts you in Hammer's frame. Capitalizing names what clerks need next — move from their line to your lane in one sentence.",
      },
    ],
    practiceSteps: [
      "Export capitalize moves from forum lab.",
      "Merge deep analysis command drills into personal sheet.",
      "Claims-check every Kelly line before timing.",
    ],
    relatedLinks: [
      { href: epDebatePrepLaneHref("lane-d5-capitalize"), label: "Capitalize sheet lane" },
      { href: epDebatePrepDayMicroLessonHref(DAY5, "d5-capitalize"), label: "Capitalize micro-lesson" },
      { href: epDebatePrepDayConceptHref(DAY5, "success-check-d5"), label: "Success check" },
    ],
  },
  {
    id: "trap-lanes-three-six",
    label: "Trap lanes 3–6",
    summary: "Forum intel fills gaps in lanes 3–6 — combine with trap scripts at moderator pace.",
    sections: [
      {
        title: "Hammer rotates lanes",
        body:
          "If one trap fails he pivots. Kelly needs county champion, integrity-without-participation, fraud-data-dare, and culture-war-escalation cold at 60s each.",
      },
    ],
    practiceSteps: [
      "Open trap lanes 3–6 in election-plan.",
      "60s per lane — three rounds if energy allows.",
      "Note weakest lane for Day 6 sim staff debrief.",
    ],
    relatedLinks: TRAP_LANES_DAY5.map((lane) => ({
      href: epTrapLaneHref(lane.id),
      label: lane.label,
    })),
  },
  {
    id: "pile-on-bridge",
    label: "Pile-on bridge",
    summary: "When Hammer and Pakko double-team on trust — rise above, pivot to clerks.",
    sections: [
      {
        title: "Do not fight two fronts",
        body:
          "Bridge to clerks: let the Capitol debate trust — ask what clerks need before November. Honest pause beats fake certainty.",
      },
    ],
    practiceSteps: [
      "Read command drill d5-pileon-pivot aloud once.",
      "Staff simulates pile-on — Kelly bridges in 30s.",
      "Optional ex5-pileon example if energy allows.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayDrillHref(DAY5, "d5-pileon-pivot"), label: "Pile-on command drill" },
      { href: epDebatePrepDayExampleHref(DAY5, "ex5-pileon"), label: "Pile-on example" },
    ],
  },
  {
    id: "goal-for-kelly-d5",
    label: "Goal for Kelly",
    summary:
      "Turn forum transcript analysis into a personal cheat sheet: when Hammer says X, Kelly says Y — all claims-verified.",
    sections: [
      {
        title: "Pre-load responses",
        body:
          "When you hear the first three words of a Hammer repeat line, the answer should already be forming. Forum-derived drills only — no improvisation with unverified quotes.",
      },
    ],
    practiceSteps: [
      "Confirm Day 4 forum artifact exists.",
      "Build or import eight when-X-say-Y pairs.",
      "Run SOS sprint — five questions at 90s each.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayBlockHref(DAY5, "b5-sos-sprint"), label: "SOS question sprint block" },
      { href: EP_DEBATE_QUESTIONS_HREF, label: "SOS debate questions hub" },
    ],
  },
  {
    id: "success-check-d5",
    label: "Success check",
    summary: "Capitalize sheet has ≥8 when-X-say-Y pairs; all green in claims.",
    sections: [
      {
        title: "Evening gate",
        body:
          "Eight pairs rehearsed? Forum-derived drills timed? Pile-on pivot cold? If yes — ready for Day 6 simulation.",
      },
    ],
    practiceSteps: [
      "Answer evening review questions aloud.",
      "Mark minimum complete if capitalize block done.",
      "Preview Day 6 full simulation pathway.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayRehearsalHref(DAY5, "rehearse-capitalize-pairs"), label: "Capitalize pairs rehearsal" },
      { href: epDebatePrepDayBlockHref(DAY5, "b5-tutor"), label: "AI moot court block" },
    ],
  },
];

export const DAY5_REHEARSAL: DayRehearsalDrillDown[] = [
  {
    id: "rehearse-capitalize-pairs",
    label: "Five forum-derived Q&A pairs timed",
    durationLabel: "~15 minutes",
    script:
      "Using Day 4 green notecard lines only: staff reads trigger (Hammer line or moderator question). Kelly delivers capitalize response in 45–60s. Five pairs minimum tonight — stretch to eight before evening close.",
    presenceNotes: [
      "Triggers may paraphrase forum lines — Kelly lines must be claims-green.",
      "Answer should start before staff finishes the trigger when possible.",
      "No new stats or opponent claims invented under the timer.",
      "Log one pair that felt slow — repeat twice.",
    ],
    successCheck: [
      "Five pairs completed under timer.",
      "Every Kelly line passed claims gate.",
      "At least one clerk-centered image per pair.",
    ],
    relatedLinks: [
      { href: EP_FORUM_LAB_CAPITALIZE_MOVES_HREF, label: "Capitalize moves hub" },
      { href: epDebatePrepDayBlockHref(DAY5, "b5-lab-review"), label: "Capitalize sheet block" },
      { href: epDebatePrepLaneHref("lane-d5-capitalize"), label: "Eight timed pairs lane" },
    ],
  },
];

export function buildDay5Examples(): DayExampleDrillDown[] {
  const plan = getDebateWeekIntensiveDay(DAY5)!;
  return plan.opponentExamples.map((ex) => ({
    id: ex.id,
    opponent: ex.opponent,
    theirMove: ex.theirMove,
    kellyResponse: ex.kellyResponse,
    whyItWorks: ex.whyItWorks,
    sourceNote: ex.sourceNote,
    sections: [
      { title: "What they are doing", body: ex.theirMove },
      { title: "Kelly pivot", body: ex.kellyResponse },
      { title: "Why it works", body: ex.whyItWorks },
      { title: "Claims gate", body: ex.sourceNote },
    ],
    alternateLines: [
      "I'll let the Capitol debate trust — I'm asking clerks what they need before November.",
      "Clerks in your county need answers this week — not a double-team on abstract trust.",
      "Bridge first — then answer the clerk part, because that is what this office is for.",
    ],
    practiceSteps: [
      "Staff reads pile-on setup — Hammer plus Pakko on government trust.",
      "Kelly delivers bridge line in 30s — no counter-punching Pakko.",
      "Repeat until paraphrase feels natural — not read from notes.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayDrillHref(DAY5, "d5-pileon-pivot"), label: "Pile-on command drill" },
      { href: epDebatePrepDayBlockHref(DAY5, "b5-trap-all"), label: "Trap lanes block" },
      { href: epDebatePrepDayExampleHref(DAY5, "ex5-pileon"), label: "This example" },
    ],
  }));
}

export function buildDay5Blocks(): DayBlockDrillDown[] {
  const plan = getDebateWeekIntensiveDay(DAY5)!;
  return plan.blocks.map((block) => {
    const theory = getBlockTheoryExpansion(DAY5, block.id);
    const sections: Array<{ title: string; body: string }> = [
      { title: "Activity", body: block.activity },
      { title: "Why this block", body: block.why },
    ];
    if (theory) {
      sections.push(
        { title: "Adult-education rationale", body: theory.adultEducationWhy },
        { title: "What success looks like", body: theory.whatSuccessLooksLike },
        { title: "Common mistakes", body: theory.commonMistakes.join(" · ") },
      );
    }

    const relatedLinks: Array<{ href: string; label: string }> = [];
    if (block.id === "b5-lab-review") {
      relatedLinks.push(
        { href: EP_FORUM_TRANSCRIPT_LAB_HREF, label: "Forum transcript lab" },
        { href: EP_FORUM_LAB_CAPITALIZE_MOVES_HREF, label: "Capitalize moves hub" },
        { href: epDebatePrepLaneHref("lane-d5-capitalize"), label: "Eight timed pairs lane" },
      );
    }
    if (block.id === "b5-trap-all") {
      relatedLinks.push(
        { href: EP_TRAP_LANES_HREF, label: "Trap lanes hub" },
        ...TRAP_LANES_DAY5.map((lane) => ({ href: epTrapLaneHref(lane.id), label: lane.label })),
        { href: epDebatePrepLaneHref("lane-d5-trap-sprint"), label: "Trap sprint lane" },
      );
    }
    if (block.id === "b5-sos-sprint") {
      relatedLinks.push(
        { href: EP_DEBATE_QUESTIONS_HREF, label: "SOS debate questions hub" },
        { href: epDebatePrepDayBlockHref(DAY5, "b5-lab-review"), label: "Capitalize sheet block" },
      );
    }
    if (block.id === "b5-tutor") {
      relatedLinks.push(
        { href: EP_DEBATE_PREP_TUTOR_HREF, label: "Debate prep tutor" },
        { href: epDebatePrepLaneHref("lane-d5-moot-stretch"), label: "AI moot court lane" },
        { href: EP_FORUM_TRANSCRIPT_LAB_HREF, label: "Forum Hammer lines source" },
      );
    }
    if (theory?.stretchLaneId) {
      relatedLinks.push({ href: epDebatePrepLaneHref(theory.stretchLaneId), label: "Linked drill-down lane" });
    }

    const practiceSteps: string[] = [];
    if (block.id === "b5-lab-review") {
      practiceSteps.push(
        "Import Day 4 green notecard lines into capitalize sheet.",
        "Build eight when-X-say-Y pairs — claims-check every Kelly line.",
        "Time each pair 45–60s — mock moderator block once if energy allows.",
      );
    } else if (block.id === "b5-trap-all") {
      practiceSteps.push(
        "Open trap lanes 3–6 — county champion through culture-war escalation.",
        "60s per lane — speak pivot aloud, not silent read.",
        "Log weakest lane for Day 6 simulation debrief.",
      );
    } else if (block.id === "b5-sos-sprint") {
      practiceSteps.push(
        "Pick five SOS questions mapped from Day 4 forum topics.",
        "90s per question — speak order 1·2·3 aloud.",
        "Stop when five complete — no new policy research tonight.",
      );
    } else if (block.id === "b5-tutor") {
      practiceSteps.push(
        "Open debate prep tutor — forum-derived Hammer preset.",
        "30-minute moot session — forum lines only.",
        "One debrief note for staff — no new material after timer.",
      );
    }

    return {
      blockId: block.id,
      title: block.title,
      minutes: block.minutes,
      activity: block.activity,
      why: block.why,
      sections,
      practiceSteps,
      relatedLinks,
    };
  });
}

export function buildDay5MicroLessons(): DayMicroLessonDrillDown[] {
  const overlay = getDayDeepOverlay(DAY5);
  return overlay.microLessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    readMinutes: lesson.readMinutes,
    body: lesson.body,
    practiceSteps: [
      "Read capitalize vs counter distinction once.",
      "Pick one Day 4 notecard line — rewrite as capitalize (not counter).",
      "Claims-check before adding to timed pair sheet.",
    ],
    relatedLinks: [
      { href: EP_FORUM_LAB_CAPITALIZE_MOVES_HREF, label: "Capitalize moves hub" },
      { href: epDebatePrepDayBlockHref(DAY5, "b5-lab-review"), label: "Capitalize sheet block" },
      { href: epDebatePrepDayConceptHref(DAY5, "when-x-say-y-d5"), label: "When X say Y concept" },
    ],
  }));
}

export function buildDay5Drills(): DayCommandDrillDown[] {
  const plan = getDebateWeekIntensiveDay(DAY5)!;
  const pileon = plan.opponentExamples.find((ex) => ex.id === "ex5-pileon");
  return [
    {
      id: "d5-pileon-pivot",
      ifTheySay: pileon?.theirMove ?? "Hammer tries pile-on with Pakko on government trust.",
      youSay:
        pileon?.kellyResponse ??
        "I'll let the Capitol debate trust — I'm asking clerks what they need before November.",
      thenScan: "Bridge to clerks — do not fight two fronts. Hold composure 2 seconds after pivot.",
      practiceSteps: [
        "Staff simulates Hammer + Pakko pile-on on government trust.",
        "Kelly delivers bridge line in 30s — no counter-punching Pakko.",
        "Repeat until paraphrase feels natural.",
      ],
      relatedLinks: [
        { href: epDebatePrepDayExampleHref(DAY5, "ex5-pileon"), label: "Pile-on example" },
        { href: epDebatePrepDayConceptHref(DAY5, "pile-on-bridge"), label: "Pile-on bridge concept" },
        { href: epDebatePrepDayBlockHref(DAY5, "b5-trap-all"), label: "Trap lanes block" },
      ],
    },
  ];
}
