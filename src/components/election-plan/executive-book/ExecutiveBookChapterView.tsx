import Link from "next/link";

import { ExecutiveBookMarkdown } from "@/components/election-plan/executive-book/ExecutiveBookMarkdown";
import { formatBudget } from "@/lib/election-plan/electionPlanData";
import type { ExecutiveBookChapterPayload } from "@/lib/election-plan/loadExecutiveBook";

type Props = {
  chapter: ExecutiveBookChapterPayload;
};

export function ExecutiveBookChapterView({ chapter }: Props) {
  return (
    <>
      <header className="ep-chapter-header px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <nav className="text-sm text-white/70" aria-label="Breadcrumb">
            <Link href="/election-plan" className="hover:text-white">
              Election Plan
            </Link>
            <span className="mx-2">/</span>
            <Link href="/election-plan?tab=executiveBook" className="hover:text-white">
              Executive Book
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white/90">{chapter.title}</span>
          </nav>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ep-gold)]">
            Executive Book · Chapter {chapter.number}
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-white lg:text-4xl">
            {chapter.title}
          </h1>
          <p className="mt-3 text-base text-white/80">{chapter.subtitle}</p>
          {chapter.generatedAt ? (
            <p className="mt-4 text-xs text-white/50">
              Generated {new Date(chapter.generatedAt).toLocaleDateString("en-US", { dateStyle: "medium" })}
            </p>
          ) : null}
        </div>
      </header>

      <main className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <div className="ep-card-glass mb-8 text-sm text-[var(--ep-navy-muted)]">
            {chapter.slug === "budget" ? (
              <>
                <strong className="text-[var(--ep-navy)]">Planning targets only.</strong> These are planning
                targets, not guaranteed costs or guaranteed fundraising outcomes. Unknown vendor expenses are marked{" "}
                <strong>needs_quote</strong>.
              </>
            ) : chapter.slug === "gotv" ? (
              <>
                <strong className="text-[var(--ep-navy)]">Field operations manual.</strong> Assign owners before
                execution. Election Day success = ballots cast. Items marked <strong>needs_assignment</strong> require
                leadership action before October.
              </>
            ) : (
              <>
                <strong className="text-[var(--ep-navy)]">Shareable briefing.</strong> Send this URL to coalition
                partners, donors, or validators. This is leadership narrative — not Kelly&apos;s live Google Calendar.
              </>
            )}
          </div>

          {chapter.liveStrip.length > 0 ? (
            <div className="mb-8 ep-stat-grid">
              {chapter.liveStrip.map((item) => (
                <div key={item.label} className="ep-stat">
                  <div className="ep-stat-value">{item.value}</div>
                  <div className="ep-stat-label">{item.label}</div>
                  {item.detail ? <p className="mt-1 text-[0.625rem] text-[var(--ep-navy-muted)]">{item.detail}</p> : null}
                </div>
              ))}
            </div>
          ) : null}

          {chapter.budgetSummary ? (
            <div className="ep-card mb-8 overflow-x-auto">
              <h2 className="font-heading font-bold text-[var(--ep-navy)]">Fundraising planning targets</h2>
              <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{chapter.budgetSummary.disclaimer}</p>
              <table className="mt-4 w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--ep-border)] text-left text-xs uppercase text-[var(--ep-navy-muted)]">
                    <th className="pb-2 pr-3">Line item</th>
                    <th className="pb-2">Planning amount</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Salary floor (Kelly leave-of-absence)", chapter.budgetSummary.salaryFloor],
                    ["Travel (conservative → aggressive)", null],
                    ["Materials mid tier", chapter.budgetSummary.materialsMid],
                    ["Postcards/mail mid placeholder", chapter.budgetSummary.postcardMid],
                    ["Sherwood expected net (projected)", chapter.budgetSummary.sherwoodNetMid],
                    ["Bare minimum scenario", chapter.budgetSummary.bareMinimumTotal],
                    ["Working campaign scenario", chapter.budgetSummary.workingCampaignTotal],
                    ["Aggressive statewide scenario", chapter.budgetSummary.aggressiveStatewideTotal],
                  ].map(([label, amount]) =>
                    label === "Travel (conservative → aggressive)" ? (
                      <tr key={String(label)} className="border-b border-[var(--ep-border)]">
                        <td className="py-2 pr-3">{label}</td>
                        <td className="py-2 font-semibold">
                          {formatBudget(chapter.budgetSummary!.travelConservative)} →{" "}
                          {formatBudget(chapter.budgetSummary!.travelAggressive)}
                        </td>
                      </tr>
                    ) : (
                      <tr key={String(label)} className="border-b border-[var(--ep-border)] last:border-0">
                        <td className="py-2 pr-3 font-medium">{label}</td>
                        <td className="py-2 font-semibold">{formatBudget(amount as number)}</td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
              <p className="mt-4 text-sm text-[var(--ep-navy-muted)]">
                Monthly burn (working scenario):{" "}
                <strong className="text-[var(--ep-navy)]">
                  {formatBudget(chapter.budgetSummary.monthlyBurnWorking)}/month
                </strong>
              </p>
            </div>
          ) : null}

          {chapter.gotvMetrics && chapter.gotvMetrics.length > 0 ? (
            <div className="ep-card mb-8 overflow-x-auto">
              <h2 className="font-heading font-bold text-[var(--ep-navy)]">Daily GOTV metrics</h2>
              <table className="mt-4 w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--ep-border)] text-left text-xs uppercase text-[var(--ep-navy-muted)]">
                    <th className="pb-2 pr-3">Metric</th>
                    <th className="pb-2 pr-3">Goal</th>
                    <th className="pb-2">Current</th>
                  </tr>
                </thead>
                <tbody>
                  {chapter.gotvMetrics.map((row) => (
                    <tr key={row.metric} className="border-b border-[var(--ep-border)] last:border-0">
                      <td className="py-2 pr-3 font-medium">{row.metric}</td>
                      <td className="py-2 pr-3">{row.goal}</td>
                      <td className="py-2 font-semibold">{row.current}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {chapter.electionDayChecklist && chapter.electionDayChecklist.length > 0 ? (
            <div className="ep-card mb-8">
              <h2 className="font-heading font-bold text-[var(--ep-navy)]">Election Day readiness</h2>
              <ul className="mt-4 space-y-2 text-sm">
                {chapter.electionDayChecklist.map((item) => (
                  <li key={item.item} className="flex items-center justify-between gap-3 border-b border-[var(--ep-border)] pb-2 last:border-0">
                    <span>{item.item}</span>
                    <span className="shrink-0 rounded-full bg-[var(--ep-cream)] px-2 py-0.5 text-xs font-medium text-[var(--ep-navy-muted)]">
                      {item.status.replace(/_/g, " ")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {chapter.scorecardRows && chapter.scorecardRows.length > 0 ? (
            <div className="ep-card mb-8 overflow-x-auto">
              <h2 className="font-heading font-bold text-[var(--ep-navy)]">Live scorecard</h2>
              <table className="mt-4 w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--ep-border)] text-left text-xs uppercase text-[var(--ep-navy-muted)]">
                    <th className="pb-2 pr-3">Metric</th>
                    <th className="pb-2 pr-3">Goal</th>
                    <th className="pb-2">Current</th>
                  </tr>
                </thead>
                <tbody>
                  {chapter.scorecardRows.map((row) => (
                    <tr key={row.metric} className="border-b border-[var(--ep-border)] last:border-0">
                      <td className="py-2 pr-3 font-medium">{row.metric}</td>
                      <td className="py-2 pr-3">{row.goal}</td>
                      <td className="py-2 font-semibold">{row.current}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {chapter.ownershipRows && chapter.ownershipRows.length > 0 ? (
            <div className="ep-card mb-8 overflow-x-auto">
              <h2 className="font-heading font-bold text-[var(--ep-navy)]">Ownership matrix</h2>
              <table className="mt-4 w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-[var(--ep-border)] text-left text-xs uppercase text-[var(--ep-navy-muted)]">
                    <th className="pb-2 pr-3">Function</th>
                    <th className="pb-2 pr-3">Owner</th>
                    <th className="pb-2 pr-3">Backup</th>
                    <th className="pb-2">Weekly deliverable</th>
                  </tr>
                </thead>
                <tbody>
                  {chapter.ownershipRows.map((row) => (
                    <tr key={row.function} className="border-b border-[var(--ep-border)] last:border-0">
                      <td className="py-2 pr-3">{row.function}</td>
                      <td className="py-2 pr-3 font-semibold">{row.owner}</td>
                      <td className="py-2 pr-3">{row.backup}</td>
                      <td className="py-2 text-[var(--ep-navy-muted)]">{row.weeklyDeliverable ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          <article className="ep-card">
            <ExecutiveBookMarkdown markdown={chapter.markdown} />
          </article>

          <div className="mt-8 flex flex-wrap gap-4 text-sm">
            <Link href="/election-plan?tab=executiveBook" className="ep-chapter-link">
              ← Back to Executive Book
            </Link>
            <Link href="/election-plan" className="font-medium text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
              Command Center
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
