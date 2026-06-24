import Link from "next/link";

import { getVolunteerLeaderRoster } from "@/lib/volunteers/leader-roster";
import { leaderWorkbenchHref } from "@/lib/volunteers/build-leader-workbench-v2";
import { VOLUNTEER_TEAM_LANES } from "@/lib/volunteers/types";

function laneLabel(id: string): string {
  return VOLUNTEER_TEAM_LANES.find((l) => l.id === id)?.label ?? id;
}

export function VolunteerCommandView() {
  const roster = getVolunteerLeaderRoster();

  return (
    <div className="ep-chapter-body px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="ep-classification">Command · Kelly · Steve · Will</div>
        <h2 className="mt-3 font-heading text-3xl font-bold text-[var(--ep-navy)]">Volunteer leader roster</h2>
        <p className="mt-2 max-w-3xl text-sm text-[var(--ep-navy-muted)]">
          Complete roster for now — more leaders added as we go. Each leader signs in with their 3-letter code and the
          shared hub password.
        </p>

        <div className="mt-8 overflow-x-auto rounded-xl border border-[var(--ep-navy)]/10 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--ep-navy)]/10 bg-[var(--ep-cream)]/60 text-xs uppercase tracking-wide text-[var(--ep-navy-muted)]">
              <tr>
                <th className="px-4 py-3 font-semibold">Initials</th>
                <th className="px-4 py-3 font-semibold">Leader</th>
                <th className="px-4 py-3 font-semibold">Lanes</th>
                <th className="px-4 py-3 font-semibold">Notes</th>
                <th className="px-4 py-3 font-semibold">Workbench</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ep-navy)]/10">
              {roster.map((leader) => (
                <tr key={leader.slug} className="hover:bg-[var(--ep-cream)]/30">
                  <td className="px-4 py-3 font-mono font-bold text-[var(--ep-blue)]">{leader.initials}</td>
                  <td className="px-4 py-3 font-semibold text-[var(--ep-navy)]">{leader.displayName}</td>
                  <td className="px-4 py-3 text-[var(--ep-navy-muted)]">
                    {leader.teamLanes.map(laneLabel).join(" · ")}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--ep-navy-muted)]">{leader.notes ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Link href={leaderWorkbenchHref(leader.slug)} className="text-xs font-semibold text-[var(--ep-blue)] hover:underline">
                      Open v2 →
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
