import Link from "next/link";

import {
  completeOpsTaskAction,
  createTaskFromSignalAction,
} from "@/app/election-plan/operators/ops-work-actions";
import type { OpsMyWorkPayload } from "@/lib/volunteers/ops-work-items";

type Props = {
  payload: OpsMyWorkPayload;
  surface?: "election-plan" | "admin";
  compact?: boolean;
  returnTo?: string;
  statusMessage?: string | null;
};

function surfaceStyles(surface: "election-plan" | "admin") {
  if (surface === "admin") {
    return {
      border: "border-kelly-navy/15",
      title: "text-kelly-navy",
      muted: "text-kelly-muted",
      gold: "text-kelly-slate",
      link: "text-kelly-navy",
    };
  }
  return {
    border: "border-[var(--ep-navy)]/15",
    title: "text-[var(--ep-navy)]",
    muted: "text-[var(--ep-navy-muted)]",
    gold: "text-[var(--ep-gold)]",
    link: "text-[var(--ep-blue)]",
  };
}

function statusLabel(code: string | null | undefined): string | null {
  if (!code) return null;
  const map: Record<string, string> = {
    created: "Task created from ladder signal.",
    already_open: "An open task already exists for that signal.",
    completed: "Task marked complete.",
    complete_failed: "Could not complete task — try again.",
    not_actionable: "Signal is green — no task needed.",
    missing_def: "No task template for that signal.",
    no_db: "Database not configured.",
  };
  return map[code] ?? null;
}

export function OperationsMyWorkPanel({
  payload,
  surface = "election-plan",
  compact = false,
  returnTo = "/election-plan/operators/my-work",
  statusMessage,
}: Props) {
  const s = surfaceStyles(surface);
  const items = compact ? payload.items.slice(0, 5) : payload.items;
  const banner = statusLabel(statusMessage);

  return (
    <section className={`rounded-xl border ${s.border} bg-white shadow-sm`}>
      <div className={`border-b ${s.border} px-5 py-4`}>
        <p className={`text-xs font-bold uppercase tracking-wide ${s.gold}`}>My work</p>
        <h2 className={`mt-1 font-heading text-lg font-bold ${s.title}`}>
          Open ops tasks from ladder signals
        </h2>
        {!compact ? (
          <p className={`mt-2 max-w-3xl text-sm ${s.muted}`}>
            Assign work from the operations command ladder; complete items here or on the admin task board.
          </p>
        ) : null}
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
          No open ops tasks. Use{" "}
          <Link href="/election-plan/operators" className={`font-semibold ${s.link} hover:underline`}>
            Assign task
          </Link>{" "}
          on a watch or action signal in the command ladder.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--ep-navy)]/10">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className={`font-semibold ${s.title}`}>{item.title}</p>
                {item.description ? (
                  <p className={`mt-1 text-sm ${s.muted}`}>{item.description}</p>
                ) : null}
                <p className={`mt-2 text-xs ${s.muted}`}>
                  {item.status.replace(/_/g, " ")} · {item.priority} ·{" "}
                  {item.assignedRole?.replace(/_/g, " ") ?? "Unassigned"}
                  {item.dueAt ? ` · due ${new Date(item.dueAt).toLocaleDateString()}` : ""}
                </p>
                {item.signalId ? (
                  <p className={`mt-1 text-[10px] uppercase tracking-wide ${s.muted}`}>
                    Signal: {item.signalId}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                {item.opsVisibility === "admin" ? (
                  <Link
                    href="/admin/tasks"
                    className="rounded-full border border-[var(--ep-navy)]/15 px-3 py-1 text-xs font-semibold hover:border-[var(--ep-gold)]"
                  >
                    Admin tasks
                  </Link>
                ) : null}
                <form action={completeOpsTaskAction}>
                  <input type="hidden" name="taskId" value={item.id} />
                  <input type="hidden" name="returnTo" value={returnTo} />
                  <button
                    type="submit"
                    className="rounded-full bg-[var(--ep-navy)] px-3 py-1 text-xs font-semibold text-white hover:opacity-90"
                  >
                    Mark done
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      {compact && payload.items.length > 5 ? (
        <div className={`border-t ${s.border} px-5 py-3`}>
          <Link href="/election-plan/operators/my-work" className={`text-xs font-semibold ${s.link} hover:underline`}>
            View all {payload.items.length} open tasks →
          </Link>
        </div>
      ) : null}
    </section>
  );
}
