import type { CampaignState } from "../campaign-state-types";
import type { OrchestrationSourceHealth } from "../orchestration-source-health";
import type { CampaignUserRole } from "@/lib/agents/user-intelligence/user-personas";
import type { AgentToolCapability, AgentToolRecommendation, AgentToolingState } from "../tooling/agent-tooling-types";
import { loadUnifiedAgentToolRegistry } from "../tooling/agent-tool-registry";
import type {
  CampaignSection,
  CampaignSectionId,
  CrossDomainDependencyGraph,
  SectionToolDiagnosis,
} from "./cross-domain-orchestrator-types";
import { buildLearningHook } from "./cross-domain-learning-hooks";

function urgencyForHealth(health: SectionToolDiagnosis["health"]): AgentToolRecommendation["urgency"] {
  if (health === "blocked") return "P0";
  if (health === "weak") return "P1";
  return "P2";
}

function toolsForSection(section: CampaignSection, registry: AgentToolCapability[]): AgentToolCapability[] {
  const ids = new Set([...section.primaryTools, ...section.relatedTools]);
  const byId = registry.filter((t) => ids.has(t.id) || section.primaryTools.some((p) => t.id.includes(p) || t.label.toLowerCase().includes(p.replaceAll("-", " "))));
  const byDomain = registry.filter((t) => section.ownedDomains.includes(t.domain) || t.domains.some((d) => section.ownedDomains.includes(d)));
  return [...new Map([...byId, ...byDomain].map((t) => [t.id, t])).values()].slice(0, 8);
}

function rec(section: CampaignSection, tool: AgentToolCapability, health: SectionToolDiagnosis["health"], evidence: string[]): AgentToolRecommendation {
  return {
    id: `cross-domain:${section.id}:${tool.id}`.slice(0, 160),
    toolId: tool.id,
    title: `${section.label}: ${tool.label}`,
    summary: tool.description,
    whyNow:
      health === "blocked" || health === "weak"
        ? `${section.label} needs attention and affects ${section.downstreamDependencies.slice(0, 3).join(", ")}.`
        : `${section.label} can improve the campaign map with fresh section intelligence.`,
    campaignNeed: section.mission,
    domain: section.ownedDomains[0] ?? "campaign_management",
    urgency: urgencyForHealth(health),
    confidence: tool.status === "ready" ? "high" : tool.status === "partial" ? "medium" : "low",
    expectedOutput: tool.outputShape,
    expectedCampaignStateImprovement: section.improvesCampaignUnderstandingHow,
    expectedKnowledgeGraphImprovement: `Adds/refreshes ${section.knowledgeGraphEntityTypes.join(", ")} context.`,
    requiredHumanApproval: tool.requiresHumanApproval || tool.safetyLevel !== "safe_read",
    blockedBy: tool.blockers,
    suggestedInputs: {
      section: section.id,
      role: section.humanOwners[0] ?? "campaign_manager",
    },
    doneWhen: `Human can review a ${section.label} packet and record outcome feedback.`,
    safety: tool.safetyLevel,
    sourceEvidence: evidence,
  };
}

export function routeCrossDomainTools(input: {
  state: CampaignState;
  sourceHealth: OrchestrationSourceHealth[];
  sections: CampaignSection[];
  dependencyGraph: CrossDomainDependencyGraph;
  agentTooling: AgentToolingState;
  role: CampaignUserRole;
  period: string;
  requestedSection?: CampaignSectionId;
}): { diagnoses: SectionToolDiagnosis[]; recommendedSectionFocus: SectionToolDiagnosis | null; registry: AgentToolCapability[] } {
  const registry = loadUnifiedAgentToolRegistry();
  const nodeMap = new Map(input.dependencyGraph.nodes.map((n) => [n.id, n]));
  const requested = input.requestedSection ? new Set([input.requestedSection]) : null;

  const diagnoses = input.sections
    .filter((section) => !requested || requested.has(section.id))
    .map((section) => {
      const node = nodeMap.get(section.id);
      const health = node?.health ?? "stable";
      const tools = toolsForSection(section, registry);
      const evidence = [
        ...section.campaignStateFields,
        ...input.sourceHealth.filter((s) => section.sourceHealthIds.includes(s.sourceId)).map((s) => `${s.label}:${s.status}`),
      ];
      const recommendedTools = tools.slice(0, 5).map((t) => rec(section, t, health, evidence));
      const affectedSections = input.dependencyGraph.edges.filter((e) => e.from === section.id).map((e) => e.to);
      return {
        sectionId: section.id,
        label: section.label,
        health,
        whyNeedsAttention:
          health === "blocked"
            ? `${section.label} is blocked by degraded source or critical domain health.`
            : health === "weak"
              ? `${section.label} is weak and can unlock ${affectedSections.slice(0, 3).join(", ")}.`
              : `${section.label} is a useful section to refresh for campaign map accuracy.`,
        affectedSections,
        recommendedTools,
        blockedTools: tools.filter((t) => t.status === "blocked" || t.safetyLevel === "prohibited").map((t) => t.id),
        missingTools: tools.length === 0 ? [`Build ${section.id} section intelligence tool`] : [],
        humanApprovalGates: [...new Set([...section.restrictedActions, ...section.humanOwners.map((o) => `${o} review`)])],
        expectedLearningOutputs: [
          buildLearningHook({
            playbookId: `section-router:${section.id}`,
            sectionId: section.id,
            prompt: `After using ${section.label} tools, did the packet improve CampaignState and what did humans correct?`,
            lesson: section.ownedDomains.includes("county") ? "county_learning" : "workflow_learning",
            sensitivity: section.restrictedActions.includes("sensitive_memory_auto_store") ? "strategic" : "internal",
          }),
        ],
      } satisfies SectionToolDiagnosis;
    });

  const sortedDiagnoses = [...diagnoses].sort((a, b) => {
      const rank = { blocked: 0, weak: 1, stable: 2, strong: 3 };
      const aLeverage = input.dependencyGraph.highLeverageSections.includes(a.sectionId) ? -1 : 0;
      const bLeverage = input.dependencyGraph.highLeverageSections.includes(b.sectionId) ? -1 : 0;
      return rank[a.health] + aLeverage - (rank[b.health] + bLeverage);
    });
  const recommendedSectionFocus = sortedDiagnoses[0] ?? null;

  return { diagnoses, recommendedSectionFocus, registry };
}
