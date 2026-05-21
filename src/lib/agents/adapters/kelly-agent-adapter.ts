/**
 * Kelly Agent admin bundle bridge — registry metadata; execution stays in kelly-agent-tools.ts.
 */
import type { AdapterToolMeta } from "./ask-kelly-adapter";

export const KELLY_AGENT_ADAPTER_TOOLS: AdapterToolMeta[] = [
  { registryId: "kelly-schedule-readiness", name: "Schedule readiness", mode: "read_only", source: "schedule-readiness-tool.ts", description: "Pre-flight schedule report." },
  { registryId: "kelly-calendar-sync-readiness", name: "Calendar sync readiness", mode: "read_only", source: "calendar-sync-readiness-tool.ts", description: "OAuth/sync health." },
  { registryId: "kelly-volunteer-capacity", name: "Volunteer capacity", mode: "read_only", source: "volunteer-capacity-tool.ts", description: "Capacity snapshot." },
  { registryId: "kelly-candidate-dashboard-preflight", name: "Candidate dashboard preflight", mode: "read_only", source: "candidate-dashboard-preflight-tool.ts", description: "Dashboard preflight checks." },
  { registryId: "kelly-event-coverage-plan", name: "Event coverage plan", mode: "read_only", source: "event-coverage-plan-tool.ts", description: "Coverage gap summary." },
  { registryId: "kelly-approval-recommendation", name: "Approval recommendation stub", mode: "action_gated", source: "kelly-agent-tools.ts", description: "Recommend only — no auto-approve." },
];

export function summarizeKellyAgentAdapter(): string {
  return `Kelly Agent bundle: ${KELLY_AGENT_ADAPTER_TOOLS.length} tools via /api/admin/kelly-agent/recommend. Writes blocked at runtime.`;
}

export function getKellyAgentToolsForRegistry(): AdapterToolMeta[] {
  return KELLY_AGENT_ADAPTER_TOOLS;
}
