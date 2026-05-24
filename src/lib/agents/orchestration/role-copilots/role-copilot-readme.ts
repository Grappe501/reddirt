export const ROLE_COPILOT_NETWORK_README = {
  id: "role_copilot_orchestration_network",
  phase: "4D",
  purpose:
    "Role-based orchestration briefings, tool routes, workflows, training, and learning prompts that teach the AI how each campaign role improves CampaignState.",
  modulePath: "src/lib/agents/orchestration/role-copilots/",
  campaignStateField: "roleCopilots",
  api: "/api/agents/role-copilot-state",
  test: "npm run agents:test-role-copilot-network",
  safety: [
    "Read-only state generation",
    "Role workflows are non-executing",
    "No send/submit/export/calendar/finance/production mutation controls",
    "Learning prompts feed feedback and lessons with approval gates",
  ],
} as const;
