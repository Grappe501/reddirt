import type { CampaignState } from "../campaign-state-types";
import type { OrchestrationSourceHealth } from "../orchestration-source-health";
import type { CampaignUserRole } from "@/lib/agents/user-intelligence/user-personas";
import type { AgentToolingState } from "../tooling/agent-tooling-types";
import { PROHIBITED_EXECUTION_TYPES } from "../tooling/agent-tool-safety";
import type { CampaignSectionId, CrossDomainOrchestrationState } from "./cross-domain-orchestrator-types";
import { emptyCrossDomainOrchestrationState } from "./cross-domain-orchestrator-types";
import { CAMPAIGN_SECTION_MAP } from "./campaign-section-map";
import { buildCrossDomainDependencyGraph } from "./cross-domain-dependency-graph";
import { routeCrossDomainTools } from "./cross-domain-tool-router";
import { buildCrossDomainPlaybooks } from "./cross-domain-playbook-engine";
import { buildCrossDomainActionPackets } from "./cross-domain-action-packets";

export function buildCrossDomainOrchestrationState(input: {
  state: CampaignState;
  sourceHealth: OrchestrationSourceHealth[];
  agentTooling: AgentToolingState;
  role: CampaignUserRole;
  period: string;
  requestedSection?: CampaignSectionId;
}): CrossDomainOrchestrationState {
  const dependencyGraph = buildCrossDomainDependencyGraph({
    sections: CAMPAIGN_SECTION_MAP,
    state: input.state,
    sourceHealth: input.sourceHealth,
  });
  const routed = routeCrossDomainTools({
    state: input.state,
    sourceHealth: input.sourceHealth,
    sections: CAMPAIGN_SECTION_MAP,
    dependencyGraph,
    agentTooling: input.agentTooling,
    role: input.role,
    period: input.period,
    requestedSection: input.requestedSection,
  });
  const playbooks = buildCrossDomainPlaybooks(input.state, input.agentTooling);
  const actionPackets = buildCrossDomainActionPackets({
    state: input.state,
    playbooks,
    recommendedSectionFocus: routed.recommendedSectionFocus,
    agentTooling: input.agentTooling,
  });
  const learningHooks = playbooks.flatMap((p) => p.learningHooks);
  const sectionCoverage = CAMPAIGN_SECTION_MAP.map((section) => {
    const tools = routed.registry.filter((t) => section.ownedDomains.includes(t.domain) || t.domains.some((d) => section.ownedDomains.includes(d)));
    const readyToolCount = tools.filter((t) => t.status === "ready").length;
    const plannedToolCount = tools.filter((t) => t.status === "planned").length;
    const blockedToolCount = tools.filter((t) => t.status === "blocked" || t.safetyLevel === "prohibited").length;
    const coverageStatus: "strong" | "adequate" | "weak" | "missing" =
      readyToolCount >= 8 ? "strong" : readyToolCount >= 3 ? "adequate" : tools.length > 0 ? "weak" : "missing";
    return {
      sectionId: section.id,
      readyToolCount,
      plannedToolCount,
      blockedToolCount,
      coverageStatus,
      recommendedNextTool: routed.diagnoses.find((d) => d.sectionId === section.id)?.recommendedTools[0]?.title ?? `Build ${section.label} section router`,
    };
  });
  const approvalGateCount = actionPackets.reduce((sum, p) => sum + p.humanApprovalsRequired.length, 0);
  const focus = routed.recommendedSectionFocus;
  return {
    sectionMap: CAMPAIGN_SECTION_MAP,
    dependencyGraph,
    recommendedSectionFocus: focus,
    sectionDiagnoses: routed.diagnoses,
    playbooks,
    actionPackets,
    learningHooks,
    sectionCoverage,
    safetySummary: {
      autoExecutionDisabled: true,
      packetsArePreparationOnly: true,
      humanGateRequired: true,
      restrictedActions: [...PROHIBITED_EXECUTION_TYPES],
      approvalGateCount,
    },
    sourceHealth: input.sourceHealth,
    summary: focus
      ? `Focus ${focus.label}: ${focus.whyNeedsAttention} ${actionPackets.length} action packet(s), ${learningHooks.length} learning hook(s), execution disabled.`
      : "Cross-domain orchestrator found no section focus.",
  };
}

export { emptyCrossDomainOrchestrationState };
