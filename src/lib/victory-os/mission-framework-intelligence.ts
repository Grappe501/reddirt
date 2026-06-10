/**
 * Victory OS Sprint 2 — AI helpers for county mission framework.
 */

import {
  loadAllCountyMissionStacks,
  loadCountyMissionStack,
  loadCountyMissionsRegistry,
  listTopDecisionMissionStacks,
} from "./mission-framework/load-county-missions";
import { summarizeMissionStack } from "./mission-framework/generate-county-mission-stack";
import type { CountyMissionStack } from "./types";

export function composeCountyMissionStackBrief(countySlug: string): string | null {
  const stack = loadCountyMissionStack(countySlug);
  if (!stack) return null;
  const lines = [
    `${stack.displayName} mission stack`,
    `Long-term: ${stack.longTerm?.title ?? "—"}`,
    `Monthly: ${stack.monthly?.title ?? "—"}`,
    `Weekly: ${stack.weekly?.title ?? "—"}`,
    "Daily tasks:",
  ];
  for (const t of stack.dailyTasks) {
    lines.push(`  · ${t.periodKey} [${t.assigneeRole}] ${t.title} (${t.status})`);
  }
  return lines.join("\n");
}

export function buildCountyMissionAgentContext(countySlug?: string) {
  const reg = loadCountyMissionsRegistry();
  if (countySlug) {
    const stack = loadCountyMissionStack(countySlug);
    return {
      publicationSafety: "INTERNAL_DRAFT" as const,
      humanReviewRequired: true as const,
      sprint: 2 as const,
      layer: "county_missions" as const,
      countySlug,
      stack,
      brief: stack ? composeCountyMissionStackBrief(countySlug) : null,
      guardrails: ["Missions link to decisions — CM approves before execution.", "Daily tasks are field checklist only."],
    };
  }
  const topStacks = listTopDecisionMissionStacks(10);
  return {
    publicationSafety: "INTERNAL_DRAFT" as const,
    humanReviewRequired: true as const,
    sprint: 2 as const,
    layer: "county_missions" as const,
    syncedWeekKey: reg?.syncedWeekKey ?? null,
    countyCount: reg?.countyCount ?? 0,
    topMissionStacks: topStacks.map((s) => ({
      countySlug: s.countySlug,
      county: s.county,
      weeklyTitle: s.weekly?.title,
      dailyTaskCount: s.dailyTasks.length,
      summary: summarizeMissionStack(s),
    })),
    guardrails: ["No auto-schedule from mission tasks.", "Calendar tactics are downstream of missions."],
  };
}

export function auditCountyMissionsRegistry(): { severity: string; code: string; message: string }[] {
  const findings: { severity: string; code: string; message: string }[] = [];
  const reg = loadCountyMissionsRegistry();
  if (!reg) {
    findings.push({ severity: "critical", code: "NO_REGISTRY", message: "County missions registry missing. Run npm run victory:missions:sync." });
    return findings;
  }
  if (reg.countyCount < 75) {
    findings.push({
      severity: "warn",
      code: "INCOMPLETE_REGISTRY",
      message: `Registry has ${reg.countyCount} counties; 75 expected after full sync.`,
    });
  }
  const withoutWeekly = reg.stacks.filter((s) => !s.weekly).length;
  if (withoutWeekly > 0) {
    findings.push({ severity: "info", code: "MISSING_WEEKLY", message: `${withoutWeekly} stacks missing weekly mission.` });
  }
  return findings;
}

export type { CountyMissionStack };
