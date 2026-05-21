import type { PromotionAuditEntry } from "@/lib/campaign-events/calendar-promotion/promotion-audit";

const ACTION_LABELS: Record<string, string> = {
  promotion_attempted: "Attempted",
  promotion_blocked: "Blocked",
  promotion_succeeded: "Succeeded",
  promotion_failed: "Failed",
  dry_run: "Dry run",
  operator_overrode_warning: "Warning override",
};

export function PromotionAuditPanel({
  entries,
  compact,
}: {
  entries: PromotionAuditEntry[];
  compact?: boolean;
}) {
  const latest = [...entries].sort((a, b) => b.at.localeCompare(a.at)).slice(0, compact ? 4 : 8);

  return (
    <section className={`rounded-xl border border-kelly-text/10 bg-kelly-wash/50 font-body ${compact ? "p-3" : "p-4"}`}>
      <h3 className="text-xs font-bold uppercase tracking-wider text-kelly-slate">Promotion audit</h3>
      {latest.length ? (
        <ul className="mt-2 space-y-1 text-xs text-kelly-text/75">
          {latest.map((e) => (
            <li key={e.id}>
              <span className="font-semibold">{ACTION_LABELS[e.action] ?? e.action}</span>
              <span className="text-kelly-text/45"> · {e.targetLane}</span>
              <span className="text-kelly-text/40"> · {new Date(e.at).toLocaleString()}</span>
              {e.message ? <span className="block text-kelly-text/55">{e.message}</span> : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-kelly-text/55">No promotion attempts logged yet.</p>
      )}
    </section>
  );
}
