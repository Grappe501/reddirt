import type { CampaignState, CampaignDomainId } from "../campaign-state-types";
import type { OrchestrationSourceHealth } from "../orchestration-source-health";
import type { AgentToolingState } from "../tooling/agent-tooling-types";
import type { CrossDomainOrchestrationState } from "../cross-domain/cross-domain-orchestrator-types";
import type { ContinuousOptimizationSignal, ContinuousOptimizationState } from "./continuous-optimization-types";
import { emptyContinuousOptimizationState } from "./continuous-optimization-types";

function signal(input: Omit<ContinuousOptimizationSignal, "id">): ContinuousOptimizationSignal {
  return {
    id: `opt:${input.domain}:${input.title}`.replace(/[^a-zA-Z0-9:_-]/g, "_").slice(0, 140),
    ...input,
  };
}

function urgencyForDomain(state: CampaignState, domain: CampaignDomainId): ContinuousOptimizationSignal["urgency"] {
  const band = state.domainStatuses[domain]?.band;
  if (band === "critical") return "P0";
  if (band === "weak") return "P1";
  return "P2";
}

export function buildContinuousOptimizationState(input: {
  state: CampaignState;
  sourceHealth: OrchestrationSourceHealth[];
  agentTooling: AgentToolingState;
  crossDomainOrchestration: CrossDomainOrchestrationState;
}): ContinuousOptimizationState {
  const signals: ContinuousOptimizationSignal[] = [];

  for (const domain of input.state.weakDomains.slice(0, 5)) {
    signals.push(
      signal({
        title: `Strengthen ${domain.replaceAll("_", " ")}`,
        summary: input.state.domainStatuses[domain]?.summary ?? "Weak domain needs attention.",
        domain,
        urgency: urgencyForDomain(input.state, domain),
        confidence: "medium",
        sourceEvidence: [`domain:${domain}`, input.state.observationSummary],
        recommendedImprovement: `Run the best available ${domain.replaceAll("_", " ")} tool and capture feedback afterward.`,
        expectedCampaignStateImprovement: "Raises domain confidence and reduces blind spots in cross-domain reasoning.",
      }),
    );
  }

  for (const source of input.sourceHealth.filter((s) => s.status === "degraded" || s.status === "error" || s.status === "missing").slice(0, 4)) {
    signals.push(
      signal({
        title: `Repair source: ${source.label}`,
        summary: source.detail ?? `${source.label} is not fully ready.`,
        domain: "campaign_management",
        urgency: source.status === "error" ? "P0" : "P1",
        confidence: "high",
        sourceEvidence: [source.sourceId, source.status],
        recommendedImprovement: "Restore the source or document the known degradation before trusting recommendations.",
        expectedCampaignStateImprovement: "Improves CampaignState freshness and keeps blockers honest.",
      }),
    );
  }

  for (const gap of input.agentTooling.coverageByDomain.filter((c) => c.coverageStatus === "weak" || c.coverageStatus === "missing").slice(0, 4)) {
    signals.push(
      signal({
        title: `Improve tool coverage: ${gap.domainLabel}`,
        summary: gap.whyItMatters,
        domain: gap.domain,
        urgency: "P2",
        confidence: "medium",
        sourceEvidence: [`readyTools:${gap.readyToolCount}`, `plannedTools:${gap.plannedToolCount}`],
        recommendedImprovement: gap.recommendedNextTool,
        expectedCampaignStateImprovement: "Gives the agent better instruments to understand and repair the campaign map.",
      }),
    );
  }

  for (const warning of input.crossDomainOrchestration.dependencyGraph.dependencyWarnings.slice(0, 4)) {
    const focus = input.crossDomainOrchestration.recommendedSectionFocus;
    signals.push(
      signal({
        title: "Resolve dependency warning",
        summary: warning,
        domain: focus?.recommendedTools[0]?.domain ?? "campaign_management",
        sectionId: focus?.sectionId,
        urgency: "P1",
        confidence: "medium",
        sourceEvidence: ["crossDomainOrchestration.dependencyGraph"],
        recommendedImprovement: focus ? `Review ${focus.label} action packet first.` : "Review cross-domain dependency warnings.",
        expectedCampaignStateImprovement: "Prevents one weak section from quietly distorting downstream recommendations.",
      }),
    );
  }

  if (input.state.feedbackLoop.feedbackHealth.ignoredCount > 0 || input.state.feedbackLoop.feedbackHealth.failedCount > 0) {
    signals.push(
      signal({
        title: "Refresh recommendation feedback",
        summary: input.state.feedbackLoop.learningSummary,
        domain: "memory",
        sectionId: "memory_observations",
        urgency: "P1",
        confidence: "high",
        sourceEvidence: ["feedbackLoop.feedbackHealth"],
        recommendedImprovement: "Ask humans why recommendations were ignored or failed before repeating the same advice.",
        expectedCampaignStateImprovement: "Improves future recommendation confidence and lesson quality.",
      }),
    );
  }

  const ranked = signals.sort((a, b) => {
    const rank = { P0: 0, P1: 1, P2: 2 };
    return rank[a.urgency] - rank[b.urgency];
  });

  return {
    generatedAt: new Date().toISOString(),
    signals: ranked.slice(0, 15),
    weakDomainCount: input.state.weakDomains.length,
    staleFeedbackCount: input.state.feedbackLoop.feedbackHealth.ignoredCount + input.state.feedbackLoop.feedbackHealth.failedCount,
    toolGapCount: input.agentTooling.coverageByDomain.filter((c) => c.coverageStatus === "weak" || c.coverageStatus === "missing").length,
    dependencyWarningCount: input.crossDomainOrchestration.dependencyGraph.dependencyWarnings.length,
    recommendedNextImprovement: ranked[0] ?? null,
    safety: {
      readOnly: true,
      autoExecutionDisabled: true,
      humanGateRequired: true,
    },
    summary:
      ranked.length > 0
        ? `${ranked.length} optimization signal(s); next: ${ranked[0]!.title}.`
        : "No optimization signals beyond normal monitoring.",
  };
}

export { emptyContinuousOptimizationState };
