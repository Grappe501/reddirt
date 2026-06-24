import Link from "next/link";

import type { CommandHeatmapRow } from "@/lib/volunteers/load-command-coverage";
import { getVolunteerLeaderRoster } from "@/lib/volunteers/leader-roster";

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
};

export function VolunteerCommandView({ rows }: Props) {
  const roster = getVolunteerLeaderRoster();
  const notesBySlug = new Map(roster.map((l) => [l.slug, l.notes ?? "—"]));
  const active = rows.filter((r) => r.activity === "active").length;
  const quiet = rows.filter((r) => r.activity === "quiet").length;

  return (
    <div className="ep-chapter-body px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="ep-classification">Command roster v3.4 · live coverage</div>
        <h2 className="mt-3 font-heading text-3xl font-bold text-[var(--ep-navy)]">Volunteer leader roster</h2>
        <p className="mt-2 max-w-3xl text-sm text-[var(--ep-navy-muted)]">
          Field log quantities and leadership fills from live records — green means activity exists, quiet means first
          touch still needed.
        </p>

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
                <th className="px-4 py-3 font-semibold">Workbench</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ep-navy)]/10">
              {rows.map((row) => (
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
                    <Link href={row.workbenchHref} className="text-xs font-semibold text-[var(--ep-blue)] hover:underline">
                      v3.4 →
                    </Link>
                  </td>
                </tr>
              ))}
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
