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
  | "planning_readiness_improved";

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
};
