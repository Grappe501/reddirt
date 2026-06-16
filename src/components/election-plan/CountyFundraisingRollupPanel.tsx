import Link from "next/link";

import { formatBudget, formatVotes } from "@/lib/election-plan/electionPlanData";
import type { FosCountyRollup } from "@/lib/election-plan/load-fundraising-operating-system";
import { communityWorkbenchHref } from "@/lib/election-plan/community-workbench/links";

type Props = {
  rollup: FosCountyRollup;
};

export function CountyFundraisingRollupPanel({ rollup }: Props) {
  return (
    <div className="rounded-lg border border-[var(--ep-border)] bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--ep-gold)]">
        Fundraising Operating System
      </p>
      <h3 className="mt-1 font-heading text-lg font-bold text-[var(--ep-navy)]">County fundraising rollup</h3>
      {rollup.clusterName ? (
        <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
          Cluster: {rollup.clusterName}
        </p>
      ) : null}

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">Combined base</div>
          <div className="mt-1 font-heading text-2xl font-bold tabular-nums text-[var(--ep-navy)]">
            {formatBudget(rollup.baseGoal)}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">Combined stretch</div>
          <div className="mt-1 font-heading text-2xl font-bold tabular-nums text-[var(--ep-navy)]">
            {formatBudget(rollup.stretchGoal)}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">Raised</div>
          <div className="mt-1 font-heading text-2xl font-bold tabular-nums text-[var(--ep-navy)]">
            {formatBudget(rollup.raised)}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">Vote goal</div>
          <div className="mt-1 font-heading text-2xl font-bold tabular-nums text-[var(--ep-navy)]">
            {formatVotes(rollup.voteGoal)}
          </div>
        </div>
      </div>

      <div className="ep-progress mt-4">
        <div className="ep-progress-bar bg-[var(--ep-gold)]" style={{ width: `${rollup.progressPct}%` }} />
      </div>
      <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
        {Math.round(rollup.progressPct)}% of county base · {formatBudget(rollup.remaining)} remaining
      </p>

      {rollup.communities.length > 0 ? (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-[var(--ep-border)] text-left text-xs uppercase tracking-wide text-[var(--ep-navy-muted)]">
                <th className="py-2 pr-3 font-semibold">Community</th>
                <th className="py-2 pr-3 font-semibold">Vote goal</th>
                <th className="py-2 pr-3 font-semibold">Base</th>
                <th className="py-2 pr-3 font-semibold">Stretch</th>
                <th className="py-2 font-semibold">Raised</th>
              </tr>
            </thead>
            <tbody>
              {rollup.communities.map((c) => (
                <tr key={c.slug} className="border-b border-[var(--ep-border)]/60">
                  <td className="py-2 pr-3">
                    <Link
                      href={`${communityWorkbenchHref(c.slug)}#fundraising`}
                      className="font-semibold text-[var(--ep-navy)] hover:text-[var(--ep-gold)]"
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td className="py-2 pr-3 tabular-nums">{formatVotes(c.voteGoal)}</td>
                  <td className="py-2 pr-3 tabular-nums">{formatBudget(c.baseGoal)}</td>
                  <td className="py-2 pr-3 tabular-nums">{formatBudget(c.stretchGoal)}</td>
                  <td className="py-2 tabular-nums">{formatBudget(c.raised)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-4 text-sm text-[var(--ep-navy-muted)]">
          No Top 40 community allocations in this county yet — goals roll up when city workbenches have vote targets.
        </p>
      )}
    </div>
  );
}
