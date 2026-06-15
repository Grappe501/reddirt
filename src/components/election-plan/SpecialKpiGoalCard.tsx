import Link from "next/link";

import { formatVotes } from "@/lib/election-plan/electionPlanData";
import {
  specialKpiGapToTarget,
  specialKpiProgressPct,
  specialKpiTargetVotes,
  type SpecialKpiGoal,
} from "@/lib/election-plan/load-special-kpi-goals";

type Props = {
  goal: SpecialKpiGoal;
  variant?: "strip" | "panel";
};

export function SpecialKpiGoalCard({ goal, variant = "strip" }: Props) {
  const target = specialKpiTargetVotes(goal);
  const progress = specialKpiProgressPct(goal);
  const gap = specialKpiGapToTarget(goal);
  const isPanel = variant === "panel";

  return (
    <div className={`${isPanel ? "ep-card" : "ep-card h-full"} border-l-4 border-[var(--ep-gold)]`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">Special KPI</p>
          <h3 className="mt-1 font-heading text-lg font-bold text-[var(--ep-navy)]">{goal.locationName}</h3>
          {goal.eventLabel ? (
            <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{goal.eventLabel}</p>
          ) : null}
        </div>
        <span className="rounded-full bg-[var(--ep-gold)]/15 px-3 py-1 text-[10px] font-bold uppercase text-[var(--ep-navy)]">
          Tracked
        </span>
      </div>

      <p className="mt-3 text-sm font-semibold text-[var(--ep-navy)]">{goal.label}</p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--ep-navy-muted)]">{goal.description}</p>

      <div className="mt-4">
        <div className="flex items-baseline justify-between gap-2 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">
            SOS votes tracked
          </span>
          <span className="font-heading text-xl font-bold text-[var(--ep-navy)]">
            {formatVotes(goal.currentSosVotes)} / {formatVotes(target)}
          </span>
        </div>
        <div className="ep-progress mt-2">
          <div className="ep-progress-bar bg-[var(--ep-gold)]" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
          {progress.toFixed(1)}% of target · {formatVotes(gap)} votes to go
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
        <div>
          <p className="text-xs uppercase text-[var(--ep-navy-muted)]">2022 SOS baseline</p>
          <p className="font-semibold">{goal.baseline2022SosVotes.toLocaleString()}</p>
        </div>
        {goal.goalType === "sos_lift_pct" ? (
          <>
            <div>
              <p className="text-xs uppercase text-[var(--ep-navy-muted)]">Target lift</p>
              <p className="font-semibold">+{goal.targetIncreasePct}%</p>
            </div>
            <div>
              <p className="text-xs uppercase text-[var(--ep-navy-muted)]">2026 SOS target</p>
              <p className="font-semibold">{goal.targetSosVotes?.toLocaleString()}</p>
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="text-xs uppercase text-[var(--ep-navy-muted)]">Win threshold</p>
              <p className="font-semibold">50%+1</p>
            </div>
            <div>
              <p className="text-xs uppercase text-[var(--ep-navy-muted)]">Majority @ planning turnout</p>
              <p className="font-semibold">{goal.targetSosVotesMajority?.toLocaleString()}</p>
            </div>
          </>
        )}
      </div>

      {goal.goalType === "county_majority" ? (
        <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">
          Planning basis: {goal.planningTurnoutBasis} · 2022 opponent SOS:{" "}
          {goal.baseline2022SosOpponentVotes?.toLocaleString()}
          {goal.currentWinPct != null ? ` · Current win %: ${goal.currentWinPct.toFixed(1)}%` : null}
        </p>
      ) : null}

      <p className="mt-2 text-[10px] text-[var(--ep-navy-muted)]">{goal.baselineSource}</p>

      <Link href={goal.href} className="mt-4 inline-block text-sm font-semibold text-[var(--ep-navy)] underline">
        {goal.scope === "county" ? "County playbook" : "City location brief"} →
      </Link>
    </div>
  );
}
