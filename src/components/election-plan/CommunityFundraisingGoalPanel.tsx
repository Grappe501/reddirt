import { formatBudget, formatVotes } from "@/lib/election-plan/electionPlanData";
import type { FosCommunityAllocation } from "@/lib/election-plan/load-fundraising-operating-system";
import { getFosConfig } from "@/lib/election-plan/load-fundraising-operating-system";

type Props = {
  allocation: FosCommunityAllocation;
};

export function CommunityFundraisingGoalPanel({ allocation }: Props) {
  const config = getFosConfig();

  return (
    <div className="rounded-lg border border-[var(--ep-border)] bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--ep-gold)]">
            Fundraising Operating System
          </p>
          <h3 className="mt-1 font-heading text-lg font-bold text-[var(--ep-navy)]">Fundraising goal</h3>
        </div>
        {allocation.isBonusCity ? (
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase text-violet-900">
            Bonus city
          </span>
        ) : null}
      </div>

      <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
        Allocated by vote target — not population, not equal share.{" "}
        <span className="font-mono text-[11px]">{config.formulaExpression}</span>
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">Vote goal</div>
          <div className="mt-1 font-heading text-xl font-bold tabular-nums text-[var(--ep-navy)]">
            {formatVotes(allocation.voteGoal)}
          </div>
          <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
            {allocation.voteSharePct.toFixed(2)}% of Top 40 vote pool
          </p>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">Base goal</div>
          <div className="mt-1 font-heading text-xl font-bold tabular-nums text-[var(--ep-navy)]">
            {formatBudget(allocation.baseGoal)}
          </div>
          <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">Victory math · {allocation.formulaNote}</p>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">Stretch goal</div>
          <div className="mt-1 font-heading text-xl font-bold tabular-nums text-[var(--ep-navy)]">
            {formatBudget(allocation.stretchGoal)}
          </div>
          <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">House parties · events · campus upside</p>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">Raised</div>
          <div className="mt-1 font-heading text-xl font-bold tabular-nums text-[var(--ep-navy)]">
            {formatBudget(allocation.raised)}
          </div>
          <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{allocation.raisedNote}</p>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex justify-between text-xs">
          <span className="font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">Base progress</span>
          <span className="tabular-nums font-semibold">
            {formatBudget(allocation.raised)} / {formatBudget(allocation.baseGoal)} · {Math.round(allocation.progressPct)}%
          </span>
        </div>
        <div className="ep-progress mt-2">
          <div className="ep-progress-bar bg-[var(--ep-gold)]" style={{ width: `${allocation.progressPct}%` }} />
        </div>
        <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
          Remaining to base goal: {formatBudget(allocation.remaining)} · Gap to stretch:{" "}
          {formatBudget(Math.max(0, allocation.stretchGoal - allocation.raised))}
        </p>
      </div>

      <div className="mt-5 rounded-md bg-slate-50 p-3 text-xs leading-relaxed text-[var(--ep-navy-muted)]">
        <strong className="text-[var(--ep-navy)]">Scorecard:</strong> Vote goal {formatVotes(allocation.voteGoal)} · Base{" "}
        {formatBudget(allocation.baseGoal)} · Raised {formatBudget(allocation.raised)} · Stretch{" "}
        {formatBudget(allocation.stretchGoal)} · Gap to base {formatBudget(allocation.remaining)}
      </div>
    </div>
  );
}
