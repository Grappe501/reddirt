import type { CampaignState } from "../campaign-state-types";
import type { OrchestrationSourceHealth } from "../orchestration-source-health";
import type { AgentToolCapability, AgentToolRecommendation, AgentToolingState } from "../tooling/agent-tooling-types";
import type { CampaignUserRole } from "@/lib/agents/user-intelligence/user-personas";
import type {
  CampaignSectionId,
  CrossDomainDependencyGraph,
  CrossDomainRouterResult,
  SectionDiagnosis,
} from "./cross-domain-orchestrator-types";
import { CAMPAIGN_SECTION_MAP } from "./campaign-section-map";
import { buildCrossDomainPlaybooks } from "./cross-domain-playbook-engine";
import { buildLearningHooksForPlaybook } from "./cross-domain-learning-hooks";

export type CrossDomainToolRouterInput = {
  state: CampaignState;
  sourceHealth: OrchestrationSourceHealth[];
  registry: AgentToolCapability[];
  agentTooling: AgentToolingState;
  dependencyGraph: CrossDomainDependencyGraph;
  role: CampaignUserRole;
  period: string;
  requestedSection?: CampaignSectionId;
};

function toRecommendation(tool: AgentToolCapability, sectionId: CampaignSectionId, period: string, whyNow: string): AgentToolRecommendation {
  return {
    id: `section:${sectionId}:tool:${tool.id}`,
    toolId: tool.id,
    title: tool.label,
    summary: tool.description,
    whyNow,
    campaignNeed: `Improve ${sectionId.replaceAll("_", " ")} section intelligence`,
    domain: tool.domain,
    urgency: "P1",
    confidence: tool.status === "ready" ? "high" : tool.status === "partial" ? "medium" : "low",
    expectedOutput: tool.outputShape,
    expectedCampaignStateImprovement: `Improves section fields: ${tool.campaignStateInputs.join(", ") || tool.domain}.`,
    expectedKnowledgeGraphImprovement: tool.improvesCampaignUnderstandingHow,
    requiredHumanApproval: tool.requiresHumanApproval,
    blockedBy: tool.status === "blocked" || tool.status === "planned" ? tool.blockers : [],
    suggestedInputs: { period, sectionId },
    doneWhen: `Human reviewed ${tool.label} output for ${sectionId.replaceAll("_", " ")}.`,
    safety: tool.safetyLevel,
    sourceEvidence: [tool.category, ...tool.sourcePaths.slice(0, 2)],
  };
}

function urgencyForSection(sectionId: CampaignSectionId, input: CrossDomainToolRouterInput): SectionDiagnosis["urgency"] {
  if (input.dependencyGraph.blockedSections.includes(sectionId)) return "P0";
  if (input.dependencyGraph.weakSections.includes(sectionId) || input.dependencyGraph.highLeverageSections.includes(sectionId)) return "P1";
  return "P2";
}

function sectionSummary(sectionId: CampaignSectionId, input: CrossDomainToolRouterInput): string {
  const node = input.dependencyGraph.nodes.find((n) => n.id === sectionId);
  const section = CAMPAIGN_SECTION_MAP.find((s) => s.id === sectionId);
  const sourceGaps = input.sourceHealth.filter((s) => section?.sourceHealthIds.includes(s.sourceId) && s.status !== "ready");
  if (sourceGaps.length) return `${section?.label} has degraded source health: ${sourceGaps.map((s) => s.label).join(", ")}.`;
  if (node?.health === "blocked") return `${section?.label} is blocked and should be reviewed before dependent sections move.`;
  if (node?.health === "weak") return `${section?.label} is weak and affects ${section?.downstreamDependencies.join(", ") || "other sections"}.`;
  return section?.mission ?? "Section ready for review.";
}

export function routeCrossDomainTools(input: CrossDomainToolRouterInput): CrossDomainRouterResult {
  const requested = input.requestedSection;
  const sections = requested ? CAMPAIGN_SECTION_MAP.filter((s) => s.id === requested) : CAMPAIGN_SECTION_MAP;
  const playbooks = buildCrossDomainPlaybooks(input.state, input.agentTooling);
  const allLearningHooks = playbooks.flatMap((p) => buildLearningHooksForPlaybook(p));
  const recommendedToolsBySection = {} as CrossDomainRouterResult["recommendedToolsBySection"];
  const diagnoses: SectionDiagnosis[] = [];
  const blockedTools = new Set<string>();
  const humanApprovalGates = new Set<string>();

  for (const section of sections) {
    const sectionTools = input.registry
      .filter(
        (tool) =>
          section.primaryTools.includes(tool.id) ||
          section.relatedTools.includes(tool.id) ||
          section.ownedDomains.some((d) => tool.domains.includes(d) || tool.domain === d),
      )
      .slice(0, 8);
    const recommendations = sectionTools
      .filter((tool) => tool.status !== "deprecated")
      .slice(0, 5)
      .map((tool) => toRecommendation(tool, section.id, input.period, sectionSummary(section.id, input)));
    recommendedToolsBySection[section.id] = recommendations;
    for (const tool of sectionTools.filter((t) => t.status === "blocked" || t.safetyLevel === "prohibited")) {
      blockedTools.add(tool.id);
    }
    for (const gate of section.restrictedActions) humanApprovalGates.add(gate);

    diagnoses.push({
      sectionId: section.id,
      label: section.label,
      urgency: urgencyForSection(section.id, input),
      confidence: recommendations.some((r) => r.confidence === "high") ? "high" : recommendations.length ? "medium" : "low",
      summary: sectionSummary(section.id, input),
      affectedSections: section.downstreamDependencies,
      recommendedTools: recommendations,
      blockedTools: sectionTools.filter((t) => t.status === "blocked" || t.safetyLevel === "prohibited").map((t) => t.id),
      missingTools: input.agentTooling.missingTools.filter((m) => section.ownedDomains.includes(m.domain)),
      humanApprovalGates: section.restrictedActions,
      expectedLearningOutputs: allLearningHooks.filter((h) => h.sectionId === section.id),
    });
  }

  const recommendedSectionFocus =
    diagnoses
      .filter((d) => d.recommendedTools.length > 0)
      .sort((a, b) => {
        const rank = { P0: 0, P1: 1, P2: 2 };
        return rank[a.urgency] - rank[b.urgency] || b.affectedSections.length - a.affectedSections.length;
      })[0] ?? null;

  return {
    sectionDiagnoses: diagnoses,
    recommendedToolsBySection,
    crossSectionSequences: playbooks,
    blockedTools: [...blockedTools],
    missingTools: input.agentTooling.missingTools,
    humanApprovalGates: [...humanApprovalGates],
    expectedLearningOutputs: allLearningHooks,
    recommendedSectionFocus,
  };
}
