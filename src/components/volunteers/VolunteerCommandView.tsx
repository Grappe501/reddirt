import Link from "next/link";

import { createLeaderGapTaskAction } from "@/app/election-plan/operators/ops-work-actions";
import type { CommandHeatmapRow } from "@/lib/volunteers/load-command-coverage";
import { getVolunteerLeaderRoster } from "@/lib/volunteers/leader-roster";
import type { LeaderGapTaskType } from "@/lib/volunteers/ops-work-items/leader-task-definitions";

function activityStyles(activity: CommandHeatmapRow["activity"]): string {
  if (activity === "active") return "bg-emerald-50 text-emerald-900 ring-emerald-200";
  if (activity === "warming") return "bg-amber-50 text-amber-950 ring-amber-200";
  return "bg-[var(--ep-cream)] text-[var(--ep-navy-muted)] ring-[var(--ep-navy)]/10";
}

function activityLabel(activity: CommandHeatmapRow["activity"]): string {
  if (activity === "active") return "Active";
  if (activity === "warming") return "Warming";
  return "Quiet";
}

type Props = {
  rows: CommandHeatmapRow[];
  openLeaderTasksBySlug?: Record<string, { id: string; title: string; signalId: string }>;
  statusMessage?: string | null;
};

function assignGapType(activity: CommandHeatmapRow["activity"]): LeaderGapTaskType | null {
  if (activity === "quiet") return "quiet";
  if (activity === "warming") return "my_five";
  return null;
}

export function VolunteerCommandView({ rows, openLeaderTasksBySlug = {}, statusMessage }: Props) {
  const roster = getVolunteerLeaderRoster();
  const notesBySlug = new Map(roster.map((l) => [l.slug, l.notes ?? "—"]));
  const active = rows.filter((r) => r.activity === "active").length;
  const quiet = rows.filter((r) => r.activity === "quiet").length;

  return (
    <div className="ep-chapter-body px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="ep-classification">Command roster v4.0 · live coverage</div>
        <h2 className="mt-3 font-heading text-3xl font-bold text-[var(--ep-navy)]">Volunteer leader roster</h2>
        <p className="mt-2 max-w-3xl text-sm text-[var(--ep-navy-muted)]">
          Field log quantities and leadership fills from live records — assign coaching tasks to quiet leaders from
          leader command.
        </p>

        {statusMessage ? (
          <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-900">{statusMessage}</p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <p>
            <span className="font-semibold text-emerald-800">{active}</span>{" "}
            <span className="text-[var(--ep-navy-muted)]">with live field or leadership records</span>
          </p>
          <p>
            <span className="font-semibold text-[var(--ep-navy)]">{quiet}</span>{" "}
            <span className="text-[var(--ep-navy-muted)]">quiet — need first logs or slot fills</span>
          </p>
        </div>

        <div className="mt-8 overflow-x-auto rounded-xl border border-[var(--ep-navy)]/10 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--ep-navy)]/10 bg-[var(--ep-cream)]/60 text-xs uppercase tracking-wide text-[var(--ep-navy-muted)]">
              <tr>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Initials</th>
                <th className="px-4 py-3 font-semibold">Leader</th>
                <th className="px-4 py-3 font-semibold">Field log</th>
                <th className="px-4 py-3 font-semibold">Leadership</th>
                <th className="px-4 py-3 font-semibold">Lanes</th>
                <th className="px-4 py-3 font-semibold">Notes</th>
                <th className="px-4 py-3 font-semibold">Task</th>
                <th className="px-4 py-3 font-semibold">Workbench</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ep-navy)]/10">
              {rows.map((row) => {
                const openTask = openLeaderTasksBySlug[row.slug];
                const gapType = assignGapType(row.activity);
                return (
                  <tr key={row.slug} className="hover:bg-[var(--ep-cream)]/30">
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ring-1 ${activityStyles(row.activity)}`}
                      >
                        {activityLabel(row.activity)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-[var(--ep-blue)]">{row.initials}</td>
                    <td className="px-4 py-3 font-semibold text-[var(--ep-navy)]">{row.displayName}</td>
                    <td className="px-4 py-3 tabular-nums text-[var(--ep-navy)]">{row.fieldEntryQty}</td>
                    <td className="px-4 py-3 text-[var(--ep-navy-muted)]">
                      {row.leadershipTotal ? `${row.leadershipFilled}/${row.leadershipTotal}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--ep-navy-muted)]">{row.lanes.join(" · ")}</td>
                    <td className="px-4 py-3 text-xs text-[var(--ep-navy-muted)]">{notesBySlug.get(row.slug) ?? "—"}</td>
                    <td className="px-4 py-3">
                      {openTask ? (
                        <Link
                          href={`${row.workbenchHref}#my-work`}
                          className="rounded-full border border-emerald-600/30 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-900"
                          title={openTask.title}
                        >
                          Task open
                        </Link>
                      ) : gapType ? (
                        <form action={createLeaderGapTaskAction}>
                          <input type="hidden" name="gapType" value={gapType} />
                          <input type="hidden" name="leaderSlug" value={row.slug} />
                          <input type="hidden" name="leaderName" value={row.displayName} />
                          <input type="hidden" name="returnTo" value="/election-plan/operators/leaders/command" />
                          <button
                            type="submit"
                            className="rounded-full bg-[var(--ep-gold)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--ep-navy)] hover:opacity-90"
                          >
                            Assign
                          </button>
                        </form>
                      ) : (
                        <span className="text-[10px] text-[var(--ep-navy-muted)]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={row.workbenchHref} className="text-xs font-semibold text-[var(--ep-blue)] hover:underline">
                        v4.0 →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-sm text-[var(--ep-navy-muted)]">
          <Link href="/election-plan/operators/leaders/me" className="font-semibold text-[var(--ep-blue)] hover:underline">
            ← Back to my workbench
          </Link>
        </p>
      </div>
    </div>
  );
}
