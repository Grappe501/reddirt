/**
 * Sprint 0 master build control — repo doc paths (not served as HTTP routes).
 * Operators open these in the IDE or doc viewer; linked from `/admin/campaign-events/ai-tools`.
 */
export const CAMPAIGN_OS_MASTER_BUILD_DOC_DIR = "RedDirt/docs/campaign-events" as const;

export const CAMPAIGN_OS_MASTER_BUILD_DOCS = [
  { id: "roadmap", label: "Master roadmap (Sprint 0–10)", file: "MASTER_CAMPAIGN_OS_ROADMAP.md" },
  { id: "sprint-status", label: "Build sprint status", file: "BUILD_SPRINT_STATUS.md" },
  { id: "ai-map", label: "AI agent tool build map", file: "AI_AGENT_TOOL_BUILD_MAP.md" },
  { id: "deps", label: "System dependency graph", file: "SYSTEM_DEPENDENCY_GRAPH.md" },
] as const;

export const CAMPAIGN_OS_CURRENT_SPRINT = {
  number: 4,
  name: "Approval package email workflow",
  statusDoc: "BUILD_SPRINT_STATUS.md#sprint-4--approval-package-email",
} as const;

export function masterBuildDocPath(file: string): string {
  return `${CAMPAIGN_OS_MASTER_BUILD_DOC_DIR}/${file}`;
}
