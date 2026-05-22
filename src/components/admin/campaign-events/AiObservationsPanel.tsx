import type { AiObservationEntry } from "@/lib/campaign-events/ai-tools/observations";
import { latestAiObservations } from "@/lib/campaign-events/ai-tools/observations";

const EVENT_LABELS: Record<string, string> = {
  approval_package_previewed: "Package previewed",
  approval_email_generated: "Email generated",
  approval_email_edited: "Email edited",
  approval_email_send_blocked: "Send blocked",
  approval_email_sent: "Email sent",
  approval_email_send_failed: "Send failed",
  approval_email_dry_run: "Dry run logged",
  token_opened: "Token opened",
  decision_approved: "Approved",
  decision_held: "Hold",
  decision_denied: "Denied",
  missing_info_requested: "Info requested",
  ai_summary_accepted: "Summary accepted",
  ai_summary_edited: "Summary edited",
  operator_overrode_recommendation: "Operator override",
  ai_tool_invoked: "Tool invoked",
  promotion_attempted: "Promotion attempted",
  promotion_blocked: "Promotion blocked",
  promotion_succeeded: "Promotion succeeded",
  promotion_failed: "Promotion failed",
  tentative_promoted: "Tentative promoted",
  official_promoted: "Official promoted",
  duplicate_detected: "Duplicate detected",
  operator_overrode_warning: "Operator override",
  payload_edited: "Payload edited",
  page_viewed: "Page viewed",
  dashboard_card_clicked: "Card clicked",
  suggestion_accepted: "Suggestion accepted",
  suggestion_rejected: "Suggestion rejected",
  help_hover_opened: "Help opened",
  drilldown_opened: "Drilldown opened",
  abandoned_flow: "Flow abandoned",
};

export function AiObservationsPanel({
  observations,
  compact,
}: {
  observations: AiObservationEntry[];
  compact?: boolean;
}) {
  const latest = latestAiObservations(observations, compact ? 3 : 5);

  return (
    <section className={`rounded-xl border border-kelly-text/10 bg-kelly-wash/50 font-body ${compact ? "p-3" : "p-4"}`}>
      <h3 className="text-xs font-bold uppercase tracking-wider text-kelly-slate">AI observations</h3>
      {latest.length ? (
        <ul className={`mt-2 space-y-1 text-xs text-kelly-text/75 ${compact ? "" : "max-h-32 overflow-y-auto"}`}>
          {latest.map((o) => (
            <li key={o.id}>
              <span className="font-semibold">{EVENT_LABELS[o.event] ?? o.event}</span>
              <span className="text-kelly-subtle"> · {o.toolId}</span>
              <span className="text-kelly-text/40"> · {new Date(o.at).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-kelly-muted">
          No observations yet. This will help the AI improve approval workflows.
        </p>
      )}
    </section>
  );
}
