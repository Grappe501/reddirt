import Link from "next/link";
import { CommsStatusBadge } from "@/components/admin/comms-workbench/CommsStatusBadge";
import { commsPlanPath, COMMS_PLAN_SECTION } from "@/lib/comms-workbench/comms-nav";
import { COMMS_EMPTY } from "@/lib/comms-workbench/comms-section-copy";
import type { CommsExecutionDashboardData } from "@/lib/comms-workbench/dto";
import { MAX_COMMS_SEND_OPERATOR_RETRIES } from "@/lib/comms-workbench/send-retry-policy";
import { formatCommsFieldLabel } from "@/lib/comms-workbench/ui-labels";

const h2 = "font-heading text-[10px] font-bold uppercase tracking-wider text-deep-soil/55";
const card = "rounded-md border border-deep-soil/10 bg-white p-3 shadow-sm min-w-0";
const empty = "rounded border border-dashed border-deep-soil/20 bg-cream-canvas/50 px-3 py-4 text-center font-body text-sm text-deep-soil/60";
const kpi = "rounded border border-deep-soil/10 bg-cream-canvas/30 px-2.5 py-2 text-center";

function ExecutionSummaryCard({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className={kpi}>
      <p className="font-heading text-[9px] font-bold uppercase tracking-wider text-deep-soil/50">{label}</p>
      <p className="mt-0.5 font-mono text-xl font-bold text-deep-soil">{value}</p>
      {hint ? <p className="mt-0.5 text-[10px] text-deep-soil/50">{hint}</p> : null}
    </div>
  );
}

export function CommsExecutionDashboardSection({ ex }: { ex: CommsExecutionDashboardData }) {
  const hasSends = ex.totalPlannedSends > 0;
  const inFlight = ex.queuedCount + ex.sendingCount;

  return (
    <div className="space-y-4">
      <div>
        <h2 className={h2}>Send execution</h2>
        <p className="mt-0.5 max-w-2xl font-body text-xs text-deep-soil/65">
          Queue and delivery state across all message plans. Use this to see failures and in-flight work without opening each plan.
        </p>
      </div>

      {!hasSends ? (
        <p className={empty}>{COMMS_EMPTY.noExecution}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <ExecutionSummaryCard label="Queued" value={ex.queuedCount} />
            <ExecutionSummaryCard label="Sending" value={ex.sendingCount} />
            <ExecutionSummaryCard label="Sent" value={ex.sentCount + ex.partiallySentCount} hint={ex.partiallySentCount ? `incl. ${ex.partiallySentCount} partial` : undefined} />
            <ExecutionSummaryCard label="Failed" value={ex.failedCount} />
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 text-[11px] text-deep-soil/75">
            <p>
              <span className="font-semibold text-deep-soil/90">Total sends:</span> {ex.totalPlannedSends}
            </p>
            <p>
              <span className="font-semibold text-deep-soil/90">Scheduled:</span> {ex.scheduledCount} ·<span className="ml-1">Canceled:</span> {ex.canceledCount} ·<span className="ml-1">Draft send rows:</span>{" "}
              {ex.draftSendCount}
            </p>
            <p>
              <span className="font-semibold text-deep-soil/90">Plans with failures:</span> {ex.plansWithFailuresCount}
            </p>
            <p>
              <span className="font-semibold text-deep-soil/90">Plans with queued or sending:</span> {ex.plansWithActiveExecutionCount}
            </p>
            {ex.failedCount > 0 ? (
              <p>
                <span className="font-semibold text-deep-soil/90">Failed — operator re-queue:</span>{" "}
                {ex.failedSendOperatorRetryableCount} can be re-queued, {ex.failedSendOperatorRetriesExhaustedCount} hit the
                retry cap ({MAX_COMMS_SEND_OPERATOR_RETRIES} per send).
              </p>
            ) : null}
          </div>

          {inFlight === 0 && ex.failedCount === 0 && ex.recentFailedSends.length === 0 ? (
            <p className="text-xs text-deep-soil/60">No queued or sending messages right now. No recent failures in this window.</p>
          ) : null}
        </>
      )}

      {ex.channelBreakdown.length > 0 ? (
        <div className={card}>
          <h3 className={h2}>By channel (sent / failed / queued / sending)</h3>
          <ul className="mt-1.5 space-y-1 text-sm">
            {ex.channelBreakdown.map((c) => (
              <li key={c.channel} className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-medium text-deep-soil">{formatCommsFieldLabel(c.channel)}</span>
                <span className="font-mono text-xs text-deep-soil/80">
                  {c.sentCount} / {c.failedCount} / {c.queuedCount} / {c.sendingCount}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : hasSends ? null : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className={card}>
          <h3 className={h2}>Recent failures</h3>
          {ex.recentFailedSends.length === 0 ? (
            <p className={`mt-1 ${empty}`}>{COMMS_EMPTY.noFailures}</p>
          ) : (
            <ul className="mt-1.5 space-y-1.5 text-sm">
              {ex.recentFailedSends.map((s) => (
                <li key={s.id} className="rounded border border-rose-100/80 bg-rose-50/40 px-2 py-1.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <Link
                      href={commsPlanPath(s.communicationPlanId, COMMS_PLAN_SECTION.sends)}
                      className="font-semibold text-civic-slate hover:underline"
                      title="Open plan at planned sends"
                    >
                      {s.planTitle}
                    </Link>
                    <time className="text-[10px] text-deep-soil/50" dateTime={s.updatedAt}>
                      {new Date(s.updatedAt).toLocaleString()}
                    </time>
                  </div>
                  <p className="flex flex-wrap items-center gap-1.5 text-[11px] text-deep-soil/80">
                    <span>{formatCommsFieldLabel(s.channel)}</span>
                    <span>· {s.sourceKind}</span>
                    <CommsStatusBadge segment="send" status={s.status} />
                  </p>
                  <p className="mt-0.5 text-xs text-deep-soil/90">{s.failureReason}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={card}>
          <h3 className={h2}>Recent execution activity</h3>
          {ex.recentExecutionActivity.length === 0 ? (
            <p className={`mt-1 ${empty}`}>{COMMS_EMPTY.noActivity}</p>
          ) : (
            <ul className="mt-1.5 space-y-1.5 text-sm">
              {ex.recentExecutionActivity.map((a) => (
                <li key={a.sendId} className="rounded border border-deep-soil/8 bg-cream-canvas/30 px-2 py-1.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <Link
                      href={commsPlanPath(a.communicationPlanId, COMMS_PLAN_SECTION.execution)}
                      className="font-semibold text-civic-slate hover:underline"
                      title="Open plan at execution intelligence"
                    >
                      {a.planTitle}
                    </Link>
                    <time className="text-[10px] text-deep-soil/50" dateTime={a.updatedAt}>
                      {new Date(a.updatedAt).toLocaleString()}
                    </time>
                  </div>
                  <p className="text-[11px] text-deep-soil/80">{a.activityLabel}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className={card}>
        <h3 className={h2}>Plans that may need attention</h3>
        {ex.recentPlanExecutionRows.length === 0 ? (
          <p className={`mt-1 ${empty}`}>No plans with failures or in-flight execution right now.</p>
        ) : (
          <ul className="mt-1.5 space-y-1.5 text-sm">
            {ex.recentPlanExecutionRows.map((p) => (
              <li key={p.planId} className="flex flex-wrap items-baseline justify-between gap-2 rounded border border-deep-soil/8 bg-cream-canvas/20 px-2 py-1.5">
                <div>
                  <Link
                    href={commsPlanPath(p.planId, COMMS_PLAN_SECTION.attention)}
                    className="font-semibold text-civic-slate hover:underline"
                    title="Open plan at attention"
                  >
                    {p.planTitle}
                  </Link>
                  <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] text-deep-soil/55">
                    <CommsStatusBadge segment="plan" status={p.planStatus} />
                    <span>· {formatCommsFieldLabel(p.objective)}</span>
                  </p>
                </div>
                <div className="text-right font-mono text-[11px] text-deep-soil/80">
                  {p.failedCount > 0 ? <span className="text-rose-800">failed {p.failedCount}</span> : null}
                  {p.failedCount > 0 && (p.queuedCount > 0 || p.sendingCount > 0) ? " · " : null}
                  {p.queuedCount > 0 || p.sendingCount > 0 ? (
                    <span>
                      {p.queuedCount > 0 ? `queued ${p.queuedCount} ` : ""}
                      {p.sendingCount > 0 ? `sending ${p.sendingCount}` : ""}
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
