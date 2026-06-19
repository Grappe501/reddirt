/**
 * Client-safe debate prep tutor exports — static modes and coaching framework only.
 * File-backed sequence steps live in debatePrepTutorPackage.ts (server).
 */

export const DEBATE_PREP_TUTOR_HUB_HREF = "/admin/intelligence/debate-prep-tutor";

export type DebatePrepTutorMode =
  | "panic-5"
  | "tonight-15"
  | "deep-30"
  | "check-my-record"
  | "three-way-panel";

export type TutorModeConfig = {
  mode: DebatePrepTutorMode;
  label: string;
  minutes: number;
  headline: string;
  coachOpening: string;
  cardCap: number;
  queueId: "standard-tonight" | "sos-speak-order" | "trap-pivot" | "forum-acca-tonight";
  sequenceId: string | null;
  politicalFocus: string[];
};

/** Core political debate coaching principles — adapted for SOS three-way panel. */
export const POLITICAL_DEBATE_COACH_FRAMEWORK = {
  headline: "Political debate coach — SOS three-way panel rules",
  principles: [
    {
      id: "agree-fresh-add",
      title: "Agree + fresh add (never agree-only close)",
      rule: "In political forums, agreeing sounds reasonable — but voters forget you if you stop there. Every agreement needs one new fact, county example, or SOS pledge.",
    },
    {
      id: "three-way-position",
      title: "Three-way speak order",
      rule: "Kelly often speaks second or third. Open with one verified line, add one contrast Hammer cannot match, close with unity spine (clerks, transparency, non-partisan service).",
    },
    {
      id: "trap-chess",
      title: "Trap lanes are chess, not boxing",
      rule: "Let Hammer bite the setup. Your pivot is pre-written — do not improvise under adrenaline. One bridge sentence, then stop.",
    },
    {
      id: "record-gift",
      title: "Check My Record is a gift",
      rule: "When an incumbent invites record comparison, slow down and welcome it. Author vs administrator — you already did the homework.",
    },
    {
      id: "time-discipline",
      title: "Time is the moderator's weapon",
      rule: "30-second answers need one act + one harm + one pledge. 60-second adds one county frame. 90-second is max one trap question — never three acts in one breath.",
    },
    {
      id: "composure-contrast",
      title: "Composure is contrast",
      rule: "When opponents escalate volume, drop yours 20%. The camera reads preparation as authority — especially for a first-time statewide candidate.",
    },
  ],
  panicScript:
    "You have minutes, not hours. The coach will give you ONE card, ONE safe line, ONE do-not-say. Breathe once. Say the line twice out loud. Walk on stage.",
} as const;

export const TUTOR_MODE_CONFIGS: Record<DebatePrepTutorMode, TutorModeConfig> = {
  "panic-5": {
    mode: "panic-5",
    label: "5 min — panic reset",
    minutes: 5,
    headline: "Stop browsing. One card. One line. Go.",
    coachOpening:
      "Kelly — you are out of time and that is normal. We are not opening twenty pages. I will give you the highest-probability trap or SOS card, your safe opening line, and what not to say. Say it twice. Then stage.",
    cardCap: 1,
    queueId: "trap-pivot",
    sequenceId: null,
    politicalFocus: ["trap-chess", "composure-contrast", "time-discipline"],
  },
  "tonight-15": {
    mode: "tonight-15",
    label: "15 min — pre-stage (recommended)",
    minutes: 15,
    headline: "Pre-stage pass — traps, speak-order, rebuttal skeleton",
    coachOpening:
      "Fifteen minutes is enough if we stay sequential. First: blocked lines. Second: trap warnings. Third: timed answer skeleton. Fourth: one rebuttal block. No browsing the full bank mid-drill.",
    cardCap: 3,
    queueId: "standard-tonight",
    sequenceId: "kelly-pre-stage",
    politicalFocus: ["agree-fresh-add", "trap-chess", "three-way-position"],
  },
  "deep-30": {
    mode: "deep-30",
    label: "30 min — full rehearsal",
    minutes: 30,
    headline: "Full queue + practice answers with coach critique",
    coachOpening:
      "Thirty minutes means we run the standard tonight queue — trap pivots alternating with SOS speak-order. After each card you can practice your answer and I will critique for agree-only closes, unsourced numbers, and stage-safe gates.",
    cardCap: 6,
    queueId: "standard-tonight",
    sequenceId: "kelly-pre-stage",
    politicalFocus: ["agree-fresh-add", "trap-chess", "record-gift", "three-way-position", "time-discipline"],
  },
  "check-my-record": {
    mode: "check-my-record",
    label: "Check My Record drill",
    minutes: 12,
    headline: "Six-beat walkthrough — Hammer's favorite retreat",
    coachOpening:
      "When he says check my record, smile inside. This is a gift. We walk six beats: welcome, verified acts, wrong job, clerk harm, one trap question, administer fairly. Slow down — half-beat after each act number.",
    cardCap: 2,
    queueId: "trap-pivot",
    sequenceId: null,
    politicalFocus: ["record-gift", "time-discipline", "composure-contrast"],
  },
  "three-way-panel": {
    mode: "three-way-panel",
    label: "Three-way panel",
    minutes: 18,
    headline: "Hammer + Packo dynamics — position 2/3 closes",
    coachOpening:
      "Three-way panels punish pile-ons and reward the calm third voice. We rehearse SOS speak-order with Packo add-ons and Hammer bait — agree with Packo where fair, never join a smear, bridge to county service.",
    cardCap: 4,
    queueId: "forum-acca-tonight",
    sequenceId: "three-way-contrast",
    politicalFocus: ["three-way-position", "agree-fresh-add", "composure-contrast"],
  },
};

export function getTutorModeConfig(mode: DebatePrepTutorMode): TutorModeConfig {
  return TUTOR_MODE_CONFIGS[mode];
}

export function listTutorModes(): TutorModeConfig[] {
  return Object.values(TUTOR_MODE_CONFIGS);
}
