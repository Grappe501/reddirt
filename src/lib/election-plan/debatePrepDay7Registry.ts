/**
 * Day 7 drill-down registry content (refine & steal the show).
 */
import {
  EP_DEBATE_PREP_REHEARSAL_HREF,
  EP_OPPONENT_BIOS_HREF,
  epDebatePrepDayBlockHref,
  epDebatePrepDayConceptHref,
  epDebatePrepDayDrillHref,
  epDebatePrepDayExampleHref,
  epDebatePrepDayHref,
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

const DAY7 = "day-7-refine-and-steal-show" as const;

export const DAY7_CONCEPTS: DayConceptDrillDown[] = [
  {
    id: "peak-end-rule-d7",
    label: "Peak-end rule",
    summary: "People remember the last calm confident minute — polish closing before you polish middle policy.",
    sections: [
      {
        title: "Press memory",
        body: "Editors pull from opening calm and closing quotable. Middle answers blur — bookends define coverage.",
      },
      {
        title: "Silence is a line",
        body: "Hold two seconds after the last word. Rushed endings read as uncertainty on broadcast.",
      },
    ],
    practiceSteps: [
      "Read peak-end framing once.",
      "Time closing — add deliberate pause before last word.",
      "Log whether ending felt agree-only — fix with clerk invoke.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayBlockHref(DAY7, "b7-open-close"), label: "Opening + closing polish block" },
      { href: epDebatePrepDayRehearsalHref(DAY7, "rehearse-bookends-three-reps"), label: "3 reps rehearsal" },
    ],
  },
  {
    id: "quotable-without-gimmick-d7",
    label: "Quotable without gimmick",
    summary: "Steal the show with calm competence + one clerk-centered line — not volume or smear.",
    sections: [
      {
        title: "Newspaper test",
        body: "Would a Carroll County editor print this line without fact-check panic? Clerk invoke + administrator promise passes.",
      },
      {
        title: "Hammer may perform",
        body: "Contrast reads as command when you slow down — do not match volume.",
      },
    ],
    practiceSteps: [
      "Draft three candidate lines — claims-green only.",
      "Staff picks one for stage.",
      "Rehearse with one breath pause before delivery.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayExampleHref(DAY7, "ex7-show-steal"), label: "Show-steal example" },
      { href: epDebatePrepDayRehearsalHref(DAY7, "rehearse-quotable-line"), label: "Quotable line rehearsal" },
    ],
  },
  {
    id: "claims-final-cut-d7",
    label: "Claims final cut",
    summary: "Red-line review — nothing new after today. BLOCKED debate-command lines stay off the script.",
    sections: [
      {
        title: "Cut don't add",
        body: "Day 7 fixes what exists. If a line is not claims-green, it does not reach the stage — silence beats unverified stats.",
      },
    ],
    practiceSteps: [
      "Open claims final block.",
      "Cut every BLOCKED line from stage script.",
      "Confirm no new opponent quotes invented today.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayBlockHref(DAY7, "b7-claims-final"), label: "Final claims scan block" },
      { href: epDebatePrepDayBlockHref("day-3-superiority-map", "b3-claims"), label: "Day 3 claims gate reference" },
    ],
  },
  {
    id: "acca-three-way-geometry-d7",
    label: "ACCA three-way geometry",
    summary: "Eureka Springs matches ACCA panel dynamics — pile-on survival with calm contrast.",
    sections: [
      {
        title: "Same geometry",
        body: "Kelly is not debating Hammer alone. Pakko occupies the middle — bridge to clerks when trust questions pile on.",
      },
    ],
    practiceSteps: [
      "Read three-way refresh once.",
      "One pile-on pivot cold — 30s.",
      "Claims final scan after psych refresh.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayBlockHref(DAY7, "b7-psych-three"), label: "Three-way psychology block" },
      { href: epDebatePrepLaneHref("lane-d7-acca-psych"), label: "ACCA psych lane" },
    ],
  },
  {
    id: "steal-the-show-d7",
    label: "Steal the show",
    summary: "One memorable line — earned, verified, clerk-rooted — defines tomorrow's newspaper moment.",
    sections: [
      {
        title: "Command not performance",
        body: "The show is stolen by competence voters can quote — not by shouting over Hammer.",
      },
    ],
    practiceSteps: [
      "Read steal-the-show micro-lesson.",
      "Pick quotable line with staff.",
      "Evening check: line cleared?",
    ],
    relatedLinks: [
      { href: epDebatePrepDayMicroLessonHref(DAY7, "d7-steal"), label: "Steal the show micro-lesson" },
      { href: epDebatePrepDayConceptHref(DAY7, "quotable-without-gimmick-d7"), label: "Quotable concept" },
    ],
  },
  {
    id: "success-check-d7",
    label: "Success check",
    summary: "Opening/closing memorized; one quotable line staff cleared; claims final scan complete.",
    sections: [
      {
        title: "Debate eve gate",
        body: "If bookends are not boring yet, one more rep beats one more research rabbit hole.",
      },
    ],
    practiceSteps: [
      "Answer evening review questions honestly.",
      "Queue Day 8 protocol — no new material overnight.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayHref(DAY7), label: "Day 7 pathway overview" },
      { href: epDebatePrepDayBlockHref(DAY7, "b7-open-close"), label: "Bookends block" },
    ],
  },
];

export const DAY7_REHEARSAL: DayRehearsalDrillDown[] = [
  {
    id: "rehearse-bookends-three-reps",
    label: "Opening + closing · 3 reps each",
    durationLabel: "~25 minutes",
    script:
      "Rep 1 cold: Day 1 opening 90s (administrator frame, no opponent names) + Day 7 closing template (clerk invoke, 60s). Rep 2: weave one fix from Day 6 debrief into closing beat 2. Rep 3: picture APA broadcast + local paper — peak-end pause before last word.",
    presenceNotes: [
      "Eyes to moderator first on opening.",
      "Closing: hold silence 2 seconds after last word.",
      "Claims-green only — no new stats.",
    ],
    successCheck: [
      "Three reps logged for opening.",
      "Three reps logged for closing.",
      "Both bookends under time on timer.",
    ],
    relatedLinks: [
      { href: EP_DEBATE_PREP_REHEARSAL_HREF, label: "Rehearsal hub" },
      { href: epDebatePrepDayRehearsalHref("day-1-command-foundation", "rehearse-opening-90s"), label: "Day 1 · 90s opening" },
      { href: epDebatePrepDayBlockHref(DAY7, "b7-open-close"), label: "Bookends polish block" },
    ],
  },
  {
    id: "rehearse-quotable-line",
    label: "Quotable line · one breath pause",
    durationLabel: "~10 minutes",
    script:
      "Deliver staff-cleared quotable line three times. Each rep: one breath pause before the line, clerk-centered contrast, no smear. Picture the newspaper printing it tomorrow.",
    presenceNotes: [
      "Calm volume — contrast reads as command.",
      "Line must pass claims gate.",
    ],
    successCheck: [
      "Line feels boring not performative.",
      "Staff confirms claims-green.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayExampleHref(DAY7, "ex7-show-steal"), label: "Show-steal example" },
      { href: epDebatePrepDayConceptHref(DAY7, "quotable-without-gimmick-d7"), label: "Quotable concept" },
    ],
  },
];

export function buildDay7Examples(): DayExampleDrillDown[] {
  const plan = getDebateWeekIntensiveDay(DAY7)!;
  return plan.opponentExamples.map((ex) => ({
    id: ex.id,
    opponent: ex.opponent,
    theirMove: ex.theirMove,
    kellyResponse: ex.kellyResponse,
    whyItWorks: ex.whyItWorks,
    sourceNote: ex.sourceNote,
    sections: [
      { title: "Their move", body: ex.theirMove },
      { title: "Kelly response", body: ex.kellyResponse },
      { title: "Why it works", body: ex.whyItWorks },
    ],
    alternateLines: [
      "Clerks don't need another author in the Capitol — they need a Secretary of State who shows up.",
    ],
    practiceSteps: [
      "Staff reads Hammer closing line.",
      "Kelly delivers contrast — clerk invoke, no smear.",
      "Check claims gate before using on stage.",
    ],
    relatedLinks: [
      { href: epOpponentBioHref("kim-hammer"), label: "Kim Hammer bio" },
      { href: epDebatePrepDayBlockHref(DAY7, "b7-open-close"), label: "Bookends polish block" },
      { href: epDebatePrepDayRehearsalHref(DAY7, "rehearse-quotable-line"), label: "Quotable line rehearsal" },
    ],
  }));
}

export function buildDay7Blocks(): DayBlockDrillDown[] {
  const plan = getDebateWeekIntensiveDay(DAY7)!;
  return plan.blocks.map((block) => {
    const theory = getBlockTheoryExpansion(DAY7, block.id);
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
    if (block.id === "b7-open-close") {
      relatedLinks.push(
        { href: epDebatePrepDayRehearsalHref(DAY7, "rehearse-bookends-three-reps"), label: "3 reps bookends rehearsal" },
        { href: epDebatePrepDayRehearsalHref("day-1-command-foundation", "rehearse-opening-90s"), label: "Day 1 · 90s opening" },
        { href: epDebatePrepDayBlockHref("day-6-full-simulation", "b6-sim"), label: "Day 6 sim debrief source" },
      );
    }
    if (block.id === "b7-claims-final") {
      relatedLinks.push(
        { href: epDebatePrepDayConceptHref(DAY7, "claims-final-cut-d7"), label: "Claims final cut concept" },
        { href: epDebatePrepDayBlockHref("day-3-superiority-map", "b3-claims"), label: "Day 3 claims gate" },
      );
    }
    if (block.id === "b7-psych-three") {
      relatedLinks.push(
        { href: epDebatePrepLaneHref("lane-d7-acca-psych"), label: "ACCA three-way psych lane" },
        { href: epDebatePrepDayConceptHref(DAY7, "acca-three-way-geometry-d7"), label: "Three-way geometry concept" },
      );
    }
    if (block.id === "b7-tutor-final") {
      relatedLinks.push(
        { href: epDebatePrepDayBlockHref(DAY7, "b7-open-close"), label: "Return to bookends if tired" },
        { href: epDebatePrepDayConceptHref(DAY7, "success-check-d7"), label: "Success check" },
      );
    }
    if (theory?.stretchLaneId) {
      relatedLinks.push({ href: epDebatePrepLaneHref(theory.stretchLaneId), label: "Linked drill-down lane" });
    }

    const practiceSteps: string[] = [];
    if (block.id === "b7-open-close") {
      practiceSteps.push(
        "Import Day 6 top-3 fixes into closing beat.",
        "Polish opening 90s + closing 60s — claims-green only.",
        "Three reps each — log completion.",
      );
    } else if (block.id === "b7-claims-final") {
      practiceSteps.push(
        "Scan stage script for BLOCKED lines.",
        "Cut unverified stats — do not add new ones.",
        "Staff sign-off on final script.",
      );
    } else if (block.id === "b7-psych-three") {
      practiceSteps.push(
        "Refresh ACCA three-way geometry.",
        "One pile-on pivot cold.",
        "Slow down when Hammer performs for crowd.",
      );
    } else if (block.id === "b7-tutor-final") {
      practiceSteps.push(
        "Pick one weakness from Day 6 debrief.",
        "One drill only — not new content.",
        "Optional stretch — bookends minimum stands.",
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

export function buildDay7MicroLessons(): DayMicroLessonDrillDown[] {
  const overlay = getDayDeepOverlay(DAY7);
  return overlay.microLessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    readMinutes: lesson.readMinutes,
    body: lesson.body,
    practiceSteps: [
      "Read steal-the-show framing once.",
      "Name one line you want the paper to print.",
      "Commit: gimmick-free contrast tonight.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayConceptHref(DAY7, "steal-the-show-d7"), label: "Steal the show concept" },
      { href: epDebatePrepDayBlockHref(DAY7, "b7-open-close"), label: "Bookends polish block" },
    ],
  }));
}

export function buildDay7Drills(): DayCommandDrillDown[] {
  const overlay = getDayDeepOverlay(DAY7);
  return overlay.commandDrills.map((drill) => ({
    id: drill.id,
    ifTheySay: drill.ifTheySay,
    youSay: drill.youSay,
    thenScan: drill.thenScan,
    practiceSteps: [
      "Staff cue: closing statement.",
      "Kelly delivers clerk invoke line.",
      "Hold silence 2 seconds — then scan.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayRehearsalHref(DAY7, "rehearse-bookends-three-reps"), label: "Bookends rehearsal" },
      { href: epDebatePrepDayBlockHref(DAY7, "b7-open-close"), label: "Bookends polish block" },
    ],
  }));
}
