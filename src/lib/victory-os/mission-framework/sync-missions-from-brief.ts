/**
 * Victory OS Sprint 2 — sync county mission stacks from weekly decision brief.
 * Links decisions ↔ weekly missions; seeds long/monthly for all 75 counties.
 */

import { loadVictoryMapCounties } from "../load-victory-map";
import type { CountyMissionSyncResult, WeeklyDecisionBrief } from "../types";
import { loadWeeklyDecisionBriefSnapshot, persistWeeklyDecisionBrief } from "../decision-engine/load-decision-brief";
import { buildCountyMissionStack, buildCountyFoundationStack } from "./generate-county-mission-stack";
import {
  buildEmptyRegistry,
  loadCountyMissionsRegistry,
  mergeStackIntoRegistry,
  persistCountyMissionsRegistry,
} from "./load-county-missions";

export type SyncMissionsOptions = {
  weekKey: string;
  /** Regenerate weekly+daily for counties not in top 10 but at-risk */
  includeAtRisk?: boolean;
};

export function syncCountyMissionsFromBrief(options: SyncMissionsOptions): CountyMissionSyncResult {
  const { weekKey, includeAtRisk = true } = options;
  const brief =
    loadWeeklyDecisionBriefSnapshot(weekKey) ??
    (() => {
      throw new Error(`No decision brief snapshot for week ${weekKey}. Run npm run victory:decisions first.`);
    })();

  const counties = loadVictoryMapCounties();
  const countyBySlug = new Map(counties.map((c) => [c.countySlug, c]));
  const decisionBySlug = new Map(brief.topDecisions.map((d) => [d.countySlug, d]));

  let registry = loadCountyMissionsRegistry() ?? buildEmptyRegistry(weekKey);
  registry.syncedWeekKey = weekKey;
  registry.syncedFromBriefId = brief.briefId;

  const slugsToSync = new Set<string>();
  for (const d of brief.topDecisions) slugsToSync.add(d.countySlug);
  if (includeAtRisk) {
    for (const c of brief.countiesAtRisk) slugsToSync.add(c.countySlug);
  }

  let weeklyMissionsCreated = 0;
  let dailyTasksCreated = 0;

  for (const countySlug of slugsToSync) {
    const ctx = countyBySlug.get(countySlug);
    if (!ctx) continue;
    const existing = registry.stacks.find((s) => s.countySlug === countySlug) ?? null;
    const decision = decisionBySlug.get(countySlug) ?? null;
    const stack = buildCountyMissionStack({
      ctx,
      seasonId: brief.seasonId,
      weekKey,
      decision,
      existing,
    });
    if (stack.weekly) weeklyMissionsCreated += 1;
    dailyTasksCreated += stack.dailyTasks.length;
    registry = mergeStackIntoRegistry(registry, stack);
  }

  for (const ctx of counties) {
    if (slugsToSync.has(ctx.countySlug)) continue;
    const existing = registry.stacks.find((s) => s.countySlug === ctx.countySlug) ?? null;
    if (existing?.longTerm && existing?.monthly?.periodKey === weekKey.slice(0, 7)) continue;
    const stack = buildCountyFoundationStack({
      ctx,
      seasonId: brief.seasonId,
      weekKey,
      existing,
    });
    registry = mergeStackIntoRegistry(registry, stack);
  }

  const registryPath = persistCountyMissionsRegistry(registry);

  let decisionsLinked = 0;
  const updatedDecisions = brief.topDecisions.map((d) => {
    const stack = registry.stacks.find((s) => s.countySlug === d.countySlug);
    const missionId = stack?.weekly?.id ?? null;
    if (missionId) decisionsLinked += 1;
    return { ...d, linkedMissionId: missionId };
  });

  const updatedBrief: WeeklyDecisionBrief = {
    ...brief,
    topDecisions: updatedDecisions,
    kellyDeployment: brief.kellyDeployment.map((d) => {
      const stack = registry.stacks.find((s) => s.countySlug === d.countySlug);
      return { ...d, linkedMissionId: stack?.weekly?.id ?? d.linkedMissionId };
    }),
    volunteerDeployment: brief.volunteerDeployment.map((d) => {
      const stack = registry.stacks.find((s) => s.countySlug === d.countySlug);
      return { ...d, linkedMissionId: stack?.weekly?.id ?? d.linkedMissionId };
    }),
  };
  persistWeeklyDecisionBrief(updatedBrief);

  return {
    weekKey,
    briefId: brief.briefId,
    stacksUpdated: registry.stacks.length,
    weeklyMissionsCreated,
    dailyTasksCreated,
    decisionsLinked,
    registryPath,
  };
}
