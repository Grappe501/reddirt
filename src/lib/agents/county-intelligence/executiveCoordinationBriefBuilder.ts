import { loadCampaignBrainAgentRegistry } from "./campaignBrainAgentRegistry";
import { campaignBrainSynthesisEngine } from "./campaignBrainSynthesisEngine";
import { crossAgentInsightAggregator } from "./crossAgentInsightAggregator";
import { crossAgentConflictResolver } from "./crossAgentConflictResolver";
import { multiAgentReadinessAudit } from "./multiAgentReadinessAudit";
import { statewideInterventionCoordinator } from "./statewideInterventionCoordinator";
import type { ExecutiveCoordinationBrief } from "./multiAgentTypes";

export function executiveCoordinationBriefBuilder(countySlug: string): ExecutiveCoordinationBrief {
  const agents = loadCampaignBrainAgentRegistry().agents;
  const synthesis = campaignBrainSynthesisEngine(countySlug);
  const insights = crossAgentInsightAggregator(countySlug);
  const conflicts = crossAgentConflictResolver(countySlug);
  const audit = multiAgentReadinessAudit(countySlug);
  const statewide = statewideInterventionCoordinator();
  const countyName =
    statewide.rankedInterventions.find((x) => x.countySlug === countySlug)?.countyName ?? countySlug;

  return {
    countySlug,
    countyName,
    activeCopilots: agents.filter((x) => x.active).map((x) => x.label),
    crossAgentInsights: insights.insights.map((x) => `${x.label}: ${x.insight}`),
    synthesizedCountyStatus: synthesis.synthesizedStatus,
    operationalConflicts: conflicts.conflicts,
    readinessFusion: `SYNTHESIS: coordination confidence ${audit.coordinationConfidence}.`,
    statewideDependencies: [
      "County intelligence depends on institutional memory + operations + narrative + simulation layers.",
      "Executive coordination requires explicit conflict surfacing and human approvals.",
    ],
    executiveUrgency:
      statewide.rankedInterventions.find((x) => x.countySlug === countySlug)?.executiveUrgency ?? 0,
    coordinationConfidence: audit.coordinationConfidence,
    blockedCapabilities: synthesis.blockedCapabilities,
    requiredHumanApprovals: audit.requiredHumanApprovals,
  };
}

