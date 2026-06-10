/**
 * Victory OS Layer 1 — Weekly Decision Generator (Sprint 1).
 * Produces Top 10 CM decisions from Victory Map + season doctrine.
 */

import { weekKeyFromDate } from "@/lib/calendar/weekly-time";
import { loadVictoryMapCounties, loadVictoryMapFile, resolveCurrentVictorySeason } from "../load-victory-map";
import type {
  CampaignVictorySeasonId,
  CountyVictoryContext,
  StatewideVictoryPace,
  WeeklyCampaignDecision,
  WeeklyDecisionBrief,
} from "../types";
import {
  maxKellyTier1SlotsForSeason,
  resolveCountyDecisionRecommendation,
  resolveFundraisingUnlock,
} from "./resolve-resource-recommendation";

const DEFAULT_SEASON: CampaignVictorySeasonId = "season_1_build_organization";

export type GenerateWeeklyDecisionsOptions = {
  asOf?: Date;
  weekKey?: string;
  topN?: number;
  /** When map is not leadership_locked, still generate but flag in summary */
  allowDraftMap?: boolean;
};

function decisionId(weekKey: string, countySlug: string): string {
  return `dec-${weekKey}-${countySlug}`;
}

function composeStatewideSummary(
  pace: StatewideVictoryPace,
  gap: number,
  target: number,
  seasonLabel: string,
): string {
  const paceText =
    pace === "unknown"
      ? "Pace tracking connects when field metrics feed the engine."
      : pace === "ahead"
        ? "Campaign is ahead of season pace."
        : pace === "behind"
          ? "Campaign is behind season pace — prioritize Critical counties."
          : "Campaign is on pace for the planning scenario.";
  return `${seasonLabel} · Planning gap ${gap.toLocaleString()} votes to cushion target ${target.toLocaleString()}. ${paceText} Numbers are planning scenario — not forecast.`;
}

function inferStatewidePace(counties: CountyVictoryContext[]): StatewideVictoryPace {
  const criticalAtRisk = counties.filter(
    (c) => c.electoralImportance === "critical" && (c.opsStatus === "red" || c.opsStatus === "yellow"),
  ).length;
  const criticalTotal = counties.filter((c) => c.electoralImportance === "critical").length;
  if (criticalTotal === 0) return "unknown";
  const riskShare = criticalAtRisk / criticalTotal;
  if (riskShare >= 0.5) return "behind";
  if (riskShare >= 0.25) return "on_pace";
  return "ahead";
}

function candidateCountiesForTop10(counties: CountyVictoryContext[]): CountyVictoryContext[] {
  const ranked = [...counties].sort(
    (a, b) => b.deploymentPriority.deploymentPriority - a.deploymentPriority.deploymentPriority,
  );
  const primary = ranked.filter(
    (c) =>
      !(c.electoralImportance === "maintenance" && c.opsStatus === "green" && c.opportunityLevel === "low"),
  );
  const pool = primary.length >= 10 ? primary : ranked;
  const seen = new Set<string>();
  const unique: CountyVictoryContext[] = [];
  for (const c of pool) {
    if (seen.has(c.countySlug)) continue;
    seen.add(c.countySlug);
    unique.push(c);
    if (unique.length >= 10) break;
  }
  return unique;
}

function applyKellyTier1Cap(
  decisions: WeeklyCampaignDecision[],
  seasonId: CampaignVictorySeasonId,
): WeeklyCampaignDecision[] {
  const cap = maxKellyTier1SlotsForSeason(seasonId);
  let tier1Used = 0;
  return decisions.map((d) => {
    if (d.kellyTier !== 1) return d;
    tier1Used += 1;
    if (tier1Used <= cap) return d;
    return {
      ...d,
      kellyTier: 2 as const,
      recommendation: d.recommendation.replace(/^Deploy Kelly/, "Kelly preferred (Tier 2)"),
      reason: `${d.reason} · Tier 1 capacity capped for week`,
    };
  });
}

function buildDecisionFromCounty(
  ctx: CountyVictoryContext,
  rank: number,
  weekKey: string,
  seasonId: CampaignVictorySeasonId,
): WeeklyCampaignDecision {
  const rec = resolveCountyDecisionRecommendation(ctx, seasonId);
  return {
    id: decisionId(weekKey, ctx.countySlug),
    rank,
    weekKey,
    seasonId,
    countySlug: ctx.countySlug,
    county: ctx.county,
    displayName: ctx.displayName,
    opsStatus: ctx.opsStatus,
    recommendation: rec.recommendation,
    resourceType: rec.resourceType,
    kellyTier: rec.kellyTier,
    expectedOutcome: rec.expectedOutcome,
    reason: rec.reason,
    electoralImportance: ctx.electoralImportance,
    opportunityLevel: ctx.opportunityLevel,
    organizationalReadiness: ctx.organizationalReadiness,
    deploymentPriority: ctx.deploymentPriority.deploymentPriority,
    status: "pending",
    linkedMissionId: null,
  };
}

export function generateWeeklyDecisionBrief(options: GenerateWeeklyDecisionsOptions = {}): WeeklyDecisionBrief {
  const asOf = options.asOf ?? new Date();
  const weekKey = options.weekKey ?? weekKeyFromDate(asOf);
  const topN = options.topN ?? 10;
  const mapFile = loadVictoryMapFile();
  const counties = loadVictoryMapCounties({ asOf });
  const season = resolveCurrentVictorySeason(asOf);
  const seasonId = season?.id ?? DEFAULT_SEASON;
  const seasonLabel = season?.label ?? "Pre-season / transition";

  const gap = mapFile?.statewide.statewideVoteGap ?? 0;
  const target = mapFile?.statewide.workingTargetWithCushion ?? 0;
  const pace = inferStatewidePace(counties);

  const topCountyContexts = candidateCountiesForTop10(counties).slice(0, topN);
  let topDecisions = topCountyContexts.map((c, i) => buildDecisionFromCounty(c, i + 1, weekKey, seasonId));
  topDecisions = applyKellyTier1Cap(topDecisions, seasonId);

  const kellyDeployment = topDecisions.filter((d) => d.resourceType === "kelly" && d.kellyTier <= 2);
  const volunteerDeployment = topDecisions.filter(
    (d) => d.resourceType === "volunteer" || d.resourceType === "county_chair" || d.resourceType === "phone_bank",
  );
  const fundraisingFromCounties = topCountyContexts
    .map((c) => resolveFundraisingUnlock(c))
    .filter((x): x is NonNullable<typeof x> => x != null)
    .slice(0, 3);

  const fundraisingDeployment: WeeklyCampaignDecision[] = fundraisingFromCounties.map((f, i) => ({
    id: `fund-${weekKey}-${i}`,
    rank: i + 1,
    weekKey,
    seasonId,
    countySlug: topCountyContexts[i]?.countySlug ?? "statewide",
    county: topCountyContexts[i]?.county ?? "Statewide",
    displayName: topCountyContexts[i]?.displayName ?? "Statewide",
    opsStatus: topCountyContexts[i]?.opsStatus ?? "yellow",
    recommendation: f.recommendation,
    resourceType: f.resourceType,
    kellyTier: f.kellyTier,
    expectedOutcome: f.expectedOutcome,
    reason: f.reason,
    electoralImportance: topCountyContexts[i]?.electoralImportance ?? "important",
    opportunityLevel: topCountyContexts[i]?.opportunityLevel ?? "medium",
    organizationalReadiness: topCountyContexts[i]?.organizationalReadiness ?? "moderate",
    deploymentPriority: topCountyContexts[i]?.deploymentPriority.deploymentPriority ?? 0,
    status: "pending",
    linkedMissionId: null,
  }));

  const countiesAtRisk = counties
    .filter(
      (c) =>
        (c.electoralImportance === "critical" || c.electoralImportance === "important") &&
        (c.opsStatus === "red" || c.opsStatus === "yellow"),
    )
    .slice(0, 12);

  const strategicOpportunities = counties
    .filter(
      (c) =>
        c.opportunityLevel === "high" &&
        c.electoralImportance !== "maintenance" &&
        c.organizationalReadiness !== "weak",
    )
    .slice(0, 10);

  const mapGateNote =
    mapFile?.classificationStatus !== "leadership_locked"
      ? " Victory Map is draft — CM leadership lock recommended before external action."
      : "";

  return {
    briefId: `brief-${weekKey}`,
    weekKey,
    generatedAt: asOf.toISOString(),
    seasonId,
    seasonLabel,
    publicationSafety: "INTERNAL_DRAFT",
    humanReviewRequired: true,
    statewideVictory: {
      pace,
      workingTargetWithCushion: target,
      statewideVoteGap: gap,
      summary: composeStatewideSummary(pace, gap, target, seasonLabel) + mapGateNote,
    },
    topDecisions,
    kellyDeployment,
    volunteerDeployment,
    fundraisingDeployment,
    countiesAtRisk,
    strategicOpportunities,
  };
}
