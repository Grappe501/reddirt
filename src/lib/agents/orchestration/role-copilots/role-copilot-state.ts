import type { CampaignState } from "../campaign-state-types";
import type { AgentToolingState } from "../tooling/agent-tooling-types";
import type { CrossDomainOrchestrationState } from "../cross-domain/cross-domain-orchestrator-types";
import { PROHIBITED_EXECUTION_TYPES } from "../tooling/agent-tool-safety";
import { CAMPAIGN_ROLE_REGISTRY, getCampaignRole } from "./campaign-role-registry";
import { buildRoleBriefing } from "./role-briefing-engine";
import { buildRoleLearningPrompts } from "./role-learning-prompts";
import { buildRoleToolRoute } from "./role-tool-router";
import { buildRoleWorkflowPlan } from "./role-workflow-planner";
import { buildRoleTrainingPlan } from "./role-training-engine";
import type { CampaignOrchestrationRoleId, RoleCopilotNetworkState } from "./role-copilot-types";
import { emptyRoleCopilotNetworkState } from "./role-copilot-types";

export function buildRoleCopilotNetworkState(input: {
  state: CampaignState;
  agentTooling: AgentToolingState;
  crossDomainOrchestration: CrossDomainOrchestrationState;
  activeRole?: CampaignOrchestrationRoleId;
}): RoleCopilotNetworkState {
  const roleToolRoutes = CAMPAIGN_ROLE_REGISTRY.map((role) => buildRoleToolRoute(role, input.agentTooling));
  const roleWorkflows = CAMPAIGN_ROLE_REGISTRY.map((role) => {
    const route = roleToolRoutes.find((r) => r.roleId === role.id)!;
    return buildRoleWorkflowPlan(role, route);
  });
  const roleTraining = CAMPAIGN_ROLE_REGISTRY.map(buildRoleTrainingPlan);
  const roleLearningPrompts = CAMPAIGN_ROLE_REGISTRY.flatMap(buildRoleLearningPrompts);
  const roleBriefings = CAMPAIGN_ROLE_REGISTRY.map((role) => {
    const toolRoute = roleToolRoutes.find((r) => r.roleId === role.id)!;
    const workflow = roleWorkflows.find((w) => w.roleId === role.id)!;
    const learningPrompts = roleLearningPrompts.filter((p) => p.roleId === role.id);
    return buildRoleBriefing({
      role,
      state: input.state,
      crossDomainOrchestration: input.crossDomainOrchestration,
      toolRoute,
      workflow,
      learningPrompts,
    });
  });
  const activeRole = getCampaignRole(input.activeRole ?? "campaign_manager");
  const activeRoleBriefing = roleBriefings.find((b) => b.role.id === activeRole.id) ?? roleBriefings[0] ?? null;

  return {
    roles: CAMPAIGN_ROLE_REGISTRY,
    activeRoleBriefing,
    roleBriefings,
    roleToolRoutes,
    roleWorkflows,
    roleTraining,
    roleLearningPrompts,
    safetySummary: {
      autoExecutionDisabled: true,
      humanGateRequired: true,
      restrictedActions: [...new Set([...PROHIBITED_EXECUTION_TYPES, ...CAMPAIGN_ROLE_REGISTRY.flatMap((r) => r.restrictedActions)])],
    },
    summary: `${CAMPAIGN_ROLE_REGISTRY.length} role copilots · ${roleBriefings.length} briefings · ${roleWorkflows.length} non-executing workflows · ${roleLearningPrompts.length} learning prompts.`,
  };
}

export { emptyRoleCopilotNetworkState };
