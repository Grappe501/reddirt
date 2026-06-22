/**
 * Debate Week Intensive v2 — deep overlays per day (Command drills, micro-lessons, reflections).
 */
import type { IntensiveDayId } from "@/lib/intelligence/v4/debateWeekIntensive2026";

export type CommandDrill = {
  id: string;
  ifTheySay: string;
  youSay: string;
  thenScan: string;
  claimsNote?: string;
};

export type MicroLesson = {
  id: string;
  title: string;
  body: string;
  readMinutes: number;
};

export type DayDeepOverlay = {
  dayId: IntensiveDayId;
  kellyStrengthToday: string;
  kellyWatchOut: string;
  eveningReview: string[];
  reflectionPrompts: string[];
  commandDrills: CommandDrill[];
  microLessons: MicroLesson[];
  forumIntelHook?: string;
};

export const DEBATE_INTENSIVE_V2_LABEL = "Command Mode v2 · deep layer";

export const DEBATE_WEEK_DEEP_OVERLAYS: Record<IntensiveDayId, DayDeepOverlay> = {
  "day-1-command-foundation": {
    dayId: "day-1-command-foundation",
    kellyStrengthToday: "Authenticity — the room has not heard a candidate who sounds like a working administrator.",
    kellyWatchOut: "Over-explaining before you feel grounded. Short answers beat long ones on Day 1.",
    eveningReview: [
      "Did I finish breathing protocol twice without rushing?",
      "Can I say author vs administrator in one breath?",
      "What one fear did I name honestly in the journal?",
    ],
    reflectionPrompts: [
      "What scares me most about the stage — and is it about policy or about being judged?",
      "When have I held calm under pressure before (farm, nonprofit, clerk rooms)?",
      "What does Command Mode feel like in my body when it is working?",
    ],
    commandDrills: [
      {
        id: "d1-calm-open",
        ifTheySay: "Moderator asks for opening statement.",
        youSay:
          "Clerks run elections in Arkansas. I am running to be the administrator who serves them — every county, every day.",
        thenScan: "Pause 2 seconds. Eyes to moderator, then sweep room left-to-right once.",
      },
      {
        id: "d1-agree-add",
        ifTheySay: "We all want secure elections.",
        youSay:
          "Absolutely — and clerks need funding and answers, not just slogans. That is the job I am asking for.",
        thenScan: "Never end on agree alone — always add clerk layer.",
      },
    ],
    microLessons: [
      {
        id: "d1-asp-protocol",
        title: "Command posture protocol (4 steps)",
        readMinutes: 8,
        body:
          "1) Feet shoulder-width, weight even. 2) Exhale before mic opens. 3) First sentence under 12 words if possible. 4) Hands still until gesture carries meaning. Seasoned politicians train body first — you are training tonight.",
      },
      {
        id: "d1-innocence",
        title: "Innocence is not weakness",
        readMinutes: 6,
        body:
          "Voters distrust performative politicians. Kelly has never debated — that reads as honest if your body is steady. Do not apologize for being new; anchor on competence you already have.",
      },
    ],
  },
  "day-2-read-the-table": {
    dayId: "day-2-read-the-table",
    kellyStrengthToday: "Observational intelligence — you notice patterns Hammer repeats.",
    kellyWatchOut: "Getting drawn into bill-number tennis before you pivot to clerks.",
    eveningReview: [
      "Three Hammer tells named?",
      "One Pakko pivot rehearsed aloud?",
      "Trap lane 1 under 90 seconds?",
    ],
    reflectionPrompts: [
      "What does Hammer do with his voice when he feels challenged?",
      "Where does Pakko look when Hammer talks?",
      "What bait line made me want to react instead of respond?",
    ],
    commandDrills: [
      {
        id: "d2-authorship-pivot",
        ifTheySay: "I wrote the election integrity bills.",
        youSay:
          "Writing law and running the office clerks depend on are different jobs. I am asking for the administrator job.",
        thenScan: "Hammer jaw — if he accelerates, slow down.",
        claimsNote: "No specific act numbers unless claims-verified.",
      },
      {
        id: "d2-ranking-pivot",
        ifTheySay: "Arkansas ranks high on election integrity.",
        youSay:
          "Clerks in your county know whether the SOS office answered the phone last week. That is the ranking I care about.",
        thenScan: "Pivot to local, always.",
      },
    ],
    microLessons: [
      {
        id: "d2-watch-hammer",
        title: "Hammer tell list (forum transcript)",
        readMinutes: 12,
        body:
          "Listen for: integrity ranking · act authorship · mandate language · 2020 framing. Each is a pivot point to clerks and implementation — not a fight about motives.",
      },
      {
        id: "d2-three-way",
        title: "Three-way geometry",
        readMinutes: 10,
        body:
          "Kelly center: engage Hammer on job fit, acknowledge Pakko briefly, never fight two fronts. When both opponents talk, stillness reads as command.",
      },
    ],
  },
  "day-3-superiority-map": {
    dayId: "day-3-superiority-map",
    kellyStrengthToday: "Stacked qualifications — organization history beats bill lists.",
    kellyWatchOut: "Listing too many jobs — pick three and repeat them.",
    eveningReview: ["Three superiority points verified in claims?", "Offense move felt natural?", "Any stat red-lined?"],
    reflectionPrompts: [
      "Which Kelly job story makes clerks nod?",
      "What qualification do I undersell because it feels normal to me?",
      "How do I say superiority without sounding arrogant?",
    ],
    commandDrills: [
      {
        id: "d3-qual-stack",
        ifTheySay: "What qualifies you for SOS?",
        youSay:
          "I have managed organizations, budgets, and people under deadline — and I have organized statewide with clerks in the room, not just legislators in the Capitol.",
        thenScan: "Stop at three beats. Smile. Wait.",
      },
    ],
    microLessons: [
      {
        id: "d3-overwhelm",
        title: "Overwhelm with competence, not volume",
        readMinutes: 10,
        body:
          "Hammer overwhelms with bill numbers. Kelly overwhelms with operational stories: who you served, what broke, how you fixed it. Slower + specific beats fast + abstract.",
      },
    ],
  },
  "day-4-forum-intelligence": {
    dayId: "day-4-forum-intelligence",
    kellyStrengthToday: "Learning from real transcript — concrete beats abstract fear.",
    kellyWatchOut: "Trying to memorize every line from the forum — extract patterns only.",
    eveningReview: [
      "Forum uploaded or transcript pasted?",
      "Deep analysis run?",
      "Five capitalize moves copied to notecard?",
    ],
    reflectionPrompts: [
      "What did Hammer say verbatim that surprised me?",
      "What did I say that landed — even in a forum setting?",
      "Which predicted debate question scares me most?",
    ],
    commandDrills: [],
    microLessons: [
      {
        id: "d4-lab-workflow",
        title: "Forum lab workflow",
        readMinutes: 5,
        body:
          "Staff ingested ACCA forum transcript → Run analysis → Run deep analysis v2 → export capitalize moves to Day 5 drills. Kelly reads excerpts and pull quotes — staff verifies quotes in claims before stage.",
      },
    ],
    forumIntelHook: "Forum transcript and deep analysis are ready in the lab — Kelly reads excerpts and predicted lines for Days 4–5.",
  },
  "day-5-anticipate-and-capitalize": {
    dayId: "day-5-anticipate-and-capitalize",
    kellyStrengthToday: "Pre-loaded responses — Command Mode is preparation, not improvisation.",
    kellyWatchOut: "Using forum quotes that are not claims-verified.",
    eveningReview: [
      "Eight when-X-say-Y pairs rehearsed?",
      "Forum-derived drills timed?",
      "Pile-on pivot cold?",
    ],
    reflectionPrompts: [
      "Which Hammer line from the forum will he repeat at debate?",
      "What is my best capitalize moment from deep analysis?",
      "Where am I still agreeing without adding?",
    ],
    commandDrills: [],
    microLessons: [
      {
        id: "d5-capitalize",
        title: "Capitalize vs counter",
        readMinutes: 8,
        body:
          "Countering puts you in Hammer's frame. Capitalizing names what clerks need next. Always move from their line to your lane in one sentence.",
      },
    ],
    forumIntelHook: "Use deep analysis mock moderator block for timed rehearsal tonight.",
  },
  "day-6-full-simulation": {
    dayId: "day-6-full-simulation",
    kellyStrengthToday: "Integrated rehearsal — you have done the work.",
    kellyWatchOut: "New material today — simulation only fixes what exists.",
    eveningReview: ["Simulation complete?", "Top 3 fixes logged?", "Readiness ≥70%?"],
    reflectionPrompts: [
      "Where did I agree-only close?",
      "When did Command Mode feel natural?",
      "What one fix matters most for Day 7?",
    ],
    commandDrills: [
      {
        id: "d6-stuck-bridge",
        ifTheySay: "Unexpected question or double-team.",
        youSay: "Let me answer the clerk part first — because that is what this office is for.",
        thenScan: "Bridge, then answer. Honest pause OK.",
      },
    ],
    microLessons: [
      {
        id: "d6-stress",
        title: "Stress inoculation",
        readMinutes: 6,
        body: "Today's simulation is supposed to feel hard. Fail in the room with staff, not on stage in Eureka Springs.",
      },
    ],
  },
  "day-7-refine-and-steal-show": {
    dayId: "day-7-refine-and-steal-show",
    kellyStrengthToday: "Peak-end rule — your closing is what papers remember.",
    kellyWatchOut: "Adding new stats or attacks — cut, do not add.",
    eveningReview: ["Opening/closing memorized?", "One quotable line cleared?", "Claims final scan?"],
    reflectionPrompts: [
      "What is the one line I want the newspaper to print?",
      "How do I want to feel walking off stage?",
      "Who in the room am I speaking to — clerks or Capitol?",
    ],
    commandDrills: [
      {
        id: "d7-close",
        ifTheySay: "Closing statement.",
        youSay:
          "Clerks deserve a Secretary of State who shows up. I will be that administrator — for every county in Arkansas.",
        thenScan: "Hold silence 2 seconds after last word.",
      },
    ],
    microLessons: [
      {
        id: "d7-steal",
        title: "Steal the show without gimmick",
        readMinutes: 8,
        body:
          "The show is stolen by calm competence + one quotable clerk-centered line — not by shouting or over-talking. Hammer may perform; Kelly commands.",
      },
    ],
  },
  "day-8-command-mode-debate": {
    dayId: "day-8-command-mode-debate",
    kellyStrengthToday: "Execution — trust the protocol.",
    kellyWatchOut: "Last-minute research or new attacks.",
    eveningReview: ["Debrief logged?", "Press/LTE path queued?", "Rest scheduled?"],
    reflectionPrompts: ["What am I proud of regardless of outcome?", "What did Command Mode teach me?"],
    commandDrills: [
      {
        id: "d8-breath",
        ifTheySay: "Anything — first mic moment.",
        youSay: "(Silent 4-4-6 breath first.)",
        thenScan: "Protocol before words.",
      },
    ],
    microLessons: [
      {
        id: "d8-mindset",
        title: "Debate day mindset",
        readMinutes: 5,
        body:
          "You are not proving you belong — you belong. The work was the seven days. Today: scan, breathe, respond. Innocence + preparation is the combination they have not seen.",
      },
    ],
  },
};

export function getDayDeepOverlay(dayId: IntensiveDayId): DayDeepOverlay {
  return DEBATE_WEEK_DEEP_OVERLAYS[dayId];
}

export function mergeForumDrillsIntoDay5(
  capitalizeMoves: Array<{ trigger: string; kellyLine: string; why: string }>,
): CommandDrill[] {
  return capitalizeMoves.slice(0, 12).map((m, i) => ({
    id: `forum-${i}`,
    ifTheySay: m.trigger,
    youSay: m.kellyLine,
    thenScan: m.why,
    claimsNote: "Verify in claims gate before stage.",
  }));
}
