/**
 * Day 7 Pass 2 — polish surface merging Day 1 opening, Day 6 debrief import, and d7-close.
 */
import {
  DAY6_DEBRIEF_PROMPTS,
  DAY6_DEBRIEF_TOP_FIXES_LABEL,
} from "@/lib/election-plan/debate-prep-day6-simulation-copy";
import {
  DAY7_CLOSING_BEATS,
  DAY7_DEBRIEF_IMPORT_LABEL,
  DAY7_OPENING_BEATS,
  DAY7_POLISH_CLAIMS_GATE,
  DAY7_QUOTABLE_RULE,
} from "@/lib/election-plan/debate-prep-day7-polish-copy";
import { buildDay7Examples } from "@/lib/election-plan/debatePrepDay7Registry";
import { DAY1_ID, DAY6_ID, DAY7_ID, getDayRehearsalScript } from "@/lib/election-plan/debatePrepDayDrillDown";
import {
  epDebatePrepDayBlockHref,
  epDebatePrepDayDrillHref,
  epDebatePrepDayHref,
  epDebatePrepDayRehearsalHref,
} from "@/lib/election-plan/debate-prep-links";
import { buildDay6SimulationSurface } from "@/lib/election-plan/load-day6-simulation-surface";
import { getDayDeepOverlay } from "@/lib/intelligence/v4/debateWeekIntensive2026Deep";

export type Day7PolishBookend = {
  variant: "opening" | "closing";
  durationSeconds: 90 | 60;
  script: string;
  sourceDayId: string;
  sourceLabel: string;
  rehearsalHref: string;
};

export type Day7PolishBeat = {
  beat: number;
  source: string;
  objective: string;
  href?: string;
};

export type Day7PolishSurface = {
  dayId: typeof DAY7_ID;
  bookends: {
    opening: Day7PolishBookend;
    closing: Day7PolishBookend;
  };
  openingBeats: Day7PolishBeat[];
  closingBeats: Day7PolishBeat[];
  debriefPrompts: readonly string[];
  debriefTopFixesLabel: string;
  debriefImportLabel: string;
  quotableCandidates: string[];
  day6SimHref: string;
  day6DebriefBlockHref: string;
  claimsGateLines: readonly string[];
  hasDay6BookendPullForward: boolean;
};

function beatHref(beat: number, source: string): string | undefined {
  if (source.includes("Day 1")) return epDebatePrepDayRehearsalHref(DAY1_ID, "rehearse-opening-90s");
  if (source.includes("d7-close")) return epDebatePrepDayDrillHref(DAY7_ID, "d7-close");
  if (source.includes("Day 6")) return epDebatePrepDayBlockHref(DAY6_ID, "b6-sim");
  if (beat === 3) return epDebatePrepDayRehearsalHref(DAY7_ID, "rehearse-quotable-line");
  return undefined;
}

function buildOpeningBookend(): Day7PolishBookend {
  const sim = buildDay6SimulationSurface();
  const opening = getDayRehearsalScript(DAY1_ID, "rehearse-opening-90s");
  return {
    variant: "opening",
    durationSeconds: 90,
    script: opening?.script ?? sim.bookends.opening.script,
    sourceDayId: DAY1_ID,
    sourceLabel: "Day 1 · rehearse-opening-90s",
    rehearsalHref: epDebatePrepDayRehearsalHref(DAY1_ID, "rehearse-opening-90s"),
  };
}

function buildClosingBookend(): Day7PolishBookend {
  const overlay = getDayDeepOverlay(DAY7_ID);
  const closeDrill = overlay.commandDrills.find((d) => d.id === "d7-close");
  const sim = buildDay6SimulationSurface();
  return {
    variant: "closing",
    durationSeconds: 60,
    script: closeDrill?.youSay ?? sim.bookends.closing.script,
    sourceDayId: DAY7_ID,
    sourceLabel: "Day 7 · d7-close clerk invoke template",
    rehearsalHref: epDebatePrepDayDrillHref(DAY7_ID, "d7-close"),
  };
}

export function buildDay7PolishSurface(): Day7PolishSurface {
  const opening = buildOpeningBookend();
  const closing = buildClosingBookend();
  const examples = buildDay7Examples();
  const showSteal = examples.find((ex) => ex.id === "ex7-show-steal");

  const quotableCandidates = [
    closing.script,
    showSteal?.kellyResponse ?? "",
    "Clerks don't need another author in the Capitol — they need a Secretary of State who shows up.",
  ].filter((line) => line.trim().length > 20);

  const openingBeats: Day7PolishBeat[] = DAY7_OPENING_BEATS.map((b) => ({
    ...b,
    href: beatHref(b.beat, b.source),
  }));

  const closingBeats: Day7PolishBeat[] = DAY7_CLOSING_BEATS.map((b) => ({
    ...b,
    href: beatHref(b.beat, b.source),
  }));

  const sim = buildDay6SimulationSurface();

  return {
    dayId: DAY7_ID,
    bookends: { opening, closing },
    openingBeats,
    closingBeats,
    debriefPrompts: DAY6_DEBRIEF_PROMPTS,
    debriefTopFixesLabel: DAY6_DEBRIEF_TOP_FIXES_LABEL,
    debriefImportLabel: DAY7_DEBRIEF_IMPORT_LABEL,
    quotableCandidates: [...new Set(quotableCandidates)],
    day6SimHref: epDebatePrepDayHref(DAY6_ID),
    day6DebriefBlockHref: epDebatePrepDayBlockHref(DAY6_ID, "b6-sim"),
    claimsGateLines: DAY7_POLISH_CLAIMS_GATE,
    hasDay6BookendPullForward: sim.bookends.closing.sourceDayId === DAY7_ID,
  };
}

export function getDay7QuotableRule(): string {
  return DAY7_QUOTABLE_RULE;
}
