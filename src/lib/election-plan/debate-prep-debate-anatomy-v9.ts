/**
 * Debate Command Course v9 — how a broadcast debate is structured (student-facing).
 */
import { epDebatePrepDayBlockHref } from "@/lib/election-plan/debate-prep-links";
import { DAY8_ID } from "@/lib/election-plan/debatePrepDayDrillDown";

export type DebateAnatomySegment = {
  id: string;
  order: number;
  label: string;
  duration: string;
  objective: string;
  prepareInModule: string;
  day8SectionHref?: string;
};

export const DEBATE_ANATOMY_OVERVIEW =
  "A Secretary of State debate is an administrator audition, not a legislative scorecard. You win by showing calm command across three jobs — elections, business services, and Capitol management — in a fixed stage order.";

export const DEBATE_ANATOMY_SEGMENTS: readonly DebateAnatomySegment[] = [
  {
    id: "walk-on",
    order: 1,
    label: "Walk-on & positioning",
    duration: "~1 min",
    objective: "Feet planted, breath set, scan moderator → opponents → camera → persona.",
    prepareInModule: "Module 1 · posture + scan",
    day8SectionHref: epDebatePrepDayBlockHref(DAY8_ID, "s8-command"),
  },
  {
    id: "opening",
    order: 2,
    label: "Opening statement",
    duration: "90 sec hard stop",
    objective: "Administrator frame → elections + business + Capitol (one breath each) → Arkansas promise.",
    prepareInModule: "Modules 1 + 3 + 8 · opening workshop",
    day8SectionHref: epDebatePrepDayBlockHref(DAY8_ID, "s8-opening-workshop"),
  },
  {
    id: "listen",
    order: 3,
    label: "Listen & opponent tells",
    duration: "Throughout",
    objective: "Listen face only — note ranking, authorship, and clerk-only traps for pivot cards.",
    prepareInModule: "Module 2 · read the table",
    day8SectionHref: epDebatePrepDayBlockHref(DAY8_ID, "s8-middle-game"),
  },
  {
    id: "traps",
    order: 4,
    label: "Trap pivots",
    duration: "60 sec each",
    objective: "When-X-say-Y — capitalize to service desk, never stay in opponent's frame.",
    prepareInModule: "Modules 2 + 5 · trap lanes",
    day8SectionHref: epDebatePrepDayBlockHref(DAY8_ID, "s8-middle-game"),
  },
  {
    id: "sos",
    order: 5,
    label: "Moderator SOS questions",
    duration: "90 sec each · 3 domains",
    objective: "One timed answer per domain with voter translation in the final 20 seconds.",
    prepareInModule: "Modules 3–5 · SOS bank",
    day8SectionHref: epDebatePrepDayBlockHref(DAY8_ID, "s8-middle-game"),
  },
  {
    id: "pile-on",
    order: 6,
    label: "Pile-on / trust attacks",
    duration: "60–90 sec",
    objective: "Bridge to statewide tone — service desk covers all three domains if needed.",
    prepareInModule: "Module 5 · pile-on pivot",
    day8SectionHref: epDebatePrepDayBlockHref(DAY8_ID, "s8-middle-game"),
  },
  {
    id: "closing",
    order: 7,
    label: "Closing statement",
    duration: "60 sec hard stop",
    objective: "Service desk invoke (three domains) → sim fix → quotable with two-second pause.",
    prepareInModule: "Modules 6–7 + 8 · closing workshop",
    day8SectionHref: epDebatePrepDayBlockHref(DAY8_ID, "s8-closing-workshop"),
  },
  {
    id: "debrief",
    order: 8,
    label: "Post-debate debrief",
    duration: "After stage",
    objective: "One fix logged for next command course run — no new research on stage day.",
    prepareInModule: "Module 8 · lock sheet + handoff",
    day8SectionHref: epDebatePrepDayBlockHref(DAY8_ID, "s8-lock-sheet"),
  },
] as const;

export const DEBATE_PREP_CHECKLIST = [
  "Lock sheet exported — claims-green lines only",
  "Opening names elections, business services, and Capitol management",
  "Three SOS answers rehearsed under 90s timer",
  "Closing ends on service desk promise, not agree-only",
  "If-X-then-Y cards in pocket for top three traps",
] as const;
