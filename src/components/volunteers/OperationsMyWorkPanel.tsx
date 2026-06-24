import Link from "next/link";

import { completeOpsTaskAction } from "@/app/election-plan/operators/ops-work-actions";
import type { OpsMyWorkPayload, OpsWorkItemRow } from "@/lib/volunteers/ops-work-items";
import type { RoleInboxPayload } from "@/lib/volunteers/ops-work-items/load-role-inbox";

type Props = {
  payload: OpsMyWorkPayload | RoleInboxPayload;
  surface?: "election-plan" | "admin";
  compact?: boolean;
  returnTo?: string;
  statusMessage?: string | null;
  title?: string;
  subtitle?: string;
  viewAllHref?: string;
};

function surfaceStyles(surface: "election-plan" | "admin") {
  if (surface === "admin") {
    return {
      border: "border-kelly-navy/15",
      title: "text-kelly-navy",
      muted: "text-kelly-muted",
      gold: "text-kelly-slate",
      link: "text-kelly-navy",
      button: "bg-kelly-navy",
    };
  }
  return {
    border: "border-[var(--ep-navy)]/15",
    title: "text-[var(--ep-navy)]",
    muted: "text-[var(--ep-navy-muted)]",
    gold: "text-[var(--ep-gold)]",
    link: "text-[var(--ep-blue)]",
    button: "bg-[var(--ep-navy)]",
  };
}

function statusLabel(code: string | null | undefined): string | null {
  if (!code) return null;
  const map: Record<string, string> = {
    created: "Task created from ladder signal.",
    leader_task_created: "Leader coaching task created.",
    already_open: "An open task already exists for that item.",
    completed: "Task marked complete.",
    complete_failed: "Could not complete task — try again.",
    not_actionable: "Signal is green — no task needed.",
    missing_def: "No task template for that signal.",
    missing_leader: "Missing leader details for task creation.",
    no_db: "Database not configured.",
  };
  return map[code] ?? null;
}

function kindLabel(kind: OpsWorkItemRow["itemKind"]): string {
  const map: Record<OpsWorkItemRow["itemKind"], string> = {
    task: "Task",
    intake_escalation: "Intake",
    follow_up: "Follow-up",
    po5_gap: "My Five",
    blocked_task: "Blocked",
    overdue_task: "Overdue",
  };
  return map[kind];
}

function WorkItemRow({
  item,
  returnTo,
  s,
}: {
  item: OpsWorkItemRow;
  returnTo: string;
  s: ReturnType<typeof surfaceStyles>;
}) {
  return (
    <li className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
      <div className="min-w-0 flex-1">
        <p className={`font-semibold ${s.title}`}>{item.title}</p>
        {item.description ? <p className={`mt-1 text-sm ${s.muted}`}>{item.description}</p> : null}
        <p className={`mt-2 text-xs ${s.muted}`}>
          <span className="font-bold uppercase tracking-wide">{kindLabel(item.itemKind)}</span>
          {item.completable ? (
            <>
              {" "}
              · {item.status.replace(/_/g, " ")} · {item.priority}
            </>
          ) : null}
          {item.assignedRole ? ` · ${item.assignedRole.replace(/_/g, " ")}` : ""}
          {item.dueAt ? ` · due ${new Date(item.dueAt).toLocaleDateString()}` : ""}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <Link
          href={item.href}
          className={`rounded-full border border-[var(--ep-navy)]/15 px-3 py-1 text-xs font-semibold hover:border-[var(--ep-gold)] ${s.link}`}
        >
          Open
        </Link>
        {item.completable ? (
          <form action={completeOpsTaskAction}>
            <input type="hidden" name="taskId" value={item.id} />
            <input type="hidden" name="returnTo" value={returnTo} />
            <button
              type="submit"
              className={`rounded-full px-3 py-1 text-xs font-semibold text-white hover:opacity-90 ${s.button}`}
            >
              Mark done
            </button>
          </form>
        ) : null}
      </div>
    </li>
  );
}

export function OperationsMyWorkPanel({
  payload,
  surface = "election-plan",
  compact = false,
  returnTo = "/election-plan/operators/my-work",
  statusMessage,
  title = "Open ops tasks from ladder signals",
  subtitle = "Assign work from the operations command ladder; complete items here or on the admin task board.",
  viewAllHref = "/election-plan/operators/my-work",
}: Props) {
  const s = surfaceStyles(surface);
  const sections = "sections" in payload && payload.sections?.length ? payload.sections : null;
  const items = compact ? payload.items.slice(0, 5) : payload.items;
  const banner = statusLabel(statusMessage);

  return (
    <section className={`rounded-xl border ${s.border} bg-white shadow-sm`}>
      <div className={`border-b ${s.border} px-5 py-4`}>
        <p className={`text-xs font-bold uppercase tracking-wide ${s.gold}`}>My work</p>
        <h2 className={`mt-1 font-heading text-lg font-bold ${s.title}`}>{title}</h2>
        {!compact && subtitle ? <p className={`mt-2 max-w-3xl text-sm ${s.muted}`}>{subtitle}</p> : null}
        {!payload.dbAvailable ? (
          <p className="mt-2 text-xs text-amber-800">
            Database not configured — ops tasks need <code className="text-[10px]">DATABASE_URL</code>.
          </p>
        ) : null}
        {banner ? (
          <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-900">{banner}</p>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className={`px-5 py-6 text-sm ${s.muted}`}>
          No open work items. Check the command ladder or your workbench sections for next steps.
        </p>
      ) : sections && !compact ? (
        <div className="divide-y divide-[var(--ep-navy)]/10">
          {sections.map((section) =>
            section.items.length ? (
              <div key={section.id}>
                <p className={`px-5 pt-4 text-xs font-bold uppercase tracking-wide ${s.gold}`}>{section.label}</p>
                <ul>
                  {section.items.map((item) => (
                    <WorkItemRow key={item.id} item={item} returnTo={returnTo} s={s} />
                  ))}
                </ul>
              </div>
            ) : null,
          )}
        </div>
      ) : (
        <ul className="divide-y divide-[var(--ep-navy)]/10">
          {items.map((item) => (
            <WorkItemRow key={item.id} item={item} returnTo={returnTo} s={s} />
          ))}
        </ul>
      )}

      {compact && payload.items.length > 5 ? (
        <div className={`border-t ${s.border} px-5 py-3`}>
          <Link href={viewAllHref} className={`text-xs font-semibold ${s.link} hover:underline`}>
            View all {payload.items.length} open items →
          </Link>
        </div>
      ) : null}
    </section>
  );
}
