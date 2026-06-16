"use client";

import Link from "next/link";

import { formatVotes } from "@/lib/election-plan/electionPlanData";
import { getSpecialKpiGoalForCity } from "@/lib/election-plan/load-special-kpi-goals";
import type { QuitmanBonusPlan } from "@/lib/election-plan/load-win-quitman-operation";
import { SpecialKpiGoalCard } from "@/components/election-plan/SpecialKpiGoalCard";
import { cn } from "@/lib/utils";

type Props = {
  plan: QuitmanBonusPlan;
  contactCount: number;
};

function ProgressBar({ current, goal, unit }: { current: number; goal: number; unit?: string }) {
  const pct = goal > 0 ? Math.min(100, (current / goal) * 100) : 0;
  const display =
    unit === "$" ? `$${current.toLocaleString()} / $${goal.toLocaleString()}` : `${current} / ${goal}`;

  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="font-semibold tabular-nums text-[var(--ep-navy)]">{display}</span>
        <span className="text-xs text-[var(--ep-navy-muted)]">{pct.toFixed(0)}%</span>
      </div>
      <div className="ep-progress mt-2">
        <div className="ep-progress-bar bg-[var(--ep-gold)]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function QuitmanBonusKpiPanel({ plan, contactCount }: Props) {
  const specialKpi = getSpecialKpiGoalForCity("quitman");
  const vp = plan.votePlan;

  return (
    <section id="quitman-bonus-plan" className="scroll-mt-28">
      <div className="ep-card border-2 border-[var(--ep-gold)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-gold)]">
              City #{plan.rank} · Bonus cushion plan
            </p>
            <h2 className="font-heading text-xl font-bold text-[var(--ep-navy)]">{plan.headline}</h2>
            <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{plan.isolationNote}</p>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold uppercase text-emerald-900">
            Isolated KPIs
          </span>
        </div>

        <p className="mt-3 text-sm">
          <span className="font-semibold text-[var(--ep-navy)]">County lead:</span>{" "}
          {plan.countyLead}
        </p>
        {plan.countyLeadContact ? (
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <a href={`tel:${plan.countyLeadContact.phone}`} className="font-semibold text-[var(--ep-navy)] underline">
              {plan.countyLeadContact.phone}
            </a>
            <a
              href={`mailto:${plan.countyLeadContact.email}`}
              className="font-semibold text-[var(--ep-navy)] underline"
            >
              {plan.countyLeadContact.email}
            </a>
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-[var(--ep-border)] bg-[var(--ep-cream)]/50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Fundraising</p>
            <ProgressBar current={plan.fundraising.current} goal={plan.fundraising.goal} unit="$" />
          </div>
          <div className="rounded-lg border border-[var(--ep-border)] bg-[var(--ep-cream)]/50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">House parties</p>
            <ProgressBar current={plan.houseParties.current} goal={plan.houseParties.goal} />
          </div>
          <div className="rounded-lg border border-[var(--ep-border)] bg-[var(--ep-cream)]/50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Conversations</p>
            <ProgressBar current={plan.conversations.current} goal={plan.conversations.goal} />
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-[var(--ep-border)] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">
              Chapter baseline (planning)
            </p>
            <p className="mt-2 font-heading text-2xl font-bold text-[var(--ep-navy)]">
              {formatVotes(vp.chapterTargetVotes)}
            </p>
            <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
              +{formatVotes(vp.chapterVoteGain)} gain · not in Top 40 combined total
            </p>
          </div>
          <div className="rounded-lg border-2 border-[var(--ep-gold)] bg-[var(--ep-gold)]/5 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">
              Vote stretch · +{vp.stretchIncreasePct}% vs 2022
            </p>
            <div className="mt-2 flex flex-wrap items-baseline gap-2">
              <span className="text-lg text-[var(--ep-navy-muted)] line-through">
                {formatVotes(vp.baseline2022SosVotes)} baseline
              </span>
              <span className="text-2xl font-bold text-[var(--ep-navy)]">→</span>
              <span className="font-heading text-2xl font-bold text-[var(--ep-navy)]">
                {formatVotes(vp.stretchTargetSosVotes)}
              </span>
            </div>
            <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">{vp.stretchNote}</p>
          </div>
        </div>

        {specialKpi ? (
          <div className="mt-6">
            <SpecialKpiGoalCard goal={specialKpi} variant="panel" />
          </div>
        ) : null}

        <div className="mt-6">
          <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Path to goal</h3>
          <ol className="mt-3 space-y-3">
            {plan.pathToGoal.map((step) => (
              <li key={step.step} className="flex gap-3 rounded-lg border border-[var(--ep-border)] p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--ep-navy)] text-sm font-bold text-white">
                  {step.step}
                </span>
                <div>
                  <p className="font-semibold text-[var(--ep-navy)]">{step.title}</p>
                  <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-6 rounded-lg border-2 border-[var(--ep-navy)] bg-[var(--ep-navy)]/5 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy)]">Tonight · field capture</p>
          <p className="mt-1 font-semibold text-[var(--ep-navy)]">{plan.tonightEvent.label}</p>
          {plan.houseParties.events[0]?.hostPhone ? (
            <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
              Host{" "}
              <span className="font-semibold text-[var(--ep-navy)]">
                {plan.houseParties.events[0].hostName}
              </span>
              {" · "}
              <a
                href={`tel:${plan.houseParties.events[0].hostPhone}`}
                className="font-semibold text-[var(--ep-navy)] underline"
              >
                {plan.houseParties.events[0].hostPhone}
              </a>
            </p>
          ) : null}
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
            {contactCount} contact{contactCount === 1 ? "" : "s"} captured from this workbench
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={plan.tonightEvent.captureHref}
              className={cn(
                "inline-flex min-h-[48px] items-center justify-center rounded-lg bg-[var(--ep-navy)] px-6 py-3",
                "text-sm font-bold uppercase tracking-wide text-white hover:bg-[var(--ep-navy)]/90",
              )}
            >
              Capture contact · standing with voter
            </Link>
            <Link
              href="/election-plan/workbenches/quitman/contacts"
              className="inline-flex min-h-[48px] items-center justify-center rounded-lg border-2 border-[var(--ep-navy)] px-6 py-3 text-sm font-semibold text-[var(--ep-navy)] hover:bg-white"
            >
              View all contacts →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
