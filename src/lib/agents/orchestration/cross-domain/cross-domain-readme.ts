export const CROSS_DOMAIN_ORCHESTRATOR_README = {
  id: "cross_domain_agent_orchestrator",
  phase: "4B",
  purpose:
    "Route campaign attention across sections, select section-aware tools, prepare cross-domain playbooks, and define learning hooks without execution.",
  modulePath: "src/lib/agents/orchestration/cross-domain/",
  campaignStateField: "crossDomainOrchestration",
  api: "/api/agents/cross-domain-orchestration-state",
  safety: [
    "Action packets are preparation-only",
    "canExecuteNow is always false",
    "No email/SMS/calendar/finance/export/production mutation",
    "Every packet includes human approvals and learning hooks",
  ],
} as const;
