/**
 * How tool usage improves campaign knowledge — learning hooks.
 */

import type { AgentToolCapability, AgentToolRecommendation } from "./agent-tooling-types";

export function describeToolLearningImpact(tool: AgentToolCapability): string {
  const parts = [tool.improvesCampaignUnderstandingHow];
  if (tool.producedLessons.length) parts.push(`May produce: ${tool.producedLessons.join(", ")}.`);
  if (tool.producedObservations.length) parts.push(`Observations: ${tool.producedObservations.join(", ")}.`);
  if (tool.knowledgeGraphInputs.length) parts.push(`Uses graph: ${tool.knowledgeGraphInputs.join(", ")}.`);
  return parts.join(" ");
}

export function rankToolsByLearningValue(tools: AgentToolCapability[]): AgentToolCapability[] {
  return [...tools].sort((a, b) => {
    const score = (t: AgentToolCapability) =>
      (t.producedLessons.length ? 3 : 0) +
      (t.producedObservations.length ? 2 : 0) +
      (t.knowledgeGraphInputs.length ? 2 : 0) +
      (t.status === "ready" ? 2 : 0);
    return score(b) - score(a);
  });
}

export function learningSummaryForRecommendation(rec: AgentToolRecommendation): string {
  return `${rec.expectedCampaignStateImprovement} ${rec.expectedKnowledgeGraphImprovement}`;
}
