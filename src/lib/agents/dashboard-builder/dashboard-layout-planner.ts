import type { DashboardBlockDefinition, DashboardBlockId } from "./dashboard-component-registry";
import type { InterpretedDashboardRequest } from "./dashboard-request-interpreter";

export type LayoutRow = {
  row: number;
  emphasis: "primary" | "secondary";
  blockIds: DashboardBlockId[];
};

const WORKFLOW_BLOCKS: Record<string, DashboardBlockId[]> = {
  reimbursement: ["executive_summary", "travel_reimbursement_summary", "missing_mileage", "finance_readiness", "receipt_gaps", "print_download_actions"],
  approval: ["executive_summary", "approval_queue", "upcoming_events", "ai_next_actions"],
  volunteer: ["executive_summary", "volunteer_needs", "host_follow_up", "upcoming_events", "onboarding_checklist"],
  county: ["executive_summary", "county_memory", "upcoming_events", "hot_wash_queue"],
  events: ["executive_summary", "upcoming_events", "event_planning_checklist", "calendar_sync_health"],
  calendar: ["executive_summary", "calendar_sync_health", "promotion_readiness", "upcoming_events"],
  operations: ["executive_summary", "ai_next_actions", "approval_queue", "calendar_sync_health", "recent_activity"],
};

export function planDashboardLayout(
  allowed: DashboardBlockDefinition[],
  request: InterpretedDashboardRequest,
): LayoutRow[] {
  const allowedIds = new Set(allowed.map((b) => b.id));
  const pick = (ids: DashboardBlockId[]) => ids.filter((id) => allowedIds.has(id));

  let preferred = WORKFLOW_BLOCKS[request.workflowFocus] ?? WORKFLOW_BLOCKS.operations;
  if (request.targetRole === "treasurer") preferred = WORKFLOW_BLOCKS.reimbursement;
  if (request.targetRole === "candidate") preferred = WORKFLOW_BLOCKS.approval;
  if (request.skillLevel === "new") {
    preferred = ["executive_summary", "onboarding_checklist", "role_training", "ai_next_actions", "command_palette"];
  }

  const ids = pick(preferred);
  if (request.detailLevel === "simple") {
    return [{ row: 0, emphasis: "primary", blockIds: ids.slice(0, 4) }];
  }
  if (request.detailLevel === "power") {
    const extra = pick(allowed.map((b) => b.id));
    const merged = [...new Set([...ids, ...extra])];
    return [
      { row: 0, emphasis: "primary", blockIds: merged.slice(0, 3) },
      { row: 1, emphasis: "primary", blockIds: merged.slice(3, 7) },
      { row: 2, emphasis: "secondary", blockIds: merged.slice(7) },
    ];
  }
  return [
    { row: 0, emphasis: "primary", blockIds: ids.slice(0, 3) },
    { row: 1, emphasis: "secondary", blockIds: ids.slice(3, 7) },
  ];
}
