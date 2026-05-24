import type { CampaignState } from "../campaign-state-types";
import type { CrossDomainOrchestrationState } from "../cross-domain/cross-domain-orchestrator-types";
import type { CampaignRoleDefinition, RoleBriefing, RoleLearningPrompt, RoleToolRoute, RoleWorkflowPlan } from "./role-copilot-types";

export function buildRoleBriefing(input: {
  role: CampaignRoleDefinition;
  state: CampaignState;
  crossDomainOrchestration: CrossDomainOrchestrationState;
  toolRoute: RoleToolRoute;
  workflow: RoleWorkflowPlan;
  learningPrompts: RoleLearningPrompt[];
}): RoleBriefing {
  const { role, state } = input;
  const blockers = state.activeBlockers.filter((b) => role.ownedDomains.includes(b.domainId)).map((b) => b.message).slice(0, 4);
  const opportunities = state.activeOpportunities.filter((o) => role.ownedDomains.includes(o.domainId)).map((o) => o.message).slice(0, 4);
  const risks = [
    ...state.financeComplianceWarnings.filter(() => role.ownedDomains.includes("finance") || role.ownedDomains.includes("compliance")),
    ...role.restrictedActions.map((a) => `Restricted action: ${a}`),
  ].slice(0, 4);
  const lessons = state.knowledge.strongestLessons.filter((l) => l.domains.some((d) => role.ownedDomains.includes(d))).slice(0, 3);
  const sectionWarnings = input.crossDomainOrchestration.dependencyGraph.edges
    .filter((e) => role.relatedSections.includes(e.from) || role.relatedSections.includes(e.to))
    .slice(0, 3)
    .map((e) => `${e.from.replaceAll("_", " ")} → ${e.to.replaceAll("_", " ")}: ${e.whyItMatters}`);

  return {
    role,
    executiveSummary: `${role.label}: ${role.mission} ${role.whatThisRoleTeachesCampaignState}`,
    topPriorities: [
      ...blockers.slice(0, 1),
      ...role.dailyResponsibilities.slice(0, 2),
      input.workflow.title,
    ].slice(0, 3),
    blockers,
    risks,
    opportunities,
    recommendedTools: input.toolRoute.recommendedTools,
    recommendedWorkflows: [input.workflow],
    crossDomainDependencies: sectionWarnings,
    pendingApprovals: [...role.humanApprovalBoundaries, ...input.toolRoute.approvalRequiredTools.map((t) => `Tool approval: ${t}`)].slice(0, 6),
    relevantLessons: lessons,
    learningPrompts: input.learningPrompts,
    doneWhenChecklist: [
      `Review ${role.label} priorities`,
      "Use tools only as preparation",
      "Escalate gated items",
      "Record feedback or lesson prompt",
    ],
  };
}
