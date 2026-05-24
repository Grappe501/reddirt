import type { AgentToolCapability, AgentToolRecommendation, AgentToolSafetyLevel, AgentToolingState } from "../tooling/agent-tooling-types";
import { loadUnifiedAgentToolRegistry } from "../tooling/agent-tool-registry";
import type { CampaignRoleDefinition, RoleToolRoute } from "./role-copilot-types";

function highestSafety(tools: AgentToolCapability[]): AgentToolSafetyLevel {
  if (tools.some((t) => t.safetyLevel === "prohibited")) return "prohibited";
  if (tools.some((t) => t.safetyLevel === "approval_required")) return "approval_required";
  if (tools.some((t) => t.safetyLevel === "safe_prepare")) return "safe_prepare";
  return "safe_read";
}

function toRecommendation(role: CampaignRoleDefinition, tool: AgentToolCapability): AgentToolRecommendation {
  return {
    id: `role-tool:${role.id}:${tool.id}`.slice(0, 160),
    toolId: tool.id,
    title: `${role.label}: ${tool.label}`,
    summary: tool.description,
    whyNow: `${role.label} needs ${tool.label} to produce ${role.outputsProduced.slice(0, 2).join(" and ")}.`,
    campaignNeed: role.mission,
    domain: role.ownedDomains[0] ?? tool.domain,
    urgency: tool.safetyLevel === "prohibited" ? "P0" : role.id === "campaign_manager" ? "P1" : "P2",
    confidence: tool.status === "ready" ? "high" : tool.status === "partial" ? "medium" : "low",
    expectedOutput: tool.outputShape,
    expectedCampaignStateImprovement: role.whatThisRoleTeachesCampaignState,
    expectedKnowledgeGraphImprovement: `Adds role-specific ${role.ownedDomains.join(", ")} evidence to the campaign map.`,
    requiredHumanApproval: tool.requiresHumanApproval || tool.safetyLevel !== "safe_read",
    blockedBy: tool.blockers,
    suggestedInputs: { role: role.id, domains: role.ownedDomains.join(",") },
    doneWhen: `${role.label} reviews output and records outcome feedback.`,
    safety: tool.safetyLevel,
    sourceEvidence: role.requiredInputs,
  };
}

export function buildRoleToolRoute(role: CampaignRoleDefinition, tooling: AgentToolingState): RoleToolRoute {
  const registry = loadUnifiedAgentToolRegistry();
  const ids = new Set([...role.primaryTools, ...role.secondaryTools]);
  const tools = registry
    .filter((t) => ids.has(t.id) || role.ownedDomains.includes(t.domain) || t.domains.some((d) => role.ownedDomains.includes(d)))
    .slice(0, 8);
  const recommendedTools = tools.slice(0, 5).map((t) => toRecommendation(role, t));
  const fromGlobal = tooling.topRecommendedTools.filter((t) => role.ownedDomains.includes(t.domain)).slice(0, 2);
  const merged = [...new Map([...recommendedTools, ...fromGlobal].map((t) => [t.toolId, t])).values()].slice(0, 6);
  return {
    roleId: role.id,
    recommendedTools: merged,
    blockedTools: tools.filter((t) => t.status === "blocked" || t.safetyLevel === "prohibited").map((t) => t.id),
    approvalRequiredTools: tools.filter((t) => t.requiresHumanApproval || t.safetyLevel === "approval_required").map((t) => t.id),
    toolSequence: merged.map((t) => t.toolId),
    teachesCampaign: merged.map((t) => t.expectedCampaignStateImprovement),
    safety: {
      autoExecutionDisabled: true,
      humanGateRequired: true,
      highestSafetyLevel: highestSafety(tools),
    },
  };
}
