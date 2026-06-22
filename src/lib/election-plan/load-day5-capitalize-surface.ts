/**
 * Day 5 Pass 4 — Kelly-facing capitalize surface (Day 4 green lines → timed pairs).
 */
import { buildDay4ForumPipelineSurface, type Day4SosMappingRow } from "@/lib/election-plan/load-day4-forum-pipeline-surface";
import { FORUM_CAPITALIZE_MOVE_LESSONS } from "@/lib/election-plan/forumLabCapitalizeMovesLessonBank";
import { epDebateQuestionHref, epTrapLaneHref } from "@/lib/election-plan/debate-prep-links";
import { getTrapLaneDrillDown } from "@/lib/intelligence/v4/trapLaneDrillDowns";

export const DAY5_TARGET_PAIR_COUNT = 8;

export const DAY5_TRAP_LANE_IDS = [
  "county-champion",
  "integrity-without-participation",
  "fraud-data-dare",
  "culture-war-escalation",
] as const;

export type Day5TrapLaneId = (typeof DAY5_TRAP_LANE_IDS)[number];

export type Day5WhenXSayYRow = {
  pairIndex: number;
  triggerLabel: string;
  kellyLine: string;
  claimsStatus: "green";
  sourceLabel: string;
  timestamp: string;
  timedSeconds: 45 | 60;
  completedAt?: string;
  /** True when row is a placeholder — Kelly must fill from Day 4 before rehearsing */
  isPlaceholder?: boolean;
};

export type Day5TrapLaneSprintCard = {
  laneId: Day5TrapLaneId;
  laneNumber: number;
  title: string;
  summary: string;
  href: string;
  setupHint: string;
  pivotHint: string;
};

export type Day5SosSprintQuestion = {
  sprintIndex: number;
  forumTopic: string;
  questionId: string;
  questionTitle: string;
  questionHref: string;
  hammerLineSuggestion: string | null;
  hammerLineTimestamp: string | null;
};

export type Day5CapitalizeSurface = {
  pairs: Day5WhenXSayYRow[];
  day4NotecardCount: number;
  lessonBankFillCount: number;
  placeholderCount: number;
  hasDay4Minimum: boolean;
  trapLanes: Day5TrapLaneSprintCard[];
  sosQuestions: Day5SosSprintQuestion[];
  verifiedHammerLineCount: number;
};

function normalizeTrigger(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function buildPairsFromDay4(): Day5WhenXSayYRow[] {
  const day4 = buildDay4ForumPipelineSurface();
  const seen = new Set<string>();
  const rows: Day5WhenXSayYRow[] = [];

  for (const line of day4.notecardLines) {
    const key = normalizeTrigger(line.trigger);
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({
      pairIndex: rows.length + 1,
      triggerLabel: line.trigger,
      kellyLine: line.kellyLine,
      claimsStatus: "green",
      sourceLabel: line.sourceLabel,
      timestamp: line.timestamp,
      timedSeconds: rows.length < 5 ? 45 : 60,
    });
  }

  for (const lesson of FORUM_CAPITALIZE_MOVE_LESSONS) {
    if (rows.length >= DAY5_TARGET_PAIR_COUNT) break;
    const key = normalizeTrigger(lesson.trigger);
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({
      pairIndex: rows.length + 1,
      triggerLabel: lesson.trigger,
      kellyLine: lesson.kellyLine,
      claimsStatus: "green",
      sourceLabel: "Capitalize lesson bank · staff template",
      timestamp: day4.pipeline.v1Timestamp ?? day4.pipeline.v2Timestamp ?? new Date().toISOString(),
      timedSeconds: rows.length < 5 ? 45 : 60,
    });
  }

  while (rows.length < DAY5_TARGET_PAIR_COUNT) {
    rows.push({
      pairIndex: rows.length + 1,
      triggerLabel: "Finish Day 4 forum lab ingest first",
      kellyLine: "",
      claimsStatus: "green",
      sourceLabel: "Placeholder — add claims-green line from Day 4 notecard",
      timestamp: "",
      timedSeconds: 45,
      isPlaceholder: true,
    });
  }

  return rows.slice(0, DAY5_TARGET_PAIR_COUNT);
}

function buildTrapLaneCards(): Day5TrapLaneSprintCard[] {
  return DAY5_TRAP_LANE_IDS.map((laneId) => {
    const drill = getTrapLaneDrillDown(laneId)!;
    return {
      laneId,
      laneNumber: drill.laneNumber,
      title: drill.title,
      summary: drill.summary,
      href: epTrapLaneHref(laneId),
      setupHint: drill.setupMoves[0] ?? drill.whatToExpectHammerToSay[0] ?? "",
      pivotHint: drill.kellyPivotDeep,
    };
  });
}

function buildSosQuestions(rows: Day4SosMappingRow[]): Day5SosSprintQuestion[] {
  return rows
    .filter((row) => row.suggestedQuestionId)
    .slice(0, 5)
    .map((row, idx) => ({
      sprintIndex: idx + 1,
      forumTopic: row.forumTopic,
      questionId: row.suggestedQuestionId,
      questionTitle: row.suggestedQuestionTitle,
      questionHref: row.suggestedQuestionHref || epDebateQuestionHref(row.suggestedQuestionId),
      hammerLineSuggestion: row.hammerLineSuggestion,
      hammerLineTimestamp: row.hammerLineTimestamp,
    }));
}

export function buildDay5CapitalizeSurface(): Day5CapitalizeSurface {
  const day4 = buildDay4ForumPipelineSurface();
  const pairs = buildPairsFromDay4();
  const day4NotecardCount = day4.notecardLines.length;
  const lessonBankFillCount = pairs.filter(
    (p) => !p.isPlaceholder && p.sourceLabel.includes("lesson bank"),
  ).length;
  const placeholderCount = pairs.filter((p) => p.isPlaceholder).length;

  return {
    pairs,
    day4NotecardCount,
    lessonBankFillCount,
    placeholderCount,
    hasDay4Minimum: day4NotecardCount >= 1 && day4.pipeline.v1Ready,
    trapLanes: buildTrapLaneCards(),
    sosQuestions: buildSosQuestions(day4.sosMappingRows),
    verifiedHammerLineCount: day4.verifiedHammerLines.length,
  };
}
