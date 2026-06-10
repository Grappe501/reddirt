import { addWeeks } from "@/lib/calendar/weekly-time";
import type { WeeklyDecisionBrief } from "../types";
import { loadWeeklyDecisionBriefSnapshot } from "../decision-engine/load-decision-brief";

export type BriefWeekDelta = {
  prevWeekKey: string | null;
  hasPrevious: boolean;
  newInTop10: { county: string; countySlug: string }[];
  droppedFromTop10: { county: string; countySlug: string }[];
  paceChange: "improved" | "worsened" | "unchanged" | "unknown";
  kellySlotsDelta: number;
  volunteerActionsDelta: number;
  summaryLines: string[];
};

const PACE_RANK: Record<string, number> = { ahead: 3, on_pace: 2, behind: 1, unknown: 0 };

export function computeBriefWeekDelta(current: WeeklyDecisionBrief): BriefWeekDelta | null {
  const prevWeekKey = addWeeks(current.weekKey, -1);
  const prev = loadWeeklyDecisionBriefSnapshot(prevWeekKey);
  if (!prev) {
    return {
      prevWeekKey: null,
      hasPrevious: false,
      newInTop10: current.topDecisions.map((d) => ({ county: d.county, countySlug: d.countySlug })),
      droppedFromTop10: [],
      paceChange: "unknown",
      kellySlotsDelta: current.kellyDeployment.length,
      volunteerActionsDelta: current.volunteerDeployment.length,
      summaryLines: ["First saved brief for this chain — week-over-week delta starts next Monday."],
    };
  }

  const curSlugs = new Set(current.topDecisions.map((d) => d.countySlug));
  const prevSlugs = new Set(prev.topDecisions.map((d) => d.countySlug));

  const newInTop10 = current.topDecisions
    .filter((d) => !prevSlugs.has(d.countySlug))
    .map((d) => ({ county: d.county, countySlug: d.countySlug }));

  const droppedFromTop10 = prev.topDecisions
    .filter((d) => !curSlugs.has(d.countySlug))
    .map((d) => ({ county: d.county, countySlug: d.countySlug }));

  const curPace = PACE_RANK[current.statewideVictory.pace] ?? 0;
  const prevPace = PACE_RANK[prev.statewideVictory.pace] ?? 0;
  const paceChange =
    curPace > prevPace ? "improved" : curPace < prevPace ? "worsened" : "unchanged";

  const kellySlotsDelta = current.kellyDeployment.length - prev.kellyDeployment.length;
  const volunteerActionsDelta = current.volunteerDeployment.length - prev.volunteerDeployment.length;

  const summaryLines: string[] = [];
  if (newInTop10.length) {
    summaryLines.push(`New in Top 10: ${newInTop10.map((c) => c.county).join(", ")}`);
  }
  if (droppedFromTop10.length) {
    summaryLines.push(`Dropped from Top 10: ${droppedFromTop10.map((c) => c.county).join(", ")}`);
  }
  if (paceChange === "improved") summaryLines.push("Statewide pace improved vs last week.");
  if (paceChange === "worsened") summaryLines.push("Statewide pace worsened vs last week — prioritize Critical counties.");
  if (kellySlotsDelta !== 0) {
    summaryLines.push(
      `Kelly slots ${kellySlotsDelta > 0 ? "up" : "down"} ${Math.abs(kellySlotsDelta)} vs last week.`,
    );
  }
  if (summaryLines.length === 0) {
    summaryLines.push("Top 10 county set stable vs last week.");
  }

  return {
    prevWeekKey,
    hasPrevious: true,
    newInTop10,
    droppedFromTop10,
    paceChange,
    kellySlotsDelta,
    volunteerActionsDelta,
    summaryLines,
  };
}
