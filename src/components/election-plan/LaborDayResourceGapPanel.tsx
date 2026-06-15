import Link from "next/link";

import {
  getExecutiveBookBudgetLeadership,
  executiveBookBudgetDashboardHref,
} from "@/lib/election-plan/load-executive-book-budget-leadership";
import { getFreshmanWeekReadinessRollup } from "@/lib/election-plan/load-movement-infrastructure";
import {
  getCitizenVoicesLteModel,
  campusCaptainDashboardHref,
  freshmanWeekReadinessHref,
  citizenVoicesLteHref,
} from "@/lib/election-plan/load-citizen-voices-lte";
import { formatBudget } from "@/lib/election-plan/electionPlanData";

export function LaborDayResourceGapPanel() {
  const budget = getExecutiveBookBudgetLeadership();
  const freshman = getFreshmanWeekReadinessRollup();
  const lte = getCitizenVoicesLteModel();

  const gaps = [
    {
      area: "Fundraising",
      gap: `${formatBudget(budget.fundraising.remainingToRaise)} remaining to working target`,
      status: budget.fundraising.raisedToDate >= budget.fundraising.workingCampaignGoal * 0.5 ? "at_risk" : "critical",
      href: executiveBookBudgetDashboardHref(),
    },
    {
      area: "Freshman Week",
      gap: `${freshman.summary.fullyReady}/${freshman.summary.total} campuses fully ready · target ${freshman.targetDate}`,
      status: freshman.summary.fullyReady === 0 ? "critical" : "at_risk",
      href: freshmanWeekReadinessHref(),
    },
    {
      area: "Campus captains",
      gap: `${freshman.summary.captainsAssigned}/${freshman.summary.total} captains assigned`,
      status: freshman.summary.captainsAssigned === 0 ? "critical" : "at_risk",
      href: campusCaptainDashboardHref(),
    },
    {
      area: "Arkansas Citizen Voices (LTE)",
      gap: `${lte.rollup.coordinatorsAssigned}/${lte.rollup.outletsTracked} newspaper coordinators · ${lte.rollup.foundingWriters}/${lte.rollup.foundingWritersGoal} founding writers by Labor Day`,
      status: lte.rollup.foundingWriters < lte.rollup.foundingWritersGoal / 2 ? "critical" : "at_risk",
      href: citizenVoicesLteHref(),
    },
    {
      area: "LTE publications",
      gap: `${lte.rollup.lettersPublished} letters published · goal: every week, every region`,
      status: lte.rollup.lettersPublished === 0 ? "critical" : "at_risk",
      href: citizenVoicesLteHref(),
    },
  ];

  return (
    <section>
      <Link href="/election-plan/executive-book/labor-day" className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
        ← Executive Book · Labor Day chapter
      </Link>
      <div className="mt-2">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-gold)]">Phase 18.7A</p>
        <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">Labor Day Resource Gap Report</h1>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
          What must be funded and operational before {freshman.laborDayGate} — Labor Day gate
        </p>
      </div>

      <div className="my-6 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{formatBudget(budget.fundraising.remainingToRaise)}</div>
          <div className="ep-stat-label">Remaining to raise</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{freshman.summary.fullyReady}/{freshman.summary.total}</div>
          <div className="ep-stat-label">Freshman week ready</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{lte.rollup.coordinatorsAssigned}</div>
          <div className="ep-stat-label">LTE coordinators</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{budget.laborDayFundingPriorities.filter((p) => p.status !== "funded").length}</div>
          <div className="ep-stat-label">Unfunded priorities</div>
        </div>
      </div>

      <div className="space-y-4">
        {gaps.map((g) => (
          <Link
            key={g.area}
            href={g.href}
            className="block ep-card transition hover:border-[var(--ep-gold)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="font-heading font-bold text-[var(--ep-navy)]">{g.area}</h2>
                <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{g.gap}</p>
              </div>
              <span
                className={
                  g.status === "critical"
                    ? "rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase text-red-900"
                    : "rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-900"
                }
              >
                {g.status.replace("_", " ")}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 ep-card">
        <h2 className="font-heading font-bold text-[var(--ep-navy)]">Funding priorities before Labor Day</h2>
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
            {budget.laborDayFundingPriorities.map((row) => (
              <tr key={row.item} className="border-b border-[var(--ep-border)] last:border-0">
                <td className="py-2 pr-3 font-medium">{row.item}</td>
                <td className="py-2 pr-3 tabular-nums">{row.deadline}</td>
                <td className="py-2 pr-3 capitalize">{row.priority}</td>
                <td className="py-2 capitalize">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
