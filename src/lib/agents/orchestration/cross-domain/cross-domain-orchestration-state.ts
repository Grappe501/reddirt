import type { CampaignUserRole } from "@/lib/agents/user-intelligence/user-personas";
import type { CampaignState } from "../campaign-state-types";
import type { OrchestrationSourceHealth } from "../orchestration-source-health";
import { loadUnifiedAgentToolRegistry } from "../tooling/agent-tool-registry";
import type { AgentToolingState } from "../tooling/agent-tooling-types";
import { PROHIBITED_EXECUTION_TYPES } from "../tooling/agent-tool-safety";
import { CAMPAIGN_SECTION_MAP } from "./campaign-section-map";
import { buildCrossDomainDependencyGraph } from "./cross-domain-dependency-graph";
import { routeCrossDomainTools } from "./cross-domain-tool-router";
import { buildCrossDomainActionPackets } from "./cross-domain-action-packets";
import { attachPacketIdsToHooks, buildLearningHooksForPlaybook } from "./cross-domain-learning-hooks";
import type {
  CampaignSectionId,
  CrossDomainOrchestrationState,
  CrossDomainSectionCoverage,
} from "./cross-domain-orchestrator-types";
import { emptyCrossDomainOrchestrationState } from "./cross-domain-orchestrator-types";

function coverageForSections(router: ReturnType<typeof routeCrossDomainTools>): CrossDomainSectionCoverage[] {
  return CAMPAIGN_SECTION_MAP.map((section) => {
    const recs = router.recommendedToolsBySection[section.id] ?? [];
    const readyToolCount = recs.filter((r) => r.confidence === "high" || r.confidence === "medium").length;
    const blockedToolCount = router.blockedTools.filter((id) => section.primaryTools.includes(id) || section.relatedTools.includes(id)).length;
    const coverageStatus =
      readyToolCount >= 4 ? "strong" : readyToolCount >= 2 ? "adequate" : readyToolCount === 1 ? "weak" : "missing";
    return {
      sectionId: section.id,
      readyToolCount,
      blockedToolCount,
      coverageStatus,
      bestNextTool: recs[0]?.title,
    };
  });
}

export function buildCrossDomainOrchestrationState(input: {
  state: CampaignState;
  sourceHealth: OrchestrationSourceHealth[];
  agentTooling: AgentToolingState;
  role: CampaignUserRole;
  period: string;
  requestedSection?: CampaignSectionId;
}): CrossDomainOrchestrationState {
  const registry = loadUnifiedAgentToolRegistry();
  const dependencyGraph = buildCrossDomainDependencyGraph(input.state);
  const router = routeCrossDomainTools({
    state: input.state,
    sourceHealth: input.sourceHealth,
    registry,
    agentTooling: input.agentTooling,
    dependencyGraph,
    role: input.role,
    period: input.period,
    requestedSection: input.requestedSection,
  });
  const playbooks = router.crossSectionSequences;
  const actionPackets = buildCrossDomainActionPackets(input.state, input.agentTooling, playbooks);
  const hooks = playbooks.flatMap((p) => {
    const packetId = actionPackets.find((packet) => packet.playbookId === p.id)?.id;
    const base = buildLearningHooksForPlaybook(p);
    return packetId ? attachPacketIdsToHooks(base, packetId) : base;
  });
  const restrictedActions = [...new Set([...PROHIBITED_EXECUTION_TYPES.map(String), ...router.humanApprovalGates])];
  const focus = router.recommendedSectionFocus;

  return {
    sectionMap: CAMPAIGN_SECTION_MAP,
    dependencyGraph,
    recommendedSectionFocus: focus,
    playbooks,
    actionPackets,
    learningHooks: hooks,
    sectionCoverage: coverageForSections(router),
    safetySummary: {
      autoExecutionDisabled: true,
      humanGateRequired: true,
      packetCount: actionPackets.length,
      restrictedActions,
      unsafeExecutionButtonsExposed: false,
    },
    summary: focus
      ? `Focus ${focus.label}: ${focus.summary} It affects ${focus.affectedSections.length} section(s) and has ${focus.recommendedTools.length} recommended tool(s).`
      : "Cross-domain section coverage loaded; no focus selected.",
  };
}

export { emptyCrossDomainOrchestrationState };
