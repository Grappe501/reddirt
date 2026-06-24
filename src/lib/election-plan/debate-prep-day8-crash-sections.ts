/**
 * Day 8 crash course section specs — client-safe (no drill-down registry graph).
 */
export type Day8WeekImportTag =
  | "day-1"
  | "day-2"
  | "day-3"
  | "day-4"
  | "day-5"
  | "day-6"
  | "day-7";

export type Day8CrashSectionSpec = {
  id: string;
  sectionLabel: string;
  title: string;
  minutes: number;
  activity: string;
  why: string;
  weekImports: readonly Day8WeekImportTag[];
};

export const DAY8_CRASH_SECTION_SPECS: readonly Day8CrashSectionSpec[] = [
  {
    id: "s8-orient",
    sectionLabel: "§0",
    title: "Orientation — course map",
    minutes: 10,
    activity: "Course map, three SOS domains, deep-study links; choose full or essentials path.",
    why: "Linear replay of Modules 1–7 in stage order — same foundation, export-ready script.",
    weekImports: [],
  },
  {
    id: "s8-pre-debate",
    sectionLabel: "§1",
    title: "Pre-stage prep",
    minutes: 15,
    activity: "Lock sheet preview, three if-X-then-Y cards, physical readiness.",
    why: "Execution runs from what is locked — not what is discovered on the way to the venue.",
    weekImports: ["day-7"],
  },
  {
    id: "s8-command",
    sectionLabel: "§2",
    title: "Command presence — body before words",
    minutes: 20,
    activity: "4-4-6 breath ×3, scan protocol, listen face while staff reads bait.",
    why: "Module 1 compressed — calm body reads as administrator across all three domains.",
    weekImports: ["day-1"],
  },
  {
    id: "s8-persona-wall",
    sectionLabel: "§3",
    title: "Persona wall — who is listening",
    minutes: 15,
    activity: "Map each SOS domain to a persona; three voter-translation drills.",
    why: "Robert K. hears business services; Diane P. hears Capitol rules — statewide audience, not one room.",
    weekImports: ["day-5"],
  },
  {
    id: "s8-opening-workshop",
    sectionLabel: "§4",
    title: "Opening statement — construct & deliver",
    minutes: 30,
    activity:
      "Build 90s opening: administrator → elections + business services + Capitol (one breath each) → Arkansas promise; two reps.",
    why: "Qualification across the full SOS desk — elections, business, and Capitol in one opening.",
    weekImports: ["day-1", "day-3", "day-4"],
  },
  {
    id: "s8-middle-game",
    sectionLabel: "§5",
    title: "Middle game — listen, traps, moderator Q&A",
    minutes: 45,
    activity: "Four when-X-say-Y reps + three SOS answers (one per domain, 90s each) + pile-on cold.",
    why: "Middle game wins general-election voters — three domains under timer, claims-green only.",
    weekImports: ["day-2", "day-4", "day-5"],
  },
  {
    id: "s8-closing-workshop",
    sectionLabel: "§6",
    title: "Closing statement — construct & deliver",
    minutes: 25,
    activity: "60s closing: service desk invoke (all three domains) → sim fix → quotable; two reps.",
    why: "Peak-end — closing echoes elections, business filings, and Capitol rules.",
    weekImports: ["day-6", "day-7"],
  },
  {
    id: "s8-run-through",
    sectionLabel: "§7",
    title: "Abbreviated debate run-through",
    minutes: 22,
    activity: "Speak-aloud arc — opening with three domains, traps, three domain SOS, pile-on, closing.",
    why: "Module 6 compressed — rehearse the full arc before the broadcast.",
    weekImports: ["day-6"],
  },
  {
    id: "s8-lock-sheet",
    sectionLabel: "§8",
    title: "Lock sheet & stage handoff",
    minutes: 8,
    activity: "Export three-domain lock sheet; travel → stage → debrief protocol.",
    why: "Light cognitive load at the venue — Command Mode execution from the lock sheet.",
    weekImports: ["day-7"],
  },
] as const;

export const DAY8_SECTION_IDS = DAY8_CRASH_SECTION_SPECS.map((s) => s.id);
