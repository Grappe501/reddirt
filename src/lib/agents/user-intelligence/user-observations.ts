import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

/** Internal UX / workflow observations — not external analytics. */
export type UserUxObservationEvent =
  | "page_viewed"
  | "next_action_clicked"
  | "dashboard_card_clicked"
  | "filter_used"
  | "review_queue_started"
  | "suggestion_accepted"
  | "suggestion_rejected"
  | "field_overridden"
  | "correction_started"
  | "help_hover_opened"
  | "drilldown_opened"
  | "abandoned_flow"
  | "flow_abandoned"
  | "print_clicked"
  | "download_clicked"
  | "approval_decision_made"
  | "promotion_previewed"
  | "promotion_attempted"
  | "correction_requested"
  | "search_used"
  | "no_results_search"
  | "repeated_missing_field"
  | "user_returned_to_same_page"
  | "user_switched_role_context"
  | "user_used_plain_language_request"
  | "user_requested_more_detail"
  | "user_collapsed_section"
  | "user_expanded_section"
  | "run_of_show_created"
  | "pack_list_updated"
  | "volunteer_plan_updated"
  | "candidate_brief_generated"
  | "cm_brief_generated"
  | "planning_section_completed"
  | "planning_blocker_resolved"
  | "planning_readiness_improved"
  | "hotwash_completed"
  | "county_signal_detected"
  | "event_blueprint_created"
  | "relationship_opportunity_detected"
  | "followup_task_generated"
  | "messaging_signal_detected"
  | "county_memory_updated"
  | "event_pattern_detected"
  | "strategic_signal_detected"
  | "successful_event_logged"
  | "receipt_uploaded"
  | "reimbursement_completed"
  | "expense_flagged"
  | "compliance_warning_detected"
  | "financial_gap_detected"
  | "audit_packet_generated"
  | "receipt_missing_detected"
  | "finance_risk_detected"
  | "treasurer_review_requested"
  | "campaign_spend_pattern_detected"
  | "os_state_snapshot_viewed"
  | "agent_workflow_plan_generated"
  | "agent_action_prepared"
  | "gated_action_presented"
  | "human_gate_required"
  | "agent_recommendation_followed"
  | "agent_recommendation_ignored"
  | "system_blocker_detected"
  | "system_health_changed"
  | "domain_handoff_recommended"
  | "dashboard_focus_changed"
  | "workflow_reentry_detected"
  | "operator_overwhelm_detected"
  | "navigation_shortcut_used"
  | "ai_command_palette_used"
  | "workflow_guidance_followed"
  | "workflow_guidance_ignored"
  | "dashboard_card_collapsed"
  | "dashboard_card_expanded"
  | "operator_focus_mode_entered";

export type UserObservationEntry = {
  id: string;
  event: UserUxObservationEvent;
  at: string;
  actor: string;
  role: string;
  pathname?: string;
  recordId?: string | null;
  toolId?: string;
  meta?: Record<string, string | number | boolean | null>;
};

const GLOBAL_OBS_REL = "data/campaign-events/user-observations.json";
const MAX_GLOBAL = 500;

function globalObsPath(repoRoot?: string): string {
  return path.join(repoRoot ?? process.cwd(), GLOBAL_OBS_REL);
}

export function parseGlobalUserObservations(raw: unknown): UserObservationEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (e): e is UserObservationEntry =>
      e && typeof e === "object" && typeof (e as UserObservationEntry).id === "string",
  );
}

export function loadGlobalUserObservations(repoRoot?: string): UserObservationEntry[] {
  const p = globalObsPath(repoRoot);
  if (!existsSync(p)) return [];
  try {
    return parseGlobalUserObservations(JSON.parse(readFileSync(p, "utf8")));
  } catch {
    return [];
  }
}

export function appendGlobalUserObservation(
  entry: Omit<UserObservationEntry, "id" | "at"> & { id?: string; at?: string },
  repoRoot?: string,
): UserObservationEntry {
  const p = globalObsPath(repoRoot);
  const dir = path.dirname(p);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const prev = loadGlobalUserObservations(repoRoot);
  const full: UserObservationEntry = {
    ...entry,
    id: entry.id ?? `uxo_${Date.now().toString(36)}`,
    at: entry.at ?? new Date().toISOString(),
  };
  const next = [...prev, full].slice(-MAX_GLOBAL);
  writeFileSync(p, JSON.stringify(next, null, 2), "utf8");
  return full;
}

export const USER_UX_EVENT_LABELS: Record<UserUxObservationEvent, string> = {
  page_viewed: "Page viewed",
  next_action_clicked: "Next action clicked",
  dashboard_card_clicked: "Dashboard card clicked",
  filter_used: "Filter used",
  review_queue_started: "Review queue started",
  suggestion_accepted: "Suggestion accepted",
  suggestion_rejected: "Suggestion rejected",
  field_overridden: "Field overridden",
  correction_started: "Correction started",
  help_hover_opened: "Help opened",
  drilldown_opened: "Drilldown opened",
  abandoned_flow: "Flow abandoned",
  flow_abandoned: "Flow abandoned",
  promotion_previewed: "Promotion previewed",
  promotion_attempted: "Promotion attempted",
  print_clicked: "Print clicked",
  download_clicked: "Download clicked",
  approval_decision_made: "Approval decision",
  correction_requested: "Correction requested",
  search_used: "Search used",
  no_results_search: "Search — no results",
  repeated_missing_field: "Repeated missing field",
  user_returned_to_same_page: "Returned to same page",
  user_switched_role_context: "Role context switch",
  user_used_plain_language_request: "Plain-language request",
  user_requested_more_detail: "More detail requested",
  user_collapsed_section: "Section collapsed",
  user_expanded_section: "Section expanded",
  run_of_show_created: "Run of show created",
  pack_list_updated: "Pack list updated",
  volunteer_plan_updated: "Volunteer plan updated",
  candidate_brief_generated: "Candidate brief generated",
  cm_brief_generated: "CM brief generated",
  planning_section_completed: "Planning section completed",
  planning_blocker_resolved: "Planning blocker resolved",
  planning_readiness_improved: "Planning readiness improved",
  hotwash_completed: "Hot wash completed",
  county_signal_detected: "County signal detected",
  event_blueprint_created: "Event blueprint created",
  relationship_opportunity_detected: "Relationship opportunity detected",
  followup_task_generated: "Follow-up task generated",
  messaging_signal_detected: "Messaging signal detected",
  county_memory_updated: "County memory updated",
  event_pattern_detected: "Event pattern detected",
  strategic_signal_detected: "Strategic signal detected",
  successful_event_logged: "Successful event logged",
  receipt_uploaded: "Receipt uploaded",
  reimbursement_completed: "Reimbursement completed",
  expense_flagged: "Expense flagged",
  compliance_warning_detected: "Compliance warning detected",
  financial_gap_detected: "Financial gap detected",
  audit_packet_generated: "Audit packet generated",
  receipt_missing_detected: "Receipt missing detected",
  finance_risk_detected: "Finance risk detected",
  treasurer_review_requested: "Treasurer review requested",
  campaign_spend_pattern_detected: "Campaign spend pattern detected",
  os_state_snapshot_viewed: "OS state snapshot viewed",
  agent_workflow_plan_generated: "Agent workflow plan generated",
  agent_action_prepared: "Agent action prepared",
  gated_action_presented: "Gated action presented",
  human_gate_required: "Human gate required",
  agent_recommendation_followed: "Agent recommendation followed",
  agent_recommendation_ignored: "Agent recommendation ignored",
  system_blocker_detected: "System blocker detected",
  system_health_changed: "System health changed",
  domain_handoff_recommended: "Domain handoff recommended",
  dashboard_focus_changed: "Dashboard focus changed",
  workflow_reentry_detected: "Workflow reentry detected",
  operator_overwhelm_detected: "Operator overwhelm detected",
  navigation_shortcut_used: "Navigation shortcut used",
  ai_command_palette_used: "AI command palette used",
  workflow_guidance_followed: "Workflow guidance followed",
  workflow_guidance_ignored: "Workflow guidance ignored",
  dashboard_card_collapsed: "Dashboard card collapsed",
  dashboard_card_expanded: "Dashboard card expanded",
  operator_focus_mode_entered: "Operator focus mode entered",
};
