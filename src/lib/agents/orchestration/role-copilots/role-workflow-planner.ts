import type { CampaignRoleDefinition, RoleToolRoute, RoleWorkflowPlan } from "./role-copilot-types";

const WORKFLOW_TITLE: Partial<Record<CampaignRoleDefinition["id"], string>> = {
  campaign_manager: "Campaign Manager Daily Command",
  candidate: "Candidate Prep",
  field_director: "County Visit Prep",
  county_lead: "County Visit Prep",
  communications_director: "Comms Readiness",
  volunteer_coordinator: "Volunteer Push",
  event_lead: "Event Prep and Hot Wash",
  finance_director: "Finance Review",
  compliance_lead: "Compliance Review",
  operations_lead: "Deployment Readiness Review",
  data_director: "Knowledge Gap Review",
  research_director: "Knowledge Gap Review",
};

export function buildRoleWorkflowPlan(role: CampaignRoleDefinition, toolRoute: RoleToolRoute): RoleWorkflowPlan {
  const title = WORKFLOW_TITLE[role.id] ?? `${role.label} Daily Role Plan`;
  const tools = toolRoute.toolSequence.slice(0, 4);
  return {
    id: `role-workflow:${role.id}`,
    roleId: role.id,
    title,
    summary: `Preparation-only workflow for ${role.label}: ${role.mission}`,
    domains: role.ownedDomains,
    sections: role.relatedSections,
    steps: [
      {
        order: 1,
        title: "Read role briefing and CampaignState context",
        toolId: "campaign-state-loader",
        safety: "safe_read",
        humanGateRequired: false,
        output: "role context",
      },
      {
        order: 2,
        title: "Run recommended role tools as preparation",
        toolId: tools[0],
        safety: toolRoute.safety.highestSafetyLevel === "prohibited" ? "approval_required" : toolRoute.safety.highestSafetyLevel,
        humanGateRequired: true,
        output: "role packet",
      },
      {
        order: 3,
        title: "Review approval boundaries",
        toolId: "orchestration-human-gate-enforcer",
        safety: "approval_required",
        humanGateRequired: true,
        output: "human approval checklist",
      },
      {
        order: 4,
        title: "Record feedback and lesson prompt",
        toolId: "feedback-learning-engine",
        safety: "safe_prepare",
        humanGateRequired: true,
        output: "learning prompt",
      },
    ],
    humanApprovalsRequired: role.humanApprovalBoundaries,
    canExecuteNow: false,
    doneWhen: `${role.label} has reviewed the packet, escalated gated items, and recorded what the AI should learn.`,
    teachesCampaignState: role.whatThisRoleTeachesCampaignState,
  };
}
