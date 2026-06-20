/**
 * Day 4 drill-down registry content (forum intelligence lab).
 */
import {
  EP_DEBATE_QUESTIONS_HREF,
  EP_FORUM_LAB_CAPITALIZE_MOVES_HREF,
  EP_FORUM_LAB_DEEP_ANALYSIS_HREF,
  EP_FORUM_TRANSCRIPT_LAB_HREF,
  EP_OPPONENT_BIOS_HREF,
  epDebatePrepDayBlockHref,
  epDebatePrepDayConceptHref,
  epDebatePrepDayExampleHref,
  epDebatePrepDayMicroLessonHref,
  epDebatePrepDayRehearsalHref,
  epOpponentBioHref,
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

const DAY4 = "day-4-forum-intelligence" as const;

export const DAY4_CONCEPTS: DayConceptDrillDown[] = [
  {
    id: "rosetta-stone-transcript",
    label: "Rosetta stone transcript",
    summary: "The three-candidate forum transcript is your highest-leverage intelligence — real words beat abstract fear.",
    sections: [
      {
        title: "Concrete beats abstract",
        body:
          "Kelly learns from what Hammer and Pakko actually said — not what staff feared they might say. Forum lab ingest feeds Days 4–5 automatically when workflow completes.",
      },
      {
        title: "Analyst first",
        body:
          "Listen like an analyst before writing your lines. Extract patterns and repeat phrases — do not memorize every sentence on Sunday.",
      },
    ],
    practiceSteps: [
      "Open forum transcript lab — upload or paste transcript.",
      "Skim one Hammer repeat phrase — mark for predicted debate line.",
      "Note one Kelly line that landed in the forum recording.",
    ],
    relatedLinks: [
      { href: EP_FORUM_TRANSCRIPT_LAB_HREF, label: "Forum transcript lab" },
      { href: epDebatePrepDayBlockHref(DAY4, "b4-lab"), label: "Forum lab block" },
      { href: epDebatePrepDayMicroLessonHref(DAY4, "d4-lab-workflow"), label: "Forum lab workflow micro-lesson" },
    ],
  },
  {
    id: "ingest-not-memorize",
    label: "Ingest — do not memorize",
    summary: "Sunday is cognitive load from transcript ingest — extract patterns, not every verbatim line.",
    sections: [
      {
        title: "Watch-out for Day 4",
        body:
          "Trying to memorize every forum line creates stage improvisation risk. Five capitalize moves on a notecard beats a transcript highlight dump.",
      },
    ],
    practiceSteps: [
      "After deep analysis v2, copy five capitalize moves only.",
      "Claims-check any quote before notecard use.",
      "Skip trap lane reps tonight — ingest is the job.",
    ],
    relatedLinks: [
      { href: EP_FORUM_LAB_CAPITALIZE_MOVES_HREF, label: "Capitalize moves hub" },
      { href: epDebatePrepDayConceptHref(DAY4, "success-check-d4"), label: "Success check" },
    ],
  },
  {
    id: "moderator-recycles-forum",
    label: "Moderator recycles forum",
    summary: "Press convention moderators often echo forum themes — map forum topics to SOS question bank.",
    sections: [
      {
        title: "SOS bank mapping",
        body:
          "Match top forum topics to moderator questions in the SOS bank. Note Hammer repeat lines per topic — you will hear versions again in Eureka Springs.",
      },
    ],
    practiceSteps: [
      "Open SOS question bank in election-plan.",
      "Match five forum topics to bank questions.",
      "Write one Hammer repeat line per matched topic.",
    ],
    relatedLinks: [
      { href: EP_DEBATE_QUESTIONS_HREF, label: "SOS debate questions hub" },
      { href: epDebatePrepDayBlockHref(DAY4, "b4-sos"), label: "SOS question bank block" },
      { href: epDebatePrepLaneHref("lane-d4-sos-map"), label: "Forum → SOS mapping lane" },
    ],
  },
  {
    id: "recovery-sunday",
    label: "Recovery Sunday",
    summary: "Walk, hydrate, one 60s opening — no new traps or stats on ingest day.",
    sections: [
      {
        title: "Why rest is a block",
        body:
          "Forum lab is heavy cognitive load. Recovery block prevents Kelly from adding new material that bypasses claims gate — one opening rep only.",
      },
    ],
    practiceSteps: [
      "10-minute walk without phone.",
      "Hydrate — set timer for recovery block end.",
      "One 60s opening aloud — no new content.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayBlockHref(DAY4, "b4-rest"), label: "Recovery block" },
      { href: epDebatePrepDayRehearsalHref(DAY4, "rehearse-forum-counter-60s"), label: "Forum counter rehearsal" },
    ],
  },
  {
    id: "goal-for-kelly-d4",
    label: "Goal for Kelly",
    summary:
      "Upload the three-candidate forum recording — transcribe, analyze, map predicted debate lines from real words.",
    sections: [
      {
        title: "Staff fallback",
        body:
          "Staff can run upload if Kelly is exhausted — paste transcript fallback is OK. Kelly still reviews predicted lines list before Day 5 drills.",
      },
    ],
    practiceSteps: [
      "Confirm forum artifact exists (video upload or pasted transcript).",
      "Run v1 + v2 analysis — staff assists if needed.",
      "Read success check aloud once.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayBlockHref(DAY4, "b4-lab"), label: "Forum lab block" },
      { href: EP_FORUM_LAB_DEEP_ANALYSIS_HREF, label: "Deep analysis lessons" },
    ],
  },
  {
    id: "success-check-d4",
    label: "Success check",
    summary: "Forum lab shows transcript + analysis artifact; Kelly reviews predicted lines list.",
    sections: [
      {
        title: "Evening gate",
        body:
          "Forum uploaded? Deep analysis run? Five capitalize moves on notecard? If yes/yes/yes — successful Day 4 minimum.",
      },
    ],
    practiceSteps: [
      "Answer evening review questions aloud.",
      "Mark minimum complete if forum lab block done.",
      "Preview Day 5 anticipate & capitalize pathway.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayBlockHref(DAY4, "b4-opponent-bios-reread"), label: "Opponent bios re-read" },
      { href: epDebatePrepDayExampleHref(DAY4, "ex4-forum"), label: "Forum integrity example" },
    ],
  },
];

export const DAY4_REHEARSAL: DayRehearsalDrillDown[] = [
  {
    id: "rehearse-forum-counter-60s",
    label: "60s counter to predicted Hammer line",
    durationLabel: "~60 seconds",
    script:
      "Pick one predicted Hammer line from forum lab deep analysis. Pivot: integrity is clerks with funded equipment, transparent processes, and a SOS office that picks up the phone — not abstract slogans from the Capitol.",
    presenceNotes: [
      "Use lab output — do not invent forum quotes.",
      "Claims gate every verbatim line before stage use.",
      "One counter only — Sunday is ingest, not trap marathon.",
      "Slow voice — concrete clerk image beats fast abstract rebuttal.",
    ],
    successCheck: [
      "Under 60 seconds on timer.",
      "Clerk-centered concrete image in response.",
      "Zero unverified verbatim opponent quotes.",
    ],
    relatedLinks: [
      { href: EP_FORUM_TRANSCRIPT_LAB_HREF, label: "Forum transcript lab" },
      { href: EP_FORUM_LAB_DEEP_ANALYSIS_HREF, label: "Deep analysis hub" },
      { href: epDebatePrepDayBlockHref(DAY4, "b4-lab"), label: "Forum lab block" },
    ],
  },
];

export function buildDay4Examples(): DayExampleDrillDown[] {
  const plan = getDebateWeekIntensiveDay(DAY4)!;
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
      "Integrity is clerks with funded equipment, transparent processes, and a SOS office that picks up the phone.",
      "Clerks in your county made elections work — I want an SOS who answers their grant questions this week.",
      "Abstract integrity talk is easy — I measure whether your clerk got her equipment question answered.",
    ],
    practiceSteps: [
      "Staff reads moderator integrity prompt.",
      "Kelly delivers clerk-centered one-liner in 30s.",
      "Refine line after forum lab ingest — claims-check before stage.",
    ],
    relatedLinks: [
      { href: EP_FORUM_TRANSCRIPT_LAB_HREF, label: "Forum transcript lab" },
      { href: epDebatePrepDayBlockHref(DAY4, "b4-lab"), label: "Forum lab block" },
      { href: epDebatePrepDayExampleHref(DAY4, "ex4-forum"), label: "This example" },
    ],
  }));
}

export function buildDay4Blocks(): DayBlockDrillDown[] {
  const plan = getDebateWeekIntensiveDay(DAY4)!;
  return plan.blocks.map((block) => {
    const theory = getBlockTheoryExpansion(DAY4, block.id);
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
    if (block.id === "b4-lab") {
      relatedLinks.push(
        { href: EP_FORUM_TRANSCRIPT_LAB_HREF, label: "Forum transcript lab" },
        { href: EP_FORUM_LAB_DEEP_ANALYSIS_HREF, label: "Deep analysis hub" },
        { href: EP_FORUM_LAB_CAPITALIZE_MOVES_HREF, label: "Capitalize moves" },
        { href: epDebatePrepLaneHref("lane-d4-lab-deep"), label: "Forum lab full pipeline lane" },
      );
    }
    if (block.id === "b4-sos") {
      relatedLinks.push(
        { href: EP_DEBATE_QUESTIONS_HREF, label: "SOS debate questions hub" },
        { href: epDebatePrepLaneHref("lane-d4-sos-map"), label: "Forum → SOS mapping lane" },
        { href: epDebatePrepDayBlockHref(DAY4, "b4-lab"), label: "Forum lab block" },
      );
    }
    if (block.id === "b4-rest") {
      relatedLinks.push(
        { href: epDebatePrepDayRehearsalHref(DAY4, "rehearse-forum-counter-60s"), label: "One forum counter rehearsal" },
        { href: epDebatePrepDayBlockHref(DAY4, "b4-lab"), label: "Forum lab block" },
      );
    }
    if (block.id === "b4-opponent-bios-reread") {
      relatedLinks.push(
        { href: EP_OPPONENT_BIOS_HREF, label: "Opponent bios hub" },
        { href: epOpponentBioHref("kim-hammer"), label: "Hammer bio re-read" },
        { href: epOpponentBioHref("michael-packo"), label: "Pakko bio re-read" },
        { href: EP_FORUM_TRANSCRIPT_LAB_HREF, label: "Forum transcript lab notes" },
      );
    }
    if (theory?.stretchLaneId) {
      relatedLinks.push({ href: epDebatePrepLaneHref(theory.stretchLaneId), label: "Linked drill-down lane" });
    }

    const practiceSteps: string[] = [];
    if (block.id === "b4-lab") {
      practiceSteps.push(
        "Upload forum video OR paste transcript in election-plan forum lab.",
        "Run v1 analysis — skim per-candidate themes.",
        "Run v2 deep analysis — copy five capitalize moves to notecard.",
        "Staff verifies quotes in claims before Kelly stages any line.",
      );
    } else if (block.id === "b4-sos") {
      practiceSteps.push(
        "Open SOS debate questions hub.",
        "Match top five forum topics to bank questions.",
        "Note Hammer repeat lines per topic — one sentence each.",
      );
    } else if (block.id === "b4-rest") {
      practiceSteps.push(
        "Walk 10 minutes — no new content research.",
        "Hydrate — one 60s opening only if energy allows.",
        "Stop when timer ends — save trap lanes for Day 5.",
      );
    } else if (block.id === "b4-opponent-bios-reread") {
      practiceSteps.push(
        "Re-read Hammer bio with forum notes — update capitalize triggers.",
        "Re-read Pakko bio — one respect line if transcript differs from forecast.",
        "Speak one adjusted memory line per opponent — claims-check quotes.",
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

export function buildDay4MicroLessons(): DayMicroLessonDrillDown[] {
  const overlay = getDayDeepOverlay(DAY4);
  return overlay.microLessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    readMinutes: lesson.readMinutes,
    body: lesson.body,
    practiceSteps: [
      "Read workflow once — note the v2 step.",
      "Confirm capitalize moves export path for Day 5.",
      "Claims-check before staging any forum quote.",
    ],
    relatedLinks: [
      { href: EP_FORUM_TRANSCRIPT_LAB_HREF, label: "Forum transcript lab" },
      { href: epDebatePrepDayBlockHref(DAY4, "b4-lab"), label: "Forum lab block" },
      { href: EP_FORUM_LAB_CAPITALIZE_MOVES_HREF, label: "Capitalize moves" },
    ],
  }));
}

export function buildDay4Drills(): DayCommandDrillDown[] {
  return [];
}
