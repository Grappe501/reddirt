/**
 * Debate Prep System v7 — full integrated operator package.
 * Layers forum intel (v6) with a sequenced tonight path and package completeness scoring.
 */
import {
  buildDebatePrepSystemV6Snapshot,
  type DebatePrepSystemV6Snapshot,
} from "@/lib/election-plan/debate-prep-system-v6";
import { buildDebatePrepCommandHomeBundle as buildV5CommandHomeBundle } from "@/lib/election-plan/debate-prep-system-v5";
import {
  EP_DEBATE_PREP_COMMAND_HREF,
  EP_DEBATE_PREP_REHEARSAL_HREF,
  EP_DEBATE_PREP_TUTOR_HREF,
  EP_FORUM_TRANSCRIPT_LAB_HREF,
  EP_TRAP_LANES_HREF,
  epTrapLaneHref,
} from "@/lib/election-plan/debate-prep-links";
import { epDebatePrepDayHref } from "@/lib/election-plan/debate-prep-route-map";
import type { DebatePrepV5ModuleId } from "@/lib/election-plan/debate-prep-system-v5";
import { DEBATE_WEEK_INTENSIVE_DAYS } from "@/lib/intelligence/v4/debateWeekIntensive2026";
import { countForumDrillQueueCards } from "@/lib/intelligence/v4/forumTranscriptRehearsalCards";
import { TRAP_LANE_SELECTION_GUIDE } from "@/lib/election-plan/debate-prep-operator-guide";

export const DEBATE_PREP_SYSTEM_V7_VERSION = "debate-prep-system-v7.0-unified-package";
export const DEBATE_PREP_PACKAGE_LABEL = "Debate prep v7";

export type DebatePrepTonightStep = {
  stepId: string;
  order: number;
  label: string;
  detail: string;
  minutes: number;
  href: string;
  moduleId: DebatePrepV5ModuleId;
};

export type DebatePrepTonightPackage = {
  headline: string;
  totalMinutes: number;
  forumFirst: boolean;
  steps: DebatePrepTonightStep[];
};

export type DebatePrepSystemV7Snapshot = Omit<
  DebatePrepSystemV6Snapshot,
  "version" | "headline" | "intro" | "readinessLabel" | "todayFocus" | "modules"
> & {
  version: typeof DEBATE_PREP_SYSTEM_V7_VERSION;
  headline: string;
  intro: string;
  packageLabel: typeof DEBATE_PREP_PACKAGE_LABEL;
  tonightPackage: DebatePrepTonightPackage;
  /** Share of Kelly-facing modules marked ready (0–100). */
  packageCompletenessPct: number;
  wiredSurfaceCount: number;
  readinessLabel: string;
  todayFocus: string | null;
  modules: DebatePrepSystemV6Snapshot["modules"];
};

function pickTonightTrapLane(): string {
  return TRAP_LANE_SELECTION_GUIDE[0]?.laneId ?? "county-champion";
}

function resolveTodayDayId(referenceDate: string): string {
  const match = DEBATE_WEEK_INTENSIVE_DAYS.find((d) => d.calendarDate === referenceDate);
  return match?.dayId ?? "day-5-anticipate-and-capitalize";
}

export function buildDebatePrepTonightPackage(referenceDate?: string): DebatePrepTonightPackage {
  const ref = referenceDate ?? process.env.DEBATE_WEEK_TODAY ?? "2026-06-19";
  const forumFirst = countForumDrillQueueCards() > 0;
  const dayId = resolveTodayDayId(ref);
  const trapLane = pickTonightTrapLane();

  const steps: DebatePrepTonightStep[] = [
    {
      stepId: "command-brief",
      order: 1,
      label: "Command home briefing",
      detail: "Readiness score, safe lines, blocked lines, and tonight focus — one screen before depth.",
      minutes: 5,
      href: EP_DEBATE_PREP_COMMAND_HREF,
      moduleId: "command-home",
    },
    {
      stepId: "command-day",
      order: 2,
      label: "Today's command course day",
      detail: "Run study blocks and rehearsal-out-loud lines for the calendar day on the intensive.",
      minutes: 15,
      href: epDebatePrepDayHref(dayId),
      moduleId: "command-course",
    },
  ];

  if (forumFirst) {
    steps.push(
      {
        stepId: "forum-intel",
        order: 3,
        label: "Forum intel skim",
        detail: "Review ACCA capitalize moves and Hammer/Pakko tells — claims-gate before stage.",
        minutes: 8,
        href: EP_FORUM_TRANSCRIPT_LAB_HREF,
        moduleId: "forum-lab",
      },
      {
        stepId: "forum-trap",
        order: 4,
        label: "Forum-informed trap lane",
        detail: "Rehearse one trap lane matching tonight's expected Hammer theme from forum intel.",
        minutes: 10,
        href: epTrapLaneHref(trapLane),
        moduleId: "trap-lanes",
      },
      {
        stepId: "tutor-three-way",
        order: 5,
        label: "AI tutor · three-way panel",
        detail: "15 min coach mode with forum-acca cards — moderator Q and capitalize drills.",
        minutes: 15,
        href: `${EP_DEBATE_PREP_TUTOR_HREF}?mode=three-way-panel`,
        moduleId: "ai-tutor",
      },
      {
        stepId: "rehearsal-forum-queue",
        order: 6,
        label: "Rehearsal · forum-acca-tonight queue",
        detail: "Run forum-derived drill cards on Election Plan rehearsal — timed, one card at a time.",
        minutes: 20,
        href: `${EP_DEBATE_PREP_REHEARSAL_HREF}?queue=forum-acca-tonight&card=1`,
        moduleId: "rehearsal",
      },
    );
  } else {
    steps.push(
      {
        stepId: "trap-lane",
        order: 3,
        label: "Primary trap lane",
        detail: "Pick 1–2 lanes — setup question, pivot script, claims gate before stage.",
        minutes: 12,
        href: epTrapLaneHref(trapLane),
        moduleId: "trap-lanes",
      },
      {
        stepId: "tutor-tonight",
        order: 4,
        label: "AI tutor · tonight mode",
        detail: "15 min structured coach — trap pivots and SOS speak-order with practice critique.",
        minutes: 15,
        href: `${EP_DEBATE_PREP_TUTOR_HREF}?mode=tonight-15`,
        moduleId: "ai-tutor",
      },
      {
        stepId: "rehearsal-standard",
        order: 5,
        label: "Rehearsal · standard tonight queue",
        detail: "SRE encounter + drill queue — log debrief and verify lines with staff.",
        minutes: 20,
        href: `${EP_DEBATE_PREP_REHEARSAL_HREF}?queue=standard-tonight&card=1`,
        moduleId: "rehearsal",
      },
    );
  }

  steps.push({
    stepId: "debrief",
    order: steps.length + 1,
    label: "Claims gate debrief",
    detail: "Staff verifies any numbers or opponent quotes before public use — close the loop.",
    minutes: 5,
    href: EP_DEBATE_PREP_COMMAND_HREF,
    moduleId: "command-home",
  });

  const ordered = steps.map((s, idx) => ({ ...s, order: idx + 1 }));
  const totalMinutes = ordered.reduce((sum, s) => sum + s.minutes, 0);

  return {
    headline: forumFirst
      ? "Tonight's package · forum-informed path (~78 min)"
      : "Tonight's package · standard path (~72 min)",
    totalMinutes,
    forumFirst,
    steps: ordered,
  };
}

export function buildDebatePrepSystemV7Snapshot(referenceDate?: string): DebatePrepSystemV7Snapshot {
  const base = buildDebatePrepSystemV6Snapshot(referenceDate);
  const tonightPackage = buildDebatePrepTonightPackage(referenceDate);

  const kellyModules = base.modules.filter((m) => m.lane === "kelly");
  const readyCount = kellyModules.filter((m) => m.status === "ready").length;
  const packageCompletenessPct =
    kellyModules.length > 0 ? Math.round((readyCount / kellyModules.length) * 100) : 0;

  const modules = base.modules.map((mod) => {
    if (mod.id === "command-course" && base.forumIntel.ready) {
      return {
        ...mod,
        statusNote: `${mod.statusNote ?? ""} · forum seven-day map wired`.trim(),
      };
    }
    if (mod.id === "command-home") {
      return {
        ...mod,
        statusNote: `${base.readinessPct}% · ${tonightPackage.totalMinutes} min tonight package`,
      };
    }
    if (mod.id === "drill-lanes" && base.forumIntel.ready) {
      return {
        ...mod,
        statusNote: `${mod.statusNote ?? ""} · Day 5 capitalize drills from forum`.trim(),
      };
    }
    return mod;
  });

  return {
    ...base,
    version: DEBATE_PREP_SYSTEM_V7_VERSION,
    headline: "Debate Prep System v7 · unified operator package",
    intro:
      "Full integrated package — forum intel, sequenced tonight path, AI tutor, rehearsal engine, command course, and trap lanes in one Election Plan lane. Run the tonight package top to bottom.",
    packageLabel: DEBATE_PREP_PACKAGE_LABEL,
    tonightPackage,
    packageCompletenessPct,
    wiredSurfaceCount: base.forumIntel.wiredSurfaces.length,
    modules,
    todayFocus: tonightPackage.forumFirst
      ? `Run tonight's forum-informed package — start command home, then forum-acca queue (${countForumDrillQueueCards()} cards).`
      : base.todayFocus,
    readinessLabel:
      packageCompletenessPct >= 75 && base.forumIntel.ready
        ? "Package complete · forum-informed"
        : packageCompletenessPct >= 50
          ? "Package in progress · follow tonight path"
          : base.readinessLabel,
  };
}

/** v7 re-exports command home bundle — use debate-prep-system-v8 for the world-class engine. */
export function buildDebatePrepCommandHomeBundle() {
  return buildV5CommandHomeBundle();
}
