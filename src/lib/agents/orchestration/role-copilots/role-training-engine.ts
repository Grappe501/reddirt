import type { CampaignRoleDefinition, RoleTrainingPlan } from "./role-copilot-types";

export function buildRoleTrainingPlan(role: CampaignRoleDefinition): RoleTrainingPlan {
  const level: RoleTrainingPlan["currentAssumedLevel"] =
    role.id === "campaign_manager" || role.id === "operations_lead" ? 4 : role.id === "candidate" ? 2 : 3;
  const recommended = role.trainingNeeds[0] ?? "orch-101-campaign-brain";
  return {
    roleId: role.id,
    currentAssumedLevel: level,
    recommendedTrainingModule: recommended,
    nextLesson:
      level <= 1
        ? "Level 1: understand dashboard health and the role's owned domains."
        : level === 2
          ? "Level 2: use the role briefing to choose today's safe work."
          : level === 3
            ? "Level 3: use recommended tools safely with human gates."
            : level === 4
              ? "Level 4: record feedback and lessons after work."
              : "Level 5: improve the campaign map with reusable observations.",
    safetyReminder: `Never bypass: ${role.restrictedActions.join(", ") || "human approval gates"}.`,
    practiceTask: `Open the ${role.label} briefing, pick one recommended tool, and write what CampaignState should learn afterward.`,
    doneWhen: `${role.label} can explain safe tools, approval boundaries, and the learning prompt for today's work.`,
  };
}
