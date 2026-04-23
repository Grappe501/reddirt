import Link from "next/link";
import { CommsExecutionDashboardSection } from "@/components/admin/comms-workbench/CommsExecutionDashboardSection";
import { CommsStatusBadge } from "@/components/admin/comms-workbench/CommsStatusBadge";
import { COMMS_APP_PATHS, commsMediaPath, commsPlanPath } from "@/lib/comms-workbench/comms-nav";
import { COMMS_EMPTY } from "@/lib/comms-workbench/comms-section-copy";
import type { CommunicationPlanListItem, CommsWorkbenchDashboardData, MediaOutreachListItem } from "@/lib/comms-workbench/dto";
import type { CommunicationPlanStatus } from "@prisma/client";
import { getPlanStatusDisplay } from "@/lib/comms-workbench/status-display";
import { formatCommsFieldLabel } from "@/lib/comms-workbench/ui-labels";

const card = "rounded-md border border-deep-soil/10 bg-white p-3 shadow-sm min-w-0";
const h2 = "font-heading text-[10px] font-bold uppercase tracking-wider text-deep-soil/55";
const empty = "rounded border border-dashed border-deep-soil/20 bg-cream-canvas/50 px-3 py-4 text-center font-body text-sm text-deep-soil/60";

function PlanRowLinks({ title, items }: { title: string; items: CommunicationPlanListItem[] }) {
  if (items.length === 0) {
    return (
      <section>
        <h2 className={h2}>{title}</h2>
        <p className={`mt-1 ${empty}`}>No items in this section yet.</p>
      </section>
    );
  }
  return (
    <section>
      <h2 className={h2}>{title}</h2>
      <ul className="mt-1.5 space-y-1">
        {items.slice(0, 10).map((p) => (
          <li key={p.id} className="flex flex-wrap items-baseline justify-between gap-2 rounded border border-deep-soil/8 bg-cream-canvas/30 px-2 py-1.5 text-sm">
            <Link href={commsPlanPath(p.id)} className="font-semibold text-civic-slate hover:underline">
              {p.title}
            </Link>
            <span className="flex flex-wrap items-center justify-end gap-1.5 text-[10px] text-deep-soil/50">
              <CommsStatusBadge segment="plan" status={p.status} />
              <span>· {formatCommsFieldLabel(p.objective)}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function MediaRowLinks({ title, items }: { title: string; items: MediaOutreachListItem[] }) {
  if (items.length === 0) {
    return (
      <section>
        <h2 className={h2}>{title}</h2>
        <p className={`mt-1 ${empty}`}>No follow-up items right now.</p>
      </section>
    );
  }
  return (
    <section>
      <h2 className={h2}>{title}</h2>
      <ul className="mt-1.5 space-y-1">
        {items.map((m) => (
          <li key={m.id} className="flex flex-wrap items-baseline justify-between gap-2 rounded border border-deep-soil/8 bg-cream-canvas/30 px-2 py-1.5 text-sm">
            <Link href={commsMediaPath(m.id)} className="font-semibold text-civic-slate hover:underline">
              {m.title}
            </Link>
            <span className="text-[10px] text-deep-soil/50">
              {formatCommsFieldLabel(m.status)} {m.urgency ? `· ${formatCommsFieldLabel(m.urgency)}` : ""}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CommsWorkbenchDashboardView({ data }: { data: CommsWorkbenchDashboardData }) {
  const { byStatus, total } = data.statusCounts;
  const ex = data.execution;
  const hasAnyActivity =
    data.plansNeedingAction.length > 0 ||
    data.plansReadyForReview.length > 0 ||
    data.scheduledSoon.length > 0 ||
    data.activeRapidResponsePlans.length > 0 ||
    data.activeVolunteerRecruitmentPlans.length > 0 ||
    data.recentMediaOutreachFollowupsDue.length > 0 ||
    data.newestUpdatedPlanRows.length > 0 ||
    ex.totalPlannedSends > 0;

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-bold text-deep-soil">Comms operations</h1>
          <p className="mt-1 max-w-2xl font-body text-sm text-deep-soil/70">
            Message plans, drafts, and provenance in the new workbench graph. Queue and send execution rollups are shown below. Legacy
            threads and broadcasts stay on their existing tools — see the bottom of the page.
          </p>
        </div>
        <div className={`${card} max-w-sm shrink-0`}>
          <p className={h2}>Plan status snapshot</p>
          <p className="mt-1 font-body text-2xl font-bold text-deep-soil">{total}</p>
          <p className="text-xs text-deep-soil/55">Total communication plans in the graph.</p>
          <p className="mt-2">
            <Link
              href={COMMS_APP_PATHS.plansNew}
              className="inline-block rounded border border-civic-slate/30 bg-civic-slate/10 px-2.5 py-1 text-xs font-bold text-civic-slate hover:bg-civic-slate/20"
            >
              New message plan
            </Link>
          </p>
          {total === 0 ? (
            <p className="mt-2 text-xs text-deep-soil/60">No plans yet—use &quot;New message plan&quot; to create one.</p>
          ) : (
            <ul className="mt-2 max-h-28 space-y-0.5 overflow-y-auto text-[11px] text-deep-soil/75">
              {Object.entries(byStatus).map(([k, n]) =>
                typeof n === "number" && n > 0 ? (
                  <li key={k} className="flex justify-between gap-2">
                    <span>{getPlanStatusDisplay(k as CommunicationPlanStatus).label}</span>
                    <span className="font-mono text-deep-soil/90">{n}</span>
                  </li>
                ) : null
              )}
            </ul>
          )}
        </div>
      </div>

      {!hasAnyActivity && total === 0 ? (
        <p className={empty}>
          {COMMS_EMPTY.dashboardNoComms}{" "}
          <Link className="font-semibold text-civic-slate" href={COMMS_APP_PATHS.plans}>
            Open message plans
          </Link>
        </p>
      ) : null}

      <div className={card}>
        <CommsExecutionDashboardSection ex={ex} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className={`${card} space-y-4`}>
          <PlanRowLinks title="Needs attention" items={data.plansNeedingAction} />
          <PlanRowLinks title="Ready for review" items={data.plansReadyForReview} />
          <PlanRowLinks title="Scheduled in the next 7 days" items={data.scheduledSoon} />
        </div>
        <div className={`${card} space-y-4`}>
          <PlanRowLinks title="Rapid response" items={data.activeRapidResponsePlans} />
          <PlanRowLinks title="Volunteer recruitment" items={data.activeVolunteerRecruitmentPlans} />
          <MediaRowLinks title="Media follow-ups due" items={data.recentMediaOutreachFollowupsDue} />
        </div>
      </div>

      <div className={card}>
        <h2 className={h2}>Recently updated plans</h2>
        {data.newestUpdatedPlanRows.length === 0 ? (
          <p className={`mt-1 ${empty}`}>No plans to show yet.</p>
        ) : (
          <ul className="mt-1.5 space-y-1">
            {data.newestUpdatedPlanRows.map((p) => (
              <li key={p.id} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-deep-soil/5 py-1.5 text-sm last:border-0">
                <Link href={commsPlanPath(p.id)} className="font-semibold text-civic-slate hover:underline">
                  {p.title}
                </Link>
                <time className="text-[10px] text-deep-soil/50" dateTime={p.updatedAt}>
                  {new Date(p.updatedAt).toLocaleString()}
                </time>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-right">
          <Link href={COMMS_APP_PATHS.plans} className="text-xs font-semibold text-civic-slate">
            All message plans →
          </Link>
        </p>
      </div>
    </div>
  );
}
