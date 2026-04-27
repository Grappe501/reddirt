import { COMMS_PLAN_SECTION } from "@/lib/comms-workbench/comms-nav";
import type { CommunicationPlanExecutionSummary } from "@/lib/comms-workbench/dto";
import { formatCommsFieldLabel } from "@/lib/comms-workbench/ui-labels";

const h2 = "font-heading text-[10px] font-bold uppercase tracking-wider text-kelly-text/55";
const empty = "mt-1 rounded border border-dashed border-kelly-text/15 bg-kelly-page/50 px-3 py-2 text-sm text-kelly-text/60";

type Props = {
  summary: CommunicationPlanExecutionSummary;
};

export function CommunicationPlanExecutionBlock({ summary }: Props) {
  if (summary.totalSends === 0) {
    return (
      <section id={COMMS_PLAN_SECTION.execution} className="rounded-md border border-kelly-text/10 bg-white p-3 shadow-sm">
        <h2 className={h2}>Execution intelligence</h2>
        <p className={empty}>No sends have been executed yet. Add a planned send and queue it to see delivery state here.</p>
      </section>
    );
  }

  return (
    <section id={COMMS_PLAN_SECTION.execution} className="rounded-md border border-kelly-text/10 bg-white p-3 shadow-sm">
      <h2 className={h2}>Execution intelligence</h2>
      <p className="mt-0.5 font-body text-xs text-kelly-text/65">
        Delivery and outcome summary for this plan. Counts are from tracked sends; reason lines come from normalized outcome
        data (not raw provider payloads).
      </p>

      <ul className="mt-2 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3 lg:grid-cols-4">
        <li>
          <span className={h2}>Queued</span>
          <p className="mt-0.5 font-mono text-lg font-semibold text-kelly-text">{summary.queuedCount}</p>
        </li>
        <li>
          <span className={h2}>Sending</span>
          <p className="mt-0.5 font-mono text-lg font-semibold text-kelly-text">{summary.sendingCount}</p>
        </li>
        <li>
          <span className={h2}>Sent</span>
          <p className="mt-0.5 font-mono text-lg font-semibold text-kelly-text">
            {summary.sentCount + summary.partiallySentCount}
            {summary.partiallySentCount > 0 ? (
              <span className="ml-1 text-xs font-normal text-kelly-text/60">({summary.partiallySentCount} partial)</span>
            ) : null}
          </p>
        </li>
        <li>
          <span className={h2}>Failed</span>
          <p className="mt-0.5 font-mono text-lg font-semibold text-rose-900">{summary.failedCount}</p>
        </li>
        <li>
          <span className={h2}>Scheduled</span>
          <p className="mt-0.5 font-mono text-kelly-text">{summary.scheduledCount}</p>
        </li>
        <li>
          <span className={h2}>Draft send rows</span>
          <p className="mt-0.5 font-mono text-kelly-text">{summary.draftSendCount}</p>
        </li>
        <li>
          <span className={h2}>Canceled</span>
          <p className="mt-0.5 font-mono text-kelly-text">{summary.canceledCount}</p>
        </li>
      </ul>

      <ul className="mt-3 space-y-1 text-xs text-kelly-text/80">
        <li>
          <span className="font-semibold text-kelly-text/90">Last activity:</span>{" "}
          {summary.lastExecutionAt ? new Date(summary.lastExecutionAt).toLocaleString() : "—"}
        </li>
        <li>
          <span className="font-semibold text-kelly-text/90">Last queued:</span>{" "}
          {summary.lastQueuedAt ? new Date(summary.lastQueuedAt).toLocaleString() : "—"}
        </li>
        <li>
          <span className="font-semibold text-kelly-text/90">Last sending (updated):</span>{" "}
          {summary.lastSendingAt ? new Date(summary.lastSendingAt).toLocaleString() : "—"}
        </li>
        <li>
          <span className="font-semibold text-kelly-text/90">Last sent:</span>{" "}
          {summary.lastSentAt ? new Date(summary.lastSentAt).toLocaleString() : "—"}
        </li>
        <li>
          <span className="font-semibold text-kelly-text/90">Last failure:</span>{" "}
          {summary.lastFailureAt ? new Date(summary.lastFailureAt).toLocaleString() : "—"}
        </li>
        {summary.latestFailureSummary ? (
          <li className="rounded border border-rose-100/80 bg-rose-50/50 px-2 py-1.5 text-sm text-rose-950">
            <span className="font-semibold">Latest failure: </span>
            {summary.latestFailureSummary}
            {summary.latestProviderStatus ? (
              <span className="mt-0.5 block text-xs text-rose-900/80">Provider status: {summary.latestProviderStatus}</span>
            ) : null}
          </li>
        ) : null}
      </ul>

      <div className="mt-3">
        <h3 className={h2}>Recent send outcomes (newest first)</h3>
        {summary.recentSendOutcomes.length === 0 ? (
          <p className={empty}>No outcome rows to show yet.</p>
        ) : (
          <ul className="mt-1 space-y-1.5 text-sm">
            {summary.recentSendOutcomes.map((o) => (
              <li key={o.sendId} className="rounded border border-kelly-text/6 bg-kelly-page/30 px-2 py-1.5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-xs text-kelly-text/75">
                    {formatCommsFieldLabel(o.channel)} · {formatCommsFieldLabel(o.status)}
                  </span>
                  <time className="text-[10px] text-kelly-text/50" dateTime={o.updatedAt}>
                    {new Date(o.updatedAt).toLocaleString()}
                  </time>
                </div>
                <p className="mt-0.5 text-xs text-kelly-text/90">{o.outcomeLabel}</p>
                <p className="mt-0.5 font-mono text-[9px] text-kelly-text/40">{o.sendId}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
