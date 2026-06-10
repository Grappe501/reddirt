/**
 * Victory OS Sprint 5 — daily decision generator (Season 5 cadence).
 */

import { weekKeyFromDate } from "@/lib/calendar/weekly-time";
import { loadVictoryMapCounties, resolveCurrentVictorySeason } from "../load-victory-map";
import { loadOrGenerateWeeklyDecisionBrief } from "../decision-engine/load-decision-brief";
import type { WeeklyCampaignDecision } from "../types";
import type { DailyDecisionBrief } from "./types";

function dayKeyFromDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isSeason5(asOf: Date): boolean {
  const season = resolveCurrentVictorySeason(asOf);
  return season?.id === "season_5_build_urgency";
}

export function generateDailyDecisionBrief(options?: { asOf?: Date; dayKey?: string }): DailyDecisionBrief {
  const asOf = options?.asOf ?? new Date();
  const dayKey = options?.dayKey ?? dayKeyFromDate(asOf);
  const weekKey = weekKeyFromDate(asOf);
  const weeklyBrief = loadOrGenerateWeeklyDecisionBrief(weekKey);
  const counties = loadVictoryMapCounties({ asOf });
  const season = resolveCurrentVictorySeason(asOf);

  const kellyPool = weeklyBrief.topDecisions.filter((d) => d.kellyTier <= 2 && d.status !== "declined");
  const kellyToday: WeeklyCampaignDecision[] = kellyPool.slice(0, 5).map((d, i) => ({
    ...d,
    rank: i + 1,
    recommendation: `[Today] ${d.recommendation}`,
  }));

  const countyGaps = counties
    .filter((c) => c.electoralImportance === "critical" || c.electoralImportance === "important")
    .map((c) => ({
      countySlug: c.countySlug,
      county: c.county,
      gapScore: c.deploymentPriority.deploymentPriority,
      opsStatus: c.opsStatus,
    }))
    .sort((a, b) => b.gapScore - a.gapScore)
    .slice(0, 8);

  return {
    briefId: `daily-${dayKey}`,
    dayKey,
    weekKey,
    generatedAt: new Date().toISOString(),
    seasonId: "season_5_build_urgency",
    seasonLabel: season?.label ?? "Build Urgency — Final 14 Days",
    publicationSafety: "INTERNAL_DRAFT",
    headline: "Where do we deploy Kelly today?",
    summary: isSeason5(asOf)
      ? `Season 5 daily cadence · ${kellyToday.length} Kelly slots prioritized from weekly Top 10.`
      : `Daily preview (outside Season 5 window) · derived from week ${weekKey} decisions.`,
    kellyToday,
    countyGaps,
    cadence: "daily",
  };
}

export { isSeason5, dayKeyFromDate };
