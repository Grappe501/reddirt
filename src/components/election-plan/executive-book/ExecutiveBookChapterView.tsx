import Link from "next/link";

import { ExecutiveBookMarkdown } from "@/components/election-plan/executive-book/ExecutiveBookMarkdown";
import { ExecutiveBookBudgetLeadershipPanel } from "@/components/election-plan/executive-book/ExecutiveBookBudgetLeadershipPanel";
import { formatBudget } from "@/lib/election-plan/electionPlanData";
import { EXECUTIVE_BOOK_EDITION, EXECUTIVE_BOOK_PILLAR_LABELS } from "@/lib/election-plan/executiveBookNav";
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
            <Link href="/election-plan/executive-book" className="hover:text-white">
              Executive Book
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white/90">{chapter.title}</span>
          </nav>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ep-gold)]">
            {EXECUTIVE_BOOK_EDITION.label} · Chapter {chapter.number}
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-white lg:text-4xl">
            {chapter.title}
          </h1>
          <p className="mt-3 text-base text-white/80">{chapter.subtitle}</p>
          <p className="mt-2 text-xs uppercase tracking-wide text-white/50">
            {EXECUTIVE_BOOK_PILLAR_LABELS[chapter.pillar]}
          </p>
          {chapter.generatedAt ? (
            <p className="mt-4 text-xs text-white/50">
              Generated {new Date(chapter.generatedAt).toLocaleDateString("en-US", { dateStyle: "medium" })}
            </p>
          ) : null}
        </div>
      </header>

      <main className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className={chapter.slug === "budget" ? "mx-auto max-w-5xl" : "mx-auto max-w-3xl"}>
          {chapter.slug === "budget" ? (
            <div className="mb-10">
              <ExecutiveBookBudgetLeadershipPanel variant="chapter" />
            </div>
          ) : null}
          <div className="ep-card-glass mb-8 text-sm text-[var(--ep-navy-muted)]">
            {chapter.slug === "budget" ? (
              <>
                <strong className="text-[var(--ep-navy)]">Planning targets only.</strong> These are planning
                targets, not guaranteed costs or guaranteed fundraising outcomes. Unknown vendor expenses are marked{" "}
                <strong>needs_quote</strong>.
              </>
            ) : chapter.slug === "power-of-5" ? (
              <>
                <strong className="text-[var(--ep-navy)]">Organizing doctrine.</strong> Most persuasion happens in
                small rooms — not TV, not mail, not Facebook. This chapter explains how the movement grows before
                GOTV deploys it.
              </>
            ) : chapter.slug === "students-for-arkansas" ? (
              <>
                <strong className="text-[var(--ep-navy)]">Youth leadership pipeline.</strong> Not campus outreach alone — a
                statewide student movement for registration, turnout, content, and future civic leaders.
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

          {chapter.powerOf5Summary ? (
            <div className="ep-card mb-8 space-y-8">
              <div>
                <h2 className="font-heading font-bold text-[var(--ep-navy)]">Eyeball-to-Eyeball Organizing Model</h2>
                <p className="mt-2 text-sm italic text-[var(--ep-navy-muted)]">{chapter.powerOf5Summary.doctrine}</p>
                {chapter.powerOf5Summary.smallRoomsPrinciple ? (
                  <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
                    {chapter.powerOf5Summary.smallRoomsPrinciple}
                  </p>
                ) : null}
              </div>

              {chapter.powerOf5Summary.operatingFunnel && chapter.powerOf5Summary.operatingFunnel.length > 0 ? (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">
                    The real funnel
                  </h3>
                  <div className="mt-3 flex flex-wrap items-center gap-1 text-sm">
                    {chapter.powerOf5Summary.operatingFunnel.map((step, i) => (
                      <span key={step} className="flex items-center gap-1">
                        <span className="rounded-full bg-[var(--ep-cream)] px-2.5 py-1 font-medium text-[var(--ep-navy)]">
                          {step}
                        </span>
                        {i < chapter.powerOf5Summary!.operatingFunnel!.length - 1 ? (
                          <span className="text-[var(--ep-navy-muted)]">→</span>
                        ) : null}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {chapter.powerOf5Summary.threeAsks && chapter.powerOf5Summary.threeAsks.length > 0 ? (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">
                    Every event ends with three asks
                  </h3>
                  <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">
                    {chapter.powerOf5Summary.threeAsks.map((ask) => (
                      <li key={ask}>{ask}</li>
                    ))}
                  </ol>
                </div>
              ) : null}

              {chapter.powerOf5Summary.eventPyramid && chapter.powerOf5Summary.eventPyramid.length > 0 ? (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">
                    Event pyramid
                  </h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {chapter.powerOf5Summary.eventPyramid.map((level) => (
                      <div key={level.tier} className="rounded-lg border border-[var(--ep-border)] p-3">
                        <p className="font-semibold text-[var(--ep-navy)]">{level.tier}</p>
                        <p className="mt-1 text-xs font-medium uppercase text-[var(--ep-gold)]">{level.purpose}</p>
                        <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">{level.examples.join(" · ")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {chapter.powerOf5Summary.surrogateTiers && chapter.powerOf5Summary.surrogateTiers.length > 0 ? (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">
                    Surrogate layer — Kelly cannot be everywhere
                  </h3>
                  <div className="mt-3 space-y-2">
                    {chapter.powerOf5Summary.surrogateTiers.map((tier) => (
                      <div
                        key={tier.tier}
                        className="flex flex-col gap-1 border-b border-[var(--ep-border)] pb-2 last:border-0 sm:flex-row sm:items-start sm:gap-4"
                      >
                        <span className="shrink-0 text-xs font-bold uppercase text-[var(--ep-gold)]">
                          Tier {tier.tier}
                        </span>
                        <div>
                          <p className="font-medium text-[var(--ep-navy)]">{tier.name}</p>
                          <p className="text-sm text-[var(--ep-navy-muted)]">{tier.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">
                    Relationship ladder
                  </h3>
                  <ol className="mt-3 space-y-1 text-sm">
                    {chapter.powerOf5Summary.relationshipLadder.map((step, i) => (
                      <li key={step} className="flex items-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--ep-cream)] text-xs font-semibold text-[var(--ep-navy)]">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">
                    The Big Table Democrat
                  </h3>
                  <ul className="mt-3 space-y-1 text-sm">
                    {chapter.powerOf5Summary.bigTableWelcome.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ep-gold)]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="ep-stat-grid">
                <div className="ep-stat">
                  <div className="ep-stat-value">{chapter.powerOf5Summary.networkGoal.toLocaleString("en-US")}</div>
                  <div className="ep-stat-label">Network goal</div>
                </div>
                <div className="ep-stat">
                  <div className="ep-stat-value">{chapter.powerOf5Summary.countyHostsGoal ?? 75}</div>
                  <div className="ep-stat-label">County hosts target</div>
                </div>
                <div className="ep-stat">
                  <div className="ep-stat-value">
                    {chapter.powerOf5Summary.foundingLeaders}/{chapter.powerOf5Summary.foundingLeadersGoal}
                  </div>
                  <div className="ep-stat-label">Founding leaders</div>
                </div>
              </div>
            </div>
          ) : null}

          {chapter.citizenVoicesSummary ? (
            <div className="ep-card mb-8 border-l-4 border-[var(--ep-gold)]">
              <h2 className="font-heading font-bold text-[var(--ep-navy)]">Companion: {chapter.citizenVoicesSummary.networkName}</h2>
              <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
                Earned media surrogate layer — local voices multiply in local papers. Full program in People Power tab.
              </p>
              <div className="mt-4 ep-stat-grid">
                <div className="ep-stat">
                  <div className="ep-stat-value">
                    {chapter.citizenVoicesSummary.foundingWritersCurrent}/
                    {chapter.citizenVoicesSummary.foundingWritersGoal}
                  </div>
                  <div className="ep-stat-label">Founding writers</div>
                </div>
                <div className="ep-stat">
                  <div className="ep-stat-value">
                    {chapter.citizenVoicesSummary.lettersSubmitted}/
                    {chapter.citizenVoicesSummary.lettersSubmittedGoal}
                  </div>
                  <div className="ep-stat-label">Letters submitted</div>
                </div>
                <div className="ep-stat">
                  <div className="ep-stat-value">{chapter.citizenVoicesSummary.outletsInInventory}</div>
                  <div className="ep-stat-label">Outlets in inventory</div>
                </div>
                <div className="ep-stat">
                  <div className="ep-stat-value">
                    {chapter.citizenVoicesSummary.countiesRepresented}/{chapter.citizenVoicesSummary.countiesGoal}
                  </div>
                  <div className="ep-stat-label">Counties with writers</div>
                </div>
              </div>
              <Link href="/election-plan?tab=peoplePower" className="ep-chapter-link mt-4 inline-flex">
                Open Citizen Voices in People Power →
              </Link>
            </div>
          ) : null}

          {chapter.studentsForArkansasSummary ? (
            <div className="ep-card mb-8 space-y-6">
              <div>
                <h2 className="font-heading font-bold text-[var(--ep-navy)]">{chapter.studentsForArkansasSummary.programName}</h2>
                <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{chapter.studentsForArkansasSummary.doctrine}</p>
              </div>

              {chapter.studentsForArkansasSummary.foundingCoChairs &&
              chapter.studentsForArkansasSummary.foundingCoChairs.length > 0 ? (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">
                    Founding co-chairs
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm">
                    {chapter.studentsForArkansasSummary.foundingCoChairs.map((c) => (
                      <li key={c.id} className="flex flex-col gap-0.5 border-b border-[var(--ep-border)] pb-2 last:border-0">
                        <span className="font-medium text-[var(--ep-navy)]">
                          {c.name ?? "OPEN SEAT"} — {c.title}
                        </span>
                        <span className="text-xs text-[var(--ep-navy-muted)]">
                          {c.leadCampus} · {c.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {chapter.studentsForArkansasSummary.metrics ? (
                <div className="ep-stat-grid">
                  <div className="ep-stat">
                    <div className="ep-stat-value">
                      {chapter.studentsForArkansasSummary.metrics.coChairsConfirmed}/
                      {chapter.studentsForArkansasSummary.metrics.coChairsGoal}
                    </div>
                    <div className="ep-stat-label">Co-chairs</div>
                  </div>
                  <div className="ep-stat">
                    <div className="ep-stat-value">
                      {chapter.studentsForArkansasSummary.metrics.campusLeaders}/
                      {chapter.studentsForArkansasSummary.metrics.campusLeadersLaborDayGoal}
                    </div>
                    <div className="ep-stat-label">Campus leaders</div>
                  </div>
                  <div className="ep-stat">
                    <div className="ep-stat-value">{chapter.studentsForArkansasSummary.metrics.studentVolunteers}</div>
                    <div className="ep-stat-label">Student volunteers</div>
                  </div>
                  <div className="ep-stat">
                    <div className="ep-stat-value">{chapter.studentsForArkansasSummary.metrics.voterRegistrations}</div>
                    <div className="ep-stat-label">Registrations</div>
                  </div>
                </div>
              ) : null}

              {chapter.studentsForArkansasSummary.powerOf5Integration ? (
                <p className="text-sm italic text-[var(--ep-navy-muted)]">
                  Power of 5: {chapter.studentsForArkansasSummary.powerOf5Integration}
                </p>
              ) : null}
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
                    ["Field strategy (media · swag · compliance · sponsorships)", chapter.budgetSummary.fieldStrategyTotal],
                    ["Digital program (ads · production · tools)", chapter.budgetSummary.digitalProgramTotal],
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
                        <td className="py-2 font-semibold">
                          {typeof amount === "number" ? formatBudget(amount) : "—"}
                        </td>
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
                {chapter.budgetSummary.workingCampaignRangeLow && chapter.budgetSummary.workingCampaignRangeHigh ? (
                  <>
                    {" "}
                    · Leadership planning range:{" "}
                    <strong className="text-[var(--ep-navy)]">
                      {formatBudget(chapter.budgetSummary.workingCampaignRangeLow)}–
                      {formatBudget(chapter.budgetSummary.workingCampaignRangeHigh)}
                    </strong>
                  </>
                ) : null}
              </p>
            </div>
          ) : null}

          {chapter.influenceGroups && chapter.influenceGroups.length > 0 ? (
            <div className="ep-card mb-8 overflow-x-auto">
              <h2 className="font-heading font-bold text-[var(--ep-navy)]">Influence categories</h2>
              <table className="mt-4 w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--ep-border)] text-left text-xs uppercase text-[var(--ep-navy-muted)]">
                    <th className="pb-2 pr-3">Category</th>
                    <th className="pb-2 pr-3">Tier</th>
                    <th className="pb-2">Weekly conversations</th>
                  </tr>
                </thead>
                <tbody>
                  {chapter.influenceGroups.map((g) => (
                    <tr key={g.title} className="border-b border-[var(--ep-border)] last:border-0">
                      <td className="py-2 pr-3 font-medium">{g.title}</td>
                      <td className="py-2 pr-3">{g.tier}</td>
                      <td className="py-2 font-semibold">{g.weeklyConversationTarget}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-heading font-bold text-[var(--ep-navy)]">Ownership matrix</h2>
                <Link href="/election-plan/leadership/responsibility-matrix" className="text-xs font-semibold text-[var(--ep-navy)] hover:underline">
                  Phase 18.7B responsibility matrix →
                </Link>
              </div>
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

          <div className="ep-chapter-layout mb-8">
            {chapter.tableOfContents.length > 4 ? (
              <aside className="ep-chapter-toc ep-card">
                <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">
                  On this page
                </h2>
                <nav aria-label="Chapter table of contents">
                  <ul className="mt-3 space-y-1 text-sm">
                    {chapter.tableOfContents.map((entry) => (
                      <li key={entry.id} className={entry.level === 3 ? "pl-3" : undefined}>
                        <a href={`#${entry.id}`} className="text-[var(--ep-navy-muted)] hover:text-[var(--ep-gold)]">
                          {entry.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </aside>
            ) : null}

            <article className="ep-card ep-chapter-article">
              <ExecutiveBookMarkdown markdown={chapter.markdown} />
            </article>
          </div>

          {chapter.relatedChapters.length > 0 ? (
            <div className="ep-card mb-8">
              <h2 className="font-heading font-bold text-[var(--ep-navy)]">Related chapters</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {chapter.relatedChapters.map((related) => (
                  <li key={related.slug}>
                    <Link href={related.href} className="ep-chapter-link">
                      Chapter {related.number}: {related.title} →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <nav className="ep-chapter-nav mb-8 grid gap-3 sm:grid-cols-2" aria-label="Chapter navigation">
            {chapter.navigation.prev ? (
              <Link href={chapter.navigation.prev.href} className="ep-card ep-chapter-nav-link">
                <span className="text-xs uppercase tracking-wide text-[var(--ep-navy-muted)]">Previous</span>
                <span className="mt-1 block font-heading font-bold text-[var(--ep-navy)]">
                  Ch. {chapter.navigation.prev.number} · {chapter.navigation.prev.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
            {chapter.navigation.next ? (
              <Link
                href={chapter.navigation.next.href}
                className="ep-card ep-chapter-nav-link text-right sm:col-start-2"
              >
                <span className="text-xs uppercase tracking-wide text-[var(--ep-navy-muted)]">Next</span>
                <span className="mt-1 block font-heading font-bold text-[var(--ep-navy)]">
                  Ch. {chapter.navigation.next.number} · {chapter.navigation.next.title}
                </span>
              </Link>
            ) : null}
          </nav>

          <div className="mt-8 flex flex-wrap gap-4 text-sm">
            <Link href="/election-plan/executive-book" className="ep-chapter-link">
              Executive Book hub
            </Link>
            <Link href="/election-plan?tab=executiveBook" className="ep-chapter-link">
              ← Back to Command Center
            </Link>
            <Link href="/election-plan" className="font-medium text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
              Election Plan home
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
