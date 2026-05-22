/** Human approval gate matrix — what the agent may never execute autonomously. */

export type ApprovalGateRisk = "safe" | "gated" | "forbidden";

export type HumanApprovalGate = {
  actionId: string;
  label: string;
  domain: string;
  risk: ApprovalGateRisk;
  humanRequired: boolean;
  agentMayPrepare: boolean;
  agentMayExecute: boolean;
  reviewRoute?: string;
  note: string;
};

export const HUMAN_APPROVAL_GATES: HumanApprovalGate[] = [
  { actionId: "send_approval_email", label: "Send approval email", domain: "approval", risk: "forbidden", humanRequired: true, agentMayPrepare: true, agentMayExecute: false, reviewRoute: "/admin/campaign-events/review", note: "Email send disabled / human only" },
  { actionId: "approve_deny_event", label: "Approve or deny event", domain: "approval", risk: "gated", humanRequired: true, agentMayPrepare: true, agentMayExecute: false, reviewRoute: "/admin/campaign-events/review", note: "Decision on ledger row" },
  { actionId: "promote_google_calendar", label: "Promote to Google Calendar", domain: "calendar", risk: "gated", humanRequired: true, agentMayPrepare: true, agentMayExecute: false, reviewRoute: "/admin/campaign-events/calendar-promotion", note: "GCal write gated" },
  { actionId: "finalize_reimbursement", label: "Finalize reimbursement month", domain: "reimbursement", risk: "gated", humanRequired: true, agentMayPrepare: true, agentMayExecute: false, reviewRoute: "/admin/campaign-events/reimbursement", note: "Month finalize" },
  { actionId: "post_financial_transaction", label: "Post FinancialTransaction", domain: "finance", risk: "forbidden", humanRequired: true, agentMayPrepare: false, agentMayExecute: false, note: "FIN-1 bridge not built" },
  { actionId: "publish_hot_wash_media", label: "Publish hot wash media", domain: "hot_wash", risk: "gated", humanRequired: true, agentMayPrepare: false, agentMayExecute: false, reviewRoute: "/admin/campaign-events/media-approval", note: "CM approval required" },
  { actionId: "write_permanent_memory", label: "Write permanent agent memory", domain: "learning", risk: "gated", humanRequired: true, agentMayPrepare: true, agentMayExecute: false, reviewRoute: "/admin/ai-command-center/memory-review", note: "Memory review queue" },
  { actionId: "update_inferred_fields", label: "Update inferred fact card fields", domain: "intake", risk: "gated", humanRequired: true, agentMayPrepare: true, agentMayExecute: false, reviewRoute: "/admin/campaign-events/review", note: "Human save unless draft" },
  { actionId: "complete_hot_wash_memory", label: "Complete hot wash → county memory", domain: "hot_wash", risk: "gated", humanRequired: true, agentMayPrepare: true, agentMayExecute: false, reviewRoute: "/admin/campaign-events/[recordId]", note: "Human completes review" },
  { actionId: "generate_summary", label: "Generate summaries & scores", domain: "agent", risk: "safe", humanRequired: false, agentMayPrepare: true, agentMayExecute: true, note: "Read-only / draft text" },
  { actionId: "recommend_next_action", label: "Recommend next action", domain: "agent", risk: "safe", humanRequired: false, agentMayPrepare: true, agentMayExecute: true, note: "Routing only" },
  { actionId: "build_reimbursement_packet_draft", label: "Build reimbursement packet draft", domain: "reimbursement", risk: "safe", humanRequired: false, agentMayPrepare: true, agentMayExecute: false, reviewRoute: "/admin/campaign-events/reimbursement", note: "Prepared only until human confirms" },
  { actionId: "build_planning_draft", label: "Build event planning draft", domain: "event_planning", risk: "safe", humanRequired: false, agentMayPrepare: true, agentMayExecute: false, reviewRoute: "/admin/campaign-events/[recordId]", note: "Human saves workbook" },
  { actionId: "calendar_sync_read", label: "Read calendar sync truth", domain: "calendar", risk: "safe", humanRequired: false, agentMayPrepare: true, agentMayExecute: true, reviewRoute: "/admin/campaign-events/calendar-sync", note: "Read-only" },
];

export function gatesByRisk(risk: ApprovalGateRisk): HumanApprovalGate[] {
  return HUMAN_APPROVAL_GATES.filter((g) => g.risk === risk);
}

export function isActionForbidden(actionId: string): boolean {
  const g = HUMAN_APPROVAL_GATES.find((x) => x.actionId === actionId);
  return g?.risk === "forbidden" || g?.agentMayExecute === false;
}
