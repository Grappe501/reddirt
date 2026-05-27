import { agentRuntimeCoordinator } from "./agentRuntimeCoordinator";
import { crossAgentInsightAggregator } from "./crossAgentInsightAggregator";

export function campaignBrainSynthesisEngine(countySlug: string) {
  const coordination = agentRuntimeCoordinator(countySlug);
  const insights = crossAgentInsightAggregator(countySlug);
  return {
    countySlug,
    synthesizedStatus: `SYNTHESIS: readiness ${coordination.synthesizedReadiness} with coordination confidence ${coordination.coordinationConfidence}.`,
    crossAgentInsights: insights.insights.map((x) => `${x.label}: ${x.insight}`),
    blockedCapabilities: coordination.blockedCapabilities,
  };
}

