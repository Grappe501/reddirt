/**
 * Sprint 0 master build control — repo doc paths (not served as HTTP routes).
 * Operators open these in the IDE or doc viewer; linked from `/admin/campaign-events/ai-tools`.
 */
export const CAMPAIGN_OS_MASTER_BUILD_DOC_DIR = "RedDirt/docs/campaign-events" as const;

export const CAMPAIGN_OS_MASTER_BUILD_DOCS = [
  { id: "roadmap", label: "Master roadmap (Sprint 0–10)", file: "MASTER_CAMPAIGN_OS_ROADMAP.md" },
  { id: "sprint-status", label: "Build sprint status", file: "BUILD_SPRINT_STATUS.md" },
  { id: "ai-map", label: "AI agent tool build map", file: "AI_AGENT_TOOL_BUILD_MAP.md" },
  { id: "sprint4-ai", label: "Sprint 4 AI toolchain", file: "SPRINT4_AI_TOOLCHAIN.md" },
  { id: "sprint5-ai", label: "Sprint 5 GCal promotion", file: "SPRINT5_AI_TOOLCHAIN.md" },
  { id: "sprint5-promo", label: "GCal promotion workflow", file: "GOOGLE_CALENDAR_PROMOTION_WORKFLOW.md" },
  { id: "global-inventory", label: "Global AI agent inventory", file: "GLOBAL_AI_AGENT_TOOL_INVENTORY.md" },
  { id: "all-knowing-arch", label: "All-knowing agent architecture", file: "ALL_KNOWING_CAMPAIGN_AGENT_ARCHITECTURE.md" },
  { id: "agent-learning", label: "Agent observation & learning", file: "AI_AGENT_OBSERVATION_AND_LEARNING_ROADMAP.md" },
  { id: "user-intel-arch", label: "User intelligence architecture", file: "USER_INTELLIGENCE_AGENT_ARCHITECTURE.md" },
  { id: "writing-agent-arch", label: "Writing agent architecture", file: "WRITING_AGENT_ARCHITECTURE.md" },
  { id: "ai-command-center-doc", label: "AI command center", file: "ALL_KNOWING_AGENT_COMMAND_CENTER.md" },
  { id: "deps", label: "System dependency graph", file: "SYSTEM_DEPENDENCY_GRAPH.md" },
] as const;

export const CAMPAIGN_OS_CURRENT_SPRINT = {
  number: 4,
  name: "Approval email + AI tool foundation (4A)",
  statusDoc: "BUILD_SPRINT_STATUS.md#sprint-4a--approval-email-ai-tool-foundation",
} as const;

export const CAMPAIGN_OS_SPRINT_BUILD_RULE = {
  requiredPerObjective: [
    "product feature",
    "V1 AI agent tool (contract in ai-tools/tool-contract.ts)",
    "observation event(s) on factCard._aiObservations",
    "documented V2 automation path",
    "human guardrail (no autonomous send/decide/promote)",
  ],
  sprint4Doc: "docs/campaign-events/SPRINT4_AI_TOOLCHAIN.md",
} as const;

export function masterBuildDocPath(file: string): string {
  return `${CAMPAIGN_OS_MASTER_BUILD_DOC_DIR}/${file}`;
}
