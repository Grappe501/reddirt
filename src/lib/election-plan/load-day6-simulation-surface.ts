/**
 * Day 6 Pass 2 — simulation surface merging Days 1–5 into timed sim segments.
 */
import { buildDay5CapitalizeSurface } from "@/lib/election-plan/load-day5-capitalize-surface";
import {
  DAY6_SIM_SOS_COUNT,
  DAY6_SIM_TRAP_LANE_IDS,
  type Day6SimTrapLaneId,
} from "@/lib/election-plan/debate-prep-day6-simulation-copy";
import { DAY1_ID, DAY5_ID, DAY6_ID, getDayRehearsalScript } from "@/lib/election-plan/debatePrepDayDrillDown";
import { epDebatePrepDayRehearsalHref, epTrapLaneHref } from "@/lib/election-plan/debate-prep-links";
import { getDayDeepOverlay } from "@/lib/intelligence/v4/debateWeekIntensive2026Deep";
import { getTrapLaneDrillDown } from "@/lib/intelligence/v4/trapLaneDrillDowns";

export type Day6SimSegmentKind = "opening" | "trap" | "sos" | "closing" | "pile-on";

export type Day6SimStaffRole = "moderator" | "hammer" | "pakko";

export type Day6SimSegment = {
  segmentIndex: number;
  kind: Day6SimSegmentKind;
  label: string;
  timedMinutes: number;
  staffRole: Day6SimStaffRole;
  kellyObjective: string;
  sourceDayId: string;
  /** Optional drill-down href for Kelly pathway (election-plan only). */
  href?: string;
  /** Staff setup hint — paraphrase OK, Kelly lines claims-green only. */
  staffSetupHint?: string;
};

export type Day6SimBookend = {
  variant: "opening" | "closing";
  durationSeconds: 90 | 60;
  script: string;
  sourceDayId: string;
  sourceLabel: string;
  rehearsalHref: string;
};

export type Day6SimulationSurface = {
  dayId: typeof DAY6_ID;
  segments: Day6SimSegment[];
  bookends: {
    opening: Day6SimBookend;
    closing: Day6SimBookend;
  };
  whenXSayYPairCount: number;
  trapLaneCount: number;
  sosQuestionCount: number;
  hasDay5Minimum: boolean;
  verifiedPairCount: number;
};

function buildOpeningBookend(): Day6SimBookend {
  const opening = getDayRehearsalScript(DAY1_ID, "rehearse-opening-90s");
  return {
    variant: "opening",
    durationSeconds: 90,
    script:
      opening?.script ??
      "I'm Kelly Grappe. I'm running to run the office — a service desk for seventy-five counties that educates and unites. Clerks run elections in Arkansas.",
    sourceDayId: DAY1_ID,
    sourceLabel: "Day 1 · rehearse-opening-90s",
    rehearsalHref: epDebatePrepDayRehearsalHref(DAY1_ID, "rehearse-opening-90s"),
  };
}

function buildClosingBookend(): Day6SimBookend {
  const day7 = getDayDeepOverlay("day-7-refine-and-steal-show");
  const closeDrill = day7.commandDrills.find((d) => d.id === "d7-close");
  return {
    variant: "closing",
    durationSeconds: 60,
    script:
      closeDrill?.youSay ??
      "Clerks deserve a Secretary of State who shows up. I will be that administrator — for every county in Arkansas.",
    sourceDayId: "day-7-refine-and-steal-show",
    sourceLabel: "Day 7 · d7-close template (pull-forward for sim)",
    rehearsalHref: epDebatePrepDayRehearsalHref(DAY6_ID, "rehearse-open-close-sim"),
  };
}

export function buildDay6SimulationSurface(): Day6SimulationSurface {
  const day5 = buildDay5CapitalizeSurface();
  const opening = buildOpeningBookend();
  const closing = buildClosingBookend();
  const verifiedPairs = day5.pairs.filter((p) => !p.isPlaceholder && p.kellyLine.trim());

  const trapSegments = DAY6_SIM_TRAP_LANE_IDS.map((laneId, idx) => {
    const drill = getTrapLaneDrillDown(laneId)!;
    const sourceDayId: string = idx === 0 ? "day-2-read-the-table" : DAY5_ID;
    return {
      kind: "trap" as const,
      label: `Trap lane ${drill.laneNumber} · ${drill.title}`,
      timedMinutes: 3,
      staffRole: "hammer" as const,
      kellyObjective: drill.kellyPivotDeep.slice(0, 220),
      sourceDayId,
      href: epTrapLaneHref(laneId),
      staffSetupHint: drill.whatToExpectHammerToSay[0] ?? drill.setupMoves[0] ?? "",
    };
  });

  const sosSegments = day5.sosQuestions.slice(0, DAY6_SIM_SOS_COUNT).map((q, idx) => ({
    kind: "sos" as const,
    label: `SOS question ${idx + 1} · ${q.questionTitle}`,
    timedMinutes: 2,
    staffRole: "moderator" as const,
    kellyObjective: `Answer in order 1·2·3 — clerk-centered image in final ten seconds. Forum topic: ${q.forumTopic}.`,
    sourceDayId: "day-4-forum-intelligence",
    href: q.questionHref,
    staffSetupHint: q.hammerLineSuggestion ?? "Moderator reads SOS bank question at 90s pace.",
  }));

  const rawSegments = [
    {
      kind: "opening" as const,
      label: "Opening statement · 90s administrator frame",
      timedMinutes: 2,
      staffRole: "moderator" as const,
      kellyObjective: "No opponent names — clerk partnership, business proof, ACCA tone. Picture APA statewide broadcast.",
      sourceDayId: DAY1_ID,
      href: opening.rehearsalHref,
      staffSetupHint: "Moderator: 'Opening statements — ninety seconds each.'",
    },
    ...trapSegments,
    {
      kind: "pile-on" as const,
      label: "Pile-on pivot · Hammer + Pakko on government trust",
      timedMinutes: 3,
      staffRole: "hammer" as const,
      kellyObjective: "Bridge to clerks — do not fight two fronts. Use Day 5 pile-on pivot line.",
      sourceDayId: DAY5_ID,
      staffSetupHint: "Hammer opens trust attack; Pakko joins — Kelly bridges in 30s.",
    },
    ...sosSegments,
    {
      kind: "closing" as const,
      label: "Closing statement · 60s clerk invoke",
      timedMinutes: 2,
      staffRole: "moderator" as const,
      kellyObjective: "Peak-end rule — last calm minute papers remember. Hold silence 2s after final word.",
      sourceDayId: "day-7-refine-and-steal-show",
      href: closing.rehearsalHref,
      staffSetupHint: "Moderator: 'Closing statements — sixty seconds.'",
    },
  ];

  const segments: Day6SimSegment[] = rawSegments.map((seg, i) => ({
    ...seg,
    segmentIndex: i + 1,
  }));

  return {
    dayId: DAY6_ID,
    segments,
    bookends: { opening, closing },
    whenXSayYPairCount: day5.pairs.length,
    trapLaneCount: DAY6_SIM_TRAP_LANE_IDS.length,
    sosQuestionCount: sosSegments.length,
    hasDay5Minimum: verifiedPairs.length >= 5,
    verifiedPairCount: verifiedPairs.length,
  };
}

export function getDay6SimTrapLaneIds(): readonly Day6SimTrapLaneId[] {
  return DAY6_SIM_TRAP_LANE_IDS;
}
