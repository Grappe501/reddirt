export type ApprovalObservationEvent =
  | "approval_package_previewed"
  | "approval_email_generated"
  | "approval_email_edited"
  | "approval_email_send_blocked"
  | "approval_email_sent"
  | "approval_email_send_failed"
  | "approval_email_dry_run"
  | "token_opened"
  | "decision_approved"
  | "decision_held"
  | "decision_denied"
  | "missing_info_requested"
  | "ai_summary_accepted"
  | "ai_summary_edited"
  | "operator_overrode_recommendation"
  | "ai_tool_invoked";

export type AiObservationEntry = {
  id: string;
  toolId: string;
  event: ApprovalObservationEvent;
  recordId: string | null;
  at: string;
  actor: string;
  meta?: Record<string, string | number | boolean | null>;
};

export function parseAiObservations(raw: unknown): AiObservationEntry[] {
  if (!raw || typeof raw !== "object") return [];
  const o = raw as Record<string, unknown>;
  const log = o._aiObservations;
  if (!Array.isArray(log)) return [];
  return log.filter(
    (e): e is AiObservationEntry =>
      e &&
      typeof e === "object" &&
      typeof (e as AiObservationEntry).id === "string" &&
      typeof (e as AiObservationEntry).event === "string",
  );
}

export function latestAiObservations(entries: AiObservationEntry[], limit = 5): AiObservationEntry[] {
  return [...entries].sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
}
