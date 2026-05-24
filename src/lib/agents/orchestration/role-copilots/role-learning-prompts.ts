import type { CampaignRoleDefinition, RoleLearningPrompt } from "./role-copilot-types";

export function buildRoleLearningPrompts(role: CampaignRoleDefinition): RoleLearningPrompt[] {
  const domain = role.ownedDomains[0] ?? "campaign_management";
  return [
    {
      id: `role-prompt:${role.id}:outcome`,
      roleId: role.id,
      prompt: `What should CampaignState know after today's ${role.label} work?`,
      target: "observation",
      suggestedDomain: domain,
      requiresApproval: role.restrictedActions.includes("sensitive_memory_auto_store"),
      sensitivity: role.ownedDomains.includes("campaign_management") || role.ownedDomains.includes("communications") ? "strategic" : "internal",
      improvesCampaignUnderstandingHow: role.whatThisRoleTeachesCampaignState,
    },
    {
      id: `role-prompt:${role.id}:feedback`,
      roleId: role.id,
      prompt: `Which recommendation did ${role.label} accept, reject, complete, or correct?`,
      target: "feedback",
      suggestedDomain: domain,
      requiresApproval: false,
      sensitivity: "internal",
      improvesCampaignUnderstandingHow: "Turns role decisions into feedback signals so the AI stops repeating weak advice.",
    },
    {
      id: `role-prompt:${role.id}:blocker`,
      roleId: role.id,
      prompt: `What blocker repeated for ${role.label}, and which section did it affect?`,
      target: "lesson",
      suggestedDomain: domain,
      requiresApproval: true,
      sensitivity: "strategic",
      improvesCampaignUnderstandingHow: "Promotes repeated role friction into candidate lessons for human review.",
    },
  ];
}
