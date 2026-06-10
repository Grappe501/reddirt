/**
 * Victory OS — AI helpers for Layer 1 Decision Engine (Sprint 1).
 */

import { weekKeyFromDate } from "@/lib/calendar/weekly-time";
import { generateWeeklyDecisionBrief } from "./decision-engine/generate-weekly-decisions";
import {
  loadOrGenerateWeeklyDecisionBrief,
  listWeeklyDecisionBriefWeekKeys,
} from "./decision-engine/load-decision-brief";
import type { WeeklyCampaignDecision, WeeklyDecisionBrief } from "./types";

export function composeWeeklyDecisionBriefSummary(brief: WeeklyDecisionBrief): string {
  const lines = [
    `Weekly Decision Brief · ${brief.weekKey} · ${brief.seasonLabel}`,
    brief.statewideVictory.summary,
    "",
    "Top 10 decisions:",
  ];
  for (const d of brief.topDecisions) {
    lines.push(
      `${d.rank}. ${d.displayName} (${d.opsStatus}) — ${d.recommendation} [${d.resourceType}, Kelly T${d.kellyTier}]`,
    );
  }
  lines.push("", `${brief.kellyDeployment.length} Kelly slots · ${brief.countiesAtRisk.length} counties at risk`);
  return lines.join("\n");
}

export function buildDecisionEngineAgentContext(weekKey?: string) {
  const wk = weekKey ?? weekKeyFromDate(new Date());
  const brief = loadOrGenerateWeeklyDecisionBrief(wk);
  return {
    publicationSafety: "INTERNAL_DRAFT" as const,
    humanReviewRequired: true as const,
    sprint: 1 as const,
    layer: "decision_engine" as const,
    weekKey: wk,
    seasonId: brief.seasonId,
    seasonLabel: brief.seasonLabel,
    statewideVictory: brief.statewideVictory,
    topDecisions: brief.topDecisions,
    kellyDeployment: brief.kellyDeployment,
    volunteerDeployment: brief.volunteerDeployment,
    fundraisingDeployment: brief.fundraisingDeployment,
    countiesAtRisk: brief.countiesAtRisk.slice(0, 8).map((c) => ({
      county: c.county,
      opsStatus: c.opsStatus,
      electoralImportance: c.electoralImportance,
      deploymentPriority: c.deploymentPriority.deploymentPriority,
    })),
    strategicOpportunities: brief.strategicOpportunities.slice(0, 6).map((c) => ({
      county: c.county,
      opportunityLevel: c.opportunityLevel,
      readiness: c.organizationalReadiness,
    })),
    briefSummary: composeWeeklyDecisionBriefSummary(brief),
    availableSnapshots: listWeeklyDecisionBriefWeekKeys().slice(0, 8),
    guardrails: [
      "Decisions are recommendations — CM must approve before Kelly deploy, comms, or spend.",
      "Never auto-schedule from this bundle.",
      "Vote math is planning scenario only.",
    ],
  };
}

export function findDecisionByCounty(brief: WeeklyDecisionBrief, countySlug: string): WeeklyCampaignDecision | null {
  return brief.topDecisions.find((d) => d.countySlug === countySlug) ?? null;
}

export { generateWeeklyDecisionBrief, loadOrGenerateWeeklyDecisionBrief };
