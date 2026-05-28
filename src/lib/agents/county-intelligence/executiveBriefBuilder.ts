import { loadExecutiveBriefRegistry } from "./executiveCommandStateBuilder";
import type { ExecutiveCommandBrief } from "./executiveCommandTypes";

const BLOCKED_AUTOMATION_MATRIX = [
  "No autonomous campaign execution.",
  "No autonomous outreach.",
  "No autonomous resource allocation.",
  "No autonomous final campaign strategy generation.",
  "No voter targeting or contact-list generation.",
] as const;

export function executiveBriefBuilder(countySlug: string): ExecutiveCommandBrief {
  const row = loadExecutiveBriefRegistry().rows.find((x) => x.countySlug === countySlug);
  if (!row) {
    return {
      countySlug,
      countyName: countySlug,
      readinessSummary: "MISSING readiness summary.",
      prioritySummary: "MISSING priority summary.",
      bottleneckSummary: ["MISSING bottleneck summary."],
      interventionSummary: ["MISSING intervention summary."],
      regionalPressureSummary: "MISSING regional pressure summary.",
      campaignHealthSummary: "MISSING campaign health summary.",
      alerts: ["MISSING alert stream entry."],
      confidence: 0,
      blockedAutomationMatrix: [...BLOCKED_AUTOMATION_MATRIX],
      requiredHumanApprovals: ["Human approval required before any operational execution."],
    };
  }

  return {
    countySlug: row.countySlug,
    countyName: row.countyName,
    readinessSummary: row.executiveBrief,
    prioritySummary: row.executiveBrief,
    bottleneckSummary: ["SIGNAL: operational bottlenecks require human-reviewed intervention sequencing."],
    interventionSummary: ["TREND: prioritize interventions by statewide urgency and confidence."],
    regionalPressureSummary: "TREND: regional pressure synthesized from multi-agent coordination and operations layers.",
    campaignHealthSummary: "FORECAST: campaign health is monitored as decision-support only.",
    alerts: ["SIGNAL: executive attention required for high-urgency counties."],
    confidence: row.confidence,
    blockedAutomationMatrix: [...BLOCKED_AUTOMATION_MATRIX],
    requiredHumanApprovals: row.requiredHumanApprovals,
  };
}

