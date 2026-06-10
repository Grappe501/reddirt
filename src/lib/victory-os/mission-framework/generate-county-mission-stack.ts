/**
 * Victory OS Sprint 2 — generate four-level county mission stack from map + decisions.
 */

import type {
  CampaignVictorySeasonId,
  CountyMission,
  CountyMissionStack,
  CountyVictoryContext,
  WeeklyCampaignDecision,
} from "../types";
import { buildDailyTasksForWeeklyMission } from "./build-daily-tasks";

const LONG_TERM_PERIOD = "2026-general";

function monthKeyFromWeekKey(weekKey: string): string {
  return weekKey.slice(0, 7);
}

function missionId(countySlug: string, horizon: string, periodKey: string): string {
  return `mission-${horizon}-${countySlug}-${periodKey}`;
}

function longTermTitle(ctx: CountyVictoryContext): string {
  const gain = ctx.targetVoteGain ?? 0;
  const target = ctx.targetVotes ?? 0;
  if (gain > 0 && target > 0) {
    return `Close +${gain.toLocaleString()} vote gap toward ${target.toLocaleString()} county target`;
  }
  return `Hold and grow Democratic performance in ${ctx.county}`;
}

function longTermObjective(ctx: CountyVictoryContext): string {
  return `${ctx.displayName} contributes to statewide 50% + 1. Electoral importance: ${ctx.electoralImportance}. Maintain county presence through Election Day.`;
}

function longTermMetric(ctx: CountyVictoryContext): string {
  if (ctx.countyWinContribution != null) {
    return `County win contribution target: ${(ctx.countyWinContribution * 100).toFixed(1)}% of statewide margin (planning)`;
  }
  return "Meet or exceed county vote target in win scenario";
}

function monthlyContent(
  seasonId: CampaignVictorySeasonId,
  ctx: CountyVictoryContext,
): { title: string; objective: string; successMetric: string } {
  switch (seasonId) {
    case "season_1_build_organization":
      return {
        title: "Build county organization — chairs, captains, fair inventory",
        objective: `Establish executable field capacity in ${ctx.county}. Weak readiness counties prioritize chair + captain before visibility.`,
        successMetric: "Chair contacted · captain recruited or confirmed · fair/festival on inventory",
      };
    case "season_2_build_familiarity":
      return {
        title: "Build familiarity — Arkansas Summer Tour county presence",
        objective: `Increase voter awareness of Kelly in ${ctx.county}. Target meaningful visibility before Labor Day.`,
        successMetric: "County visit or surrogate event · 500+ voter contacts · volunteer recruitment",
      };
    case "season_3_build_confidence":
      return {
        title: "Build confidence — persuasion and message discipline",
        objective: `Persuasion contacts and consistent message in ${ctx.county}.`,
        successMetric: "Persuasion contacts · media reach · message track adherence",
      };
    case "season_4_build_turnout":
      return {
        title: "Build turnout — commitments and early vote",
        objective: `Convert supporters to votes in ${ctx.county}.`,
        successMetric: "Vote commitments · early vote pledges · shift coverage",
      };
    case "season_5_build_urgency":
      return {
        title: "Final push — close county gap daily",
        objective: `Daily progress toward county vote target in ${ctx.county}.`,
        successMetric: "Daily contact tally · gap vs target · deployment executed",
      };
    default:
      return {
        title: `Execute ${ctx.county} county plan through Election Day`,
        objective: "Align field execution with statewide victory path.",
        successMetric: "County target pace on planning scenario",
      };
  }
}

function weeklyFromDecision(decision: WeeklyCampaignDecision, weekKey: string): CountyMission {
  return {
    id: missionId(decision.countySlug, "weekly", weekKey),
    countySlug: decision.countySlug,
    horizon: "weekly",
    periodKey: weekKey,
    seasonId: decision.seasonId,
    title: decision.recommendation,
    objective: decision.reason,
    successMetric: decision.expectedOutcome,
    status: decision.status === "approved" ? "approved" : "proposed",
    linkedDecisionIds: [decision.id],
    resourceType: decision.resourceType,
    kellyTier: decision.kellyTier,
    updatedAt: new Date().toISOString(),
  };
}

function weeklyFromContext(
  ctx: CountyVictoryContext,
  seasonId: CampaignVictorySeasonId,
  weekKey: string,
): CountyMission {
  const isInfra = seasonId === "season_1_build_organization" && ctx.organizationalReadiness === "weak";
  return {
    id: missionId(ctx.countySlug, "weekly", weekKey),
    countySlug: ctx.countySlug,
    horizon: "weekly",
    periodKey: weekKey,
    seasonId,
    title: isInfra
      ? `Infrastructure week — chair, captain, and event pipeline in ${ctx.county}`
      : `Maintain ops rhythm in ${ctx.county}`,
    objective: `${ctx.electoralImportance} county · ${ctx.opsStatus} ops · priority ${ctx.deploymentPriority.deploymentPriority}`,
    successMetric: isInfra ? "Chair engaged · captain step completed · event on calendar" : "County touch logged · no ops regression",
    status: "proposed",
    resourceType: isInfra ? "county_chair" : "volunteer",
    kellyTier: 3,
    updatedAt: new Date().toISOString(),
  };
}

export type BuildStackInput = {
  ctx: CountyVictoryContext;
  seasonId: CampaignVictorySeasonId;
  weekKey: string;
  decision?: WeeklyCampaignDecision | null;
  existing?: CountyMissionStack | null;
};

export function buildCountyMissionStack(input: BuildStackInput): CountyMissionStack {
  const { ctx, seasonId, weekKey, decision, existing } = input;
  const monthKey = monthKeyFromWeekKey(weekKey);
  const now = new Date().toISOString();

  const longTerm: CountyMission = existing?.longTerm ?? {
    id: missionId(ctx.countySlug, "long-term", LONG_TERM_PERIOD),
    countySlug: ctx.countySlug,
    horizon: "long_term",
    periodKey: LONG_TERM_PERIOD,
    seasonId,
    title: longTermTitle(ctx),
    objective: longTermObjective(ctx),
    successMetric: longTermMetric(ctx),
    status: "in_progress",
    updatedAt: now,
  };

  const monthlyContent_ = monthlyContent(seasonId, ctx);
  const monthly: CountyMission = {
    id: missionId(ctx.countySlug, "monthly", monthKey),
    countySlug: ctx.countySlug,
    horizon: "monthly",
    periodKey: monthKey,
    seasonId,
    title: monthlyContent_.title,
    objective: monthlyContent_.objective,
    successMetric: monthlyContent_.successMetric,
    status: existing?.monthly?.periodKey === monthKey ? (existing.monthly?.status ?? "in_progress") : "in_progress",
    updatedAt: now,
  };

  const weekly: CountyMission = decision
    ? weeklyFromDecision(decision, weekKey)
    : weeklyFromContext(ctx, seasonId, weekKey);

  const dailyTasks = buildDailyTasksForWeeklyMission(weekly, weekKey, ctx.county);

  return {
    countySlug: ctx.countySlug,
    county: ctx.county,
    displayName: ctx.displayName,
    regionSlug: ctx.regionSlug,
    updatedAt: now,
    longTerm,
    monthly,
    weekly,
    dailyTasks,
  };
}

export function buildCountyFoundationStack(input: Omit<BuildStackInput, "decision"> & { decision?: null }): CountyMissionStack {
  const { ctx, seasonId, weekKey, existing } = input;
  const monthKey = monthKeyFromWeekKey(weekKey);
  const now = new Date().toISOString();

  const longTerm: CountyMission = existing?.longTerm ?? {
    id: missionId(ctx.countySlug, "long-term", LONG_TERM_PERIOD),
    countySlug: ctx.countySlug,
    horizon: "long_term",
    periodKey: LONG_TERM_PERIOD,
    seasonId,
    title: longTermTitle(ctx),
    objective: longTermObjective(ctx),
    successMetric: longTermMetric(ctx),
    status: "in_progress",
    updatedAt: now,
  };

  const monthlyContent_ = monthlyContent(seasonId, ctx);
  const monthly: CountyMission = {
    id: missionId(ctx.countySlug, "monthly", monthKey),
    countySlug: ctx.countySlug,
    horizon: "monthly",
    periodKey: monthKey,
    seasonId,
    title: monthlyContent_.title,
    objective: monthlyContent_.objective,
    successMetric: monthlyContent_.successMetric,
    status: existing?.monthly?.periodKey === monthKey ? (existing.monthly?.status ?? "in_progress") : "in_progress",
    updatedAt: now,
  };

  return {
    countySlug: ctx.countySlug,
    county: ctx.county,
    displayName: ctx.displayName,
    regionSlug: ctx.regionSlug,
    updatedAt: now,
    longTerm,
    monthly,
    weekly: existing?.weekly ?? null,
    dailyTasks: existing?.dailyTasks ?? [],
  };
}

export function summarizeMissionStack(stack: CountyMissionStack): string {
  const parts = [
    stack.displayName,
    stack.longTerm?.title,
    stack.monthly?.title,
    stack.weekly?.title,
    `${stack.dailyTasks.length} daily tasks`,
  ].filter(Boolean);
  return parts.join(" · ");
}
