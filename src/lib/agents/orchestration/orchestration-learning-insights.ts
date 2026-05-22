/**
 * Deterministic “How the AI gets smarter” insights from orchestration payload.
 */

import type { OrchestrationStatePayload } from "./build-orchestration-payload";
import { ORCHESTRATION_DOMAINS } from "./orchestration-domains";

export type OrchestrationLearningInsight = {
  weakDomains: { id: string; label: string; summary: string }[];
  missingSources: { sourceId: string; label: string; detail?: string }[];
  neededObservations: string[];
  toolCoverageGaps: string[];
  recommendedImprovements: string[];
  knowsSummary: string;
  unknownSummary: string;
};

export function buildOrchestrationLearningInsights(payload: OrchestrationStatePayload): OrchestrationLearningInsight {
  const { campaignState, sourceHealth, diagnosis } = payload;
  const domainLabel = (id: string) => ORCHESTRATION_DOMAINS.find((d) => d.id === id)?.label ?? id;

  const weakDomains = campaignState.weakDomains.map((id) => ({
    id,
    label: domainLabel(id),
    summary: campaignState.domainStatuses[id]?.summary ?? "Weak signal",
  }));

  const missingSources = sourceHealth
    .filter((s) => s.status === "error" || s.status === "missing" || s.status === "degraded")
    .map((s) => ({ sourceId: s.sourceId, label: s.label, detail: s.detail }));

  const neededObservations: string[] = [];
  if (campaignState.memoryObservationSummary.frictionSignals >= 2) {
    neededObservations.push("Wire more UI events to observation stream where operators abandon flows.");
  }
  if (campaignState.memoryObservationSummary.recentObservationCount < 10) {
    neededObservations.push("Increase observation density — AI lacks recent operator behavior signals.");
  }
  if (campaignState.toolCoverage.degradedSources > 0) {
    neededObservations.push("Resolve degraded signal loaders so blockers reflect live domain truth.");
  }

  const toolCoverageGaps = diagnosis.toolBuildGaps.slice(0, 5);
  if (campaignState.toolBuildActions.length === 0) {
    toolCoverageGaps.push("Review tool-builder queue for friction-derived engineering tickets.");
  }

  const recommendedImprovements: string[] = [];
  if (!campaignState.countyIntelligenceSummary.bridgeAvailable) {
    recommendedImprovements.push("Connect countyWorkbench bridge for full county cognition.");
  }
  if (campaignState.emailEccReadiness.sendEnabled === false) {
    recommendedImprovements.push("ECC send path remains gated — orchestration will recommend drafts only until human enables send.");
  }
  if (campaignState.operatingMode === "degraded") {
    recommendedImprovements.push("Clear partial signal failures to reach live operating mode.");
  }
  for (const w of weakDomains.slice(0, 3)) {
    recommendedImprovements.push(`Strengthen ${w.label}: ${w.summary}`);
  }

  const km = campaignState.knowledge;
  const readyCount = sourceHealth.filter((s) => s.status === "ready").length;
  const knowsSummary = `${readyCount}/${sourceHealth.length} signal sources ready · ${campaignState.strongDomains.length} strong domains · ${km.graphHealth.entityCount} graph entities · ${km.graphHealth.lessonCount} lessons · confidence ${diagnosis.confidenceLevel}.`;
  const unknownParts: string[] = [];
  if (missingSources.length > 0) {
    unknownParts.push(`Missing/degraded sources: ${missingSources.map((s) => s.label).join(", ")}`);
  }
  if (km.knowledgeGaps.length > 0) {
    unknownParts.push(`${km.knowledgeGaps.length} knowledge gap(s)`);
  }
  if (km.graphHealth.missingSources.length > 0) {
    unknownParts.push(km.graphHealth.missingSources[0]!);
  }
  const unknownSummary =
    unknownParts.length > 0 ? unknownParts.join(" · ") : "All configured signal sources loaded — focus on weak domain interpretation.";

  if (km.recommendationFeedbackSummary.total < 5) {
    neededObservations.push("Record recommendation feedback (accepted/rejected/successful) so the AI learns which advice worked.");
  }
  for (const gap of km.knowledgeGaps.slice(0, 2)) {
    recommendedImprovements.push(`${gap.title}: ${gap.recommendedFollowup ?? gap.summary}`);
  }
  for (const pattern of km.strongestLessons.filter((l) => l.type === "emerging_pattern").slice(0, 2)) {
    recommendedImprovements.push(`Review emerging pattern: ${pattern.title}`);
  }

  return {
    weakDomains,
    missingSources,
    neededObservations,
    toolCoverageGaps,
    recommendedImprovements: [...new Set(recommendedImprovements)].slice(0, 8),
    knowsSummary,
    unknownSummary,
  };
}
