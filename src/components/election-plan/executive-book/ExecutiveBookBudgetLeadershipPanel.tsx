import Link from "next/link";

import { formatBudget } from "@/lib/election-plan/electionPlanData";
import {
  executiveBookBudgetDashboardHref,
  getExecutiveBookBudgetLeadership,
  laborDayResourceGapHref,
  type BudgetLeadershipModel,
} from "@/lib/election-plan/load-executive-book-budget-leadership";

function formatAmount(amount: number): string {
  if (amount < 0) {
    return `(${formatBudget(Math.abs(amount))})`;
  }
  return formatBudget(amount);
}

function LeadershipHeadline({ model }: { model: BudgetLeadershipModel }) {
  const { fundraising } = model;
  const pct = Math.round((fundraising.raisedToDate / fundraising.workingCampaignGoal) * 100);

  return (
    <div className="rounded-xl border-2 border-[var(--ep-gold)] bg-gradient-to-br from-amber-50 to-white p-6">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-navy-muted)]">
        Leadership answer
      </p>
      <h2 className="mt-2 font-heading text-xl font-bold text-[var(--ep-navy)]">{model.headlineQuestion}</h2>
      <div className="mt-4 flex flex-wrap items-end gap-6">
        <div>
          <div className="text-3xl font-bold tabular-nums text-[var(--ep-navy)]">
            {formatBudget(fundraising.remainingToRaise)}
          </div>
          <div className="text-sm text-[var(--ep-navy-muted)]">remaining to raise by Election Day</div>
        </div>
        <div>
          <div className="text-lg font-semibold tabular-nums text-[var(--ep-navy)]">
            {formatBudget(fundraising.raisedToDate)} raised
          </div>
          <div className="text-sm text-[var(--ep-navy-muted)]">
            {pct}% of {formatBudget(fundraising.workingCampaignGoal)} working target
          </div>
        </div>
      </div>
      <p className="mt-3 text-sm text-[var(--ep-navy-muted)]">{fundraising.rampUpNote}</p>
    </div>
  );
}

function CategoryTable({ model }: { model: BudgetLeadershipModel }) {
  const displayCategories = model.categories.filter((c) => c.id !== "salary");

  return (
    <div className="ep-card overflow-x-auto">
      <h2 className="font-heading font-bold text-[var(--ep-navy)]">Campaign budget by category</h2>
      <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{model.disclaimer}</p>
      <table className="mt-4 w-full min-w-[24rem] text-sm">
        <thead>
          <tr className="border-b border-[var(--ep-border)] text-left text-xs uppercase text-[var(--ep-navy-muted)]">
            <th className="pb-2 pr-3">Category</th>
            <th className="pb-2 text-right">Budget</th>
          </tr>
        </thead>
        <tbody>
          {displayCategories.map((row) => (
            <tr key={row.id} className="border-b border-[var(--ep-border)] last:border-0">
              <td className="py-2 pr-3">
                <span className="font-medium">{row.label}</span>
                {row.notes ? (
                  <p className="mt-0.5 text-xs text-[var(--ep-navy-muted)]">{row.notes}</p>
                ) : null}
              </td>
              <td className="py-2 text-right font-semibold tabular-nums">{formatAmount(row.amount)}</td>
            </tr>
          ))}
          <tr className="border-t-2 border-[var(--ep-navy)] bg-slate-50">
            <td className="py-2 pr-3 font-bold">Kelly salary floor (leave-of-absence)</td>
            <td className="py-2 text-right font-bold tabular-nums">
              {formatBudget(model.categories.find((c) => c.id === "salary")?.amount ?? 72000)}
            </td>
          </tr>
          <tr className="bg-[var(--ep-navy)] text-white">
            <td className="py-3 pr-3 font-bold">Total</td>
            <td className="py-3 text-right text-lg font-bold tabular-nums">
              {formatBudget(model.workingCampaignTotal)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function FundraisingTargetsTable({ model }: { model: BudgetLeadershipModel }) {
  const { fundraising } = model;

  return (
    <div className="ep-card overflow-x-auto">
      <h2 className="font-heading font-bold text-[var(--ep-navy)]">Fundraising targets</h2>
      <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
        Monthly goals through Election Day · total remaining {formatBudget(fundraising.remainingToRaise)}
      </p>
      <table className="mt-4 w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--ep-border)] text-left text-xs uppercase text-[var(--ep-navy-muted)]">
            <th className="pb-2 pr-3">Period</th>
            <th className="pb-2 text-right">Goal</th>
          </tr>
        </thead>
        <tbody>
          {fundraising.monthlyTargets.map((row) => (
            <tr key={row.month} className="border-b border-[var(--ep-border)]">
              <td className="py-2 pr-3">
                <span className="font-medium">{row.period}</span>
                {row.notes ? <p className="text-xs text-[var(--ep-navy-muted)]">{row.notes}</p> : null}
              </td>
              <td className="py-2 text-right font-semibold tabular-nums">{formatBudget(row.goal)}</td>
            </tr>
          ))}
          <tr className="border-t-2 border-[var(--ep-navy)] bg-slate-50">
            <td className="py-2 pr-3 font-bold">Total remaining</td>
            <td className="py-2 text-right font-bold tabular-nums">{formatBudget(fundraising.remainingToRaise)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

type Props = {
  variant?: "chapter" | "dashboard";
};

export function ExecutiveBookBudgetLeadershipPanel({ variant = "chapter" }: Props) {
  const model = getExecutiveBookBudgetLeadership();

  return (
    <section className="space-y-6">
      <LeadershipHeadline model={model} />

      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryTable model={model} />
        <FundraisingTargetsTable model={model} />
      </div>

      {variant === "dashboard" ? (
        <>
          <div className="ep-card">
            <h2 className="font-heading font-bold text-[var(--ep-navy)]">Fundraising sources</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {model.fundraising.sources.map((s) => (
                <li key={s.id} className="flex gap-2">
                  <span className="font-medium text-[var(--ep-navy)]">{s.label}</span>
                  <span className="text-[var(--ep-navy-muted)]">— {s.shareNote}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="ep-card">
            <h2 className="font-heading font-bold text-[var(--ep-navy)]">Scenario comparison</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-[var(--ep-border)] p-3">
                <div className="text-xs uppercase text-[var(--ep-navy-muted)]">Bare minimum</div>
                <div className="text-lg font-bold tabular-nums">{formatBudget(model.scenarios.bareMinimum)}</div>
              </div>
              <div className="rounded-lg border-2 border-[var(--ep-gold)] bg-amber-50 p-3">
                <div className="text-xs uppercase text-[var(--ep-navy-muted)]">Working campaign</div>
                <div className="text-lg font-bold tabular-nums">{formatBudget(model.scenarios.working)}</div>
              </div>
              <div className="rounded-lg border border-[var(--ep-border)] p-3">
                <div className="text-xs uppercase text-[var(--ep-navy-muted)]">Aggressive statewide</div>
                <div className="text-lg font-bold tabular-nums">{formatBudget(model.scenarios.aggressive)}</div>
              </div>
            </div>
            <p className="mt-3 text-sm text-[var(--ep-navy-muted)]">
              Monthly burn (working):{" "}
              <strong className="text-[var(--ep-navy)]">{formatBudget(model.scenarios.monthlyBurnWorking)}/month</strong>
            </p>
          </div>

          <div className="ep-card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-heading font-bold text-[var(--ep-navy)]">Labor Day resource gaps</h2>
              <Link href={laborDayResourceGapHref()} className="text-xs font-semibold text-[var(--ep-navy)] hover:underline">
                Full report →
              </Link>
            </div>
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--ep-border)] text-left text-xs uppercase text-[var(--ep-navy-muted)]">
                  <th className="pb-2 pr-3">Item</th>
                  <th className="pb-2 pr-3">Deadline</th>
                  <th className="pb-2 pr-3">Priority</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {model.laborDayFundingPriorities.map((row) => (
                  <tr key={row.item} className="border-b border-[var(--ep-border)] last:border-0">
                    <td className="py-2 pr-3 font-medium">{row.item}</td>
                    <td className="py-2 pr-3 tabular-nums">{row.deadline}</td>
                    <td className="py-2 pr-3">
                      <span
                        className={
                          row.priority === "critical"
                            ? "rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase text-red-900"
                            : "rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-900"
                        }
                      >
                        {row.priority}
                      </span>
                    </td>
                    <td className="py-2 capitalize">{row.status.replace("_", " ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="text-sm">
          <Link href={executiveBookBudgetDashboardHref()} className="font-semibold text-[var(--ep-navy)] hover:underline">
            Open full budget dashboard →
          </Link>
        </p>
      )}
    </section>
  );
}
