export const CROSS_DOMAIN_ORCHESTRATOR_README = {
  id: "cross_domain_agent_tool_orchestrator",
  phase: "4B",
  purpose:
    "Section-aware orchestrator that maps campaign sections, dependencies, tools, playbooks, packets, and learning hooks into CampaignState.",
  module: "src/lib/agents/orchestration/cross-domain/",
  stateField: "campaignState.crossDomainOrchestration",
  api: "/api/agents/cross-domain-orchestration-state",
  dashboard: "/admin/orchestration#cross-domain-agent-orchestrator",
  safety: [
    "Preparation only",
    "No send/SMS/calendar write/finance post/reimbursement submit/export",
    "Every packet has canExecuteNow false",
    "Learning hooks suggest observations/lessons but never approve sensitive memory",
  ],
} as const;
