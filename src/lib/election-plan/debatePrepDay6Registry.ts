/**
 * Day 6 drill-down registry content (full simulation).
 */
import {
  EP_DEBATE_PREP_REHEARSAL_HREF,
  EP_DEBATE_QUESTIONS_HREF,
  EP_OPPONENT_BIOS_HREF,
  EP_TRAP_LANES_HREF,
  epDebatePrepDayBlockHref,
  epDebatePrepDayConceptHref,
  epDebatePrepDayDrillHref,
  epDebatePrepDayMicroLessonHref,
  epDebatePrepDayRehearsalHref,
  epOpponentBioHref,
} from "@/lib/election-plan/debate-prep-links";
import { epDebatePrepLaneHref } from "@/lib/election-plan/debate-prep-route-map";
import type {
  DayBlockDrillDown,
  DayCommandDrillDown,
  DayConceptDrillDown,
  DayMicroLessonDrillDown,
  DayRehearsalDrillDown,
} from "@/lib/election-plan/debatePrepDayDrillDown";
import { getBlockTheoryExpansion } from "@/lib/intelligence/v4/debateWeekIntensive2026V3";
import { getDayDeepOverlay } from "@/lib/intelligence/v4/debateWeekIntensive2026Deep";
import { getDebateWeekIntensiveDay } from "@/lib/intelligence/v4/debateWeekIntensive2026";

const DAY6 = "day-6-full-simulation" as const;

export const DAY6_CONCEPTS: DayConceptDrillDown[] = [
  {
    id: "stress-inoculation-d6",
    label: "Stress inoculation",
    summary: "Today's simulation is supposed to feel hard — fail in the room with staff, not on the APA statewide broadcast.",
    sections: [
      {
        title: "Safe room, worst case",
        body:
          "Stress inoculation means running the hardest version of the debate with people you trust. Anxiety during simulation is the point — it teaches Command Mode under fatigue.",
      },
      {
        title: "No new material",
        body: "Day 6 fixes what exists. Do not add fresh stats, opponent quotes, or policy research during the sim — only rehearse claims-green lines from Days 1–5.",
      },
    ],
    practiceSteps: [
      "Read stress inoculation micro-lesson once.",
      "Name one fear aloud to staff before sim starts.",
      "Commit: simulation only — no new research tonight.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayMicroLessonHref(DAY6, "d6-stress"), label: "Stress inoculation micro-lesson" },
      { href: epDebatePrepDayBlockHref(DAY6, "b6-sim"), label: "Full simulation block" },
    ],
  },
  {
    id: "integrated-rehearsal-d6",
    label: "Integrated rehearsal",
    summary: "Opening → three trap lanes → five SOS questions → closing — staff plays Hammer and Pakko.",
    sections: [
      {
        title: "Three-way geometry",
        body:
          "Kelly is not debating Hammer alone. Pakko occupies the middle lane — pile-on and trust questions may come from both. Staff rotates roles at moderator pace.",
      },
      {
        title: "Debrief discipline",
        body: "After 60 minutes, log top three fixes only. Do not rewrite the whole script tonight — Day 7 polishes bookends.",
      },
    ],
    practiceSteps: [
      "Confirm staff roles: moderator, Hammer, Pakko.",
      "Run 60-min sim — timed segments.",
      "30-min debrief — top 3 fixes logged.",
    ],
    relatedLinks: [
      { href: epDebatePrepLaneHref("lane-d6-full-sim"), label: "Full three-way simulation lane" },
      { href: epDebatePrepDayRehearsalHref(DAY6, "rehearse-open-close-sim"), label: "Opening + closing rehearsal" },
      { href: epDebatePrepDayBlockHref(DAY6, "b6-sim"), label: "Full simulation block" },
    ],
  },
  {
    id: "opening-closing-bookends-d6",
    label: "Opening & closing bookends",
    summary: "90s opening from Day 1 + 60s closing template — both rehearsed inside the sim frame for APA broadcast audience.",
    sections: [
      {
        title: "Opening administrator frame",
        body:
          "Day 1 owns the first draft — no opponent names, clerk partnership, business proof. Day 3 qualification stack adds three beats under time pressure.",
      },
      {
        title: "Closing peak-end",
        body:
          "Papers remember the last calm minute. Closing invokes clerks — administrator promise, one breath pause before the last word.",
      },
    ],
    practiceSteps: [
      "Open Day 1 rehearse-opening-90s script — speak once cold.",
      "Pull Day 7 closing template — clerk invoke line only.",
      "Run both inside sim frame before trap lanes.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayRehearsalHref(DAY6, "rehearse-open-close-sim"), label: "Open + close sim rehearsal" },
      { href: epDebatePrepDayRehearsalHref("day-1-command-foundation", "rehearse-opening-90s"), label: "Day 1 · 90s opening" },
    ],
  },
  {
    id: "apa-sim-audience-d6",
    label: "APA statewide broadcast audience",
    summary: "Picture press row + clerks grading competence — calm, specific, quotable without gimmick.",
    sections: [
      {
        title: "Whole state watching",
        body:
          "Arkansas Press Association broadcast reaches beyond Eureka Springs. Tone is clerk-centered; voters and press belong in your delivery, not Capitol combat.",
      },
    ],
    practiceSteps: [
      "Before sim: picture APA broadcast + local Carroll paper.",
      "Every answer ends on clerks or administrator competence.",
      "No gimmick lines — calm specificity wins.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayConceptHref("day-5-anticipate-and-capitalize", "when-x-say-y-d5"), label: "Day 5 when-X-say-Y" },
      { href: epDebatePrepDayBlockHref(DAY6, "b6-sim"), label: "Full simulation block" },
    ],
  },
  {
    id: "goal-for-kelly-d6",
    label: "Goal for Kelly",
    summary:
      "Run full simulation: opening, three trap lanes, five SOS questions, closing — staff plays Hammer and Pakko.",
    sections: [
      {
        title: "Execute under fatigue",
        body:
          "Command Mode is muscle memory, not inspiration. Days 2–5 built the pieces — Day 6 integrates them when you are tired.",
      },
    ],
    practiceSteps: [
      "Complete opponent bios lock-in before sim.",
      "Use Day 5 when-X-say-Y sheet live at least three times.",
      "Log agree-only close moments in debrief.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayBlockHref(DAY6, "b6-opponent-bios-lock"), label: "Opponent bios lock-in" },
      { href: epDebatePrepDayBlockHref(DAY6, "b6-sim"), label: "Full simulation block" },
    ],
  },
  {
    id: "success-check-d6",
    label: "Success check",
    summary: "Simulation complete; debate command readiness ≥70% all dimensions.",
    sections: [
      {
        title: "Evening gate",
        body:
          "Simulation complete? Top 3 fixes logged? Readiness ≥70%? If tired — minimum is b6-sim only; bios lock-in and debrief roll to Wednesday AM.",
      },
    ],
    practiceSteps: [
      "Answer evening review questions aloud.",
      "Mark minimum complete if full sim block done.",
      "Preview Day 7 refine pathway.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayBlockHref(DAY6, "b6-command"), label: "Readiness audit block" },
      { href: epDebatePrepDayRehearsalHref(DAY6, "rehearse-open-close-sim"), label: "Open + close rehearsal" },
    ],
  },
];

export const DAY6_REHEARSAL: DayRehearsalDrillDown[] = [
  {
    id: "rehearse-open-close-sim",
    label: "Opening 90s + closing 60s inside sim frame",
    durationLabel: "~20 minutes",
    script:
      "Inside the simulation frame: deliver Day 1 opening (90s, no opponent names, clerk partnership). Staff runs one trap lane cold. Kelly uses Day 5 when-X-say-Y pair. Close with Day 7 clerk-invoke template (60s) — one breath pause before last word.",
    presenceNotes: [
      "Picture APA statewide broadcast + local Carroll paper.",
      "Opening: eyes to moderator first, then slow room sweep.",
      "Closing: hold silence 2 seconds after last word.",
      "Claims-green only — no new stats under timer.",
    ],
    successCheck: [
      "Opening under 90s on timer.",
      "Closing under 60s on timer.",
      "Both bookends end on clerk service.",
    ],
    relatedLinks: [
      { href: EP_DEBATE_PREP_REHEARSAL_HREF, label: "Debate prep rehearsal hub" },
      { href: epDebatePrepDayRehearsalHref("day-1-command-foundation", "rehearse-opening-90s"), label: "Day 1 · 90s opening" },
      { href: epDebatePrepDayBlockHref(DAY6, "b6-sim"), label: "Full simulation block" },
    ],
  },
];

export function buildDay6Blocks(): DayBlockDrillDown[] {
  const plan = getDebateWeekIntensiveDay(DAY6)!;
  return plan.blocks.map((block) => {
    const theory = getBlockTheoryExpansion(DAY6, block.id);
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
    if (block.id === "b6-opponent-bios-lock") {
      relatedLinks.push(
        { href: EP_OPPONENT_BIOS_HREF, label: "Opponent bios hub" },
        { href: epOpponentBioHref("kim-hammer"), label: "Kim Hammer bio" },
        { href: epOpponentBioHref("heath-pakko"), label: "Heath Pakko bio" },
      );
    }
    if (block.id === "b6-sim") {
      relatedLinks.push(
        { href: epDebatePrepLaneHref("lane-d6-full-sim"), label: "Full three-way simulation lane" },
        { href: epDebatePrepDayRehearsalHref(DAY6, "rehearse-open-close-sim"), label: "Opening + closing rehearsal" },
      );
    }
    if (block.id === "b6-prep") {
      relatedLinks.push(
        { href: EP_TRAP_LANES_HREF, label: "Trap lanes hub" },
        { href: EP_DEBATE_QUESTIONS_HREF, label: "SOS debate questions hub" },
        { href: epDebatePrepDayBlockHref("day-5-anticipate-and-capitalize", "b5-lab-review"), label: "Day 5 capitalize sheet" },
      );
    }
    if (block.id === "b6-command") {
      relatedLinks.push(
        { href: epDebatePrepLaneHref("lane-d6-readiness"), label: "Readiness audit lane" },
        { href: epDebatePrepDayConceptHref(DAY6, "success-check-d6"), label: "Success check" },
      );
    }
    if (block.id === "b6-depth") {
      relatedLinks.push(
        { href: epDebatePrepLaneHref("lane-d6-stuck-stretch"), label: "If-stuck bridge lane" },
        { href: epDebatePrepDayDrillHref(DAY6, "d6-stuck-bridge"), label: "Stuck bridge command drill" },
      );
    }
    if (theory?.stretchLaneId) {
      relatedLinks.push({ href: epDebatePrepLaneHref(theory.stretchLaneId), label: "Linked drill-down lane" });
    }

    const practiceSteps: string[] = [];
    if (block.id === "b6-opponent-bios-lock") {
      practiceSteps.push(
        "Third read: memory lines + command mode sections only.",
        "Speak aloud per opponent until boring.",
        "Do not start simulation without lock-in complete.",
      );
    } else if (block.id === "b6-sim") {
      practiceSteps.push(
        "Staff plays Hammer + Pakko — moderator pace.",
        "60-min sim: opening → traps → SOS → closing.",
        "30-min debrief — log top 3 fixes only.",
      );
    } else if (block.id === "b6-prep") {
      practiceSteps.push(
        "Review highest trap-density sections from Days 2–5.",
        "Pocket cards only — no new research.",
        "Note one gap for debrief — do not fix tonight.",
      );
    } else if (block.id === "b6-command") {
      practiceSteps.push(
        "Review blocked lanes from debate command scores.",
        "Cut BLOCKED lines from sim script.",
        "Target ≥70% readiness all dimensions.",
      );
    } else if (block.id === "b6-depth") {
      practiceSteps.push(
        "Memorize three if-stuck bridge phrases.",
        "Use one bridge during sim.",
        "Honest pause beats fake certainty.",
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

export function buildDay6MicroLessons(): DayMicroLessonDrillDown[] {
  const overlay = getDayDeepOverlay(DAY6);
  return overlay.microLessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    readMinutes: lesson.readMinutes,
    body: lesson.body,
    practiceSteps: [
      "Read stress inoculation framing once.",
      "Name one sim fear aloud to staff.",
      "Commit: fail in the room, not on broadcast.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayBlockHref(DAY6, "b6-sim"), label: "Full simulation block" },
      { href: epDebatePrepDayConceptHref(DAY6, "stress-inoculation-d6"), label: "Stress inoculation concept" },
    ],
  }));
}

export function buildDay6Drills(): DayCommandDrillDown[] {
  const overlay = getDayDeepOverlay(DAY6);
  return overlay.commandDrills.map((drill) => ({
    id: drill.id,
    ifTheySay: drill.ifTheySay,
    youSay: drill.youSay,
    thenScan: drill.thenScan,
    practiceSteps: [
      "Staff reads unexpected question or pile-on setup.",
      "Kelly delivers bridge line in 30s.",
      "Repeat until paraphrase feels natural.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayBlockHref(DAY6, "b6-depth"), label: "If-stuck bridges block" },
      { href: epDebatePrepLaneHref("lane-d6-stuck-stretch"), label: "If-stuck bridge lane" },
    ],
  }));
}
