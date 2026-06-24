import Link from "next/link";

import type {
  CampusChapterRow,
  CityCoverageRow,
  CoalitionCoverageRow,
  CoverageLevel,
  LaneCoverageDashboardPayload,
} from "@/lib/volunteers/load-lane-coverage-dashboard";
import { countyPlaybookHref } from "@/lib/election-plan/location-links";

function coverageColor(level: CoverageLevel): string {
  if (level === "covered") return "bg-emerald-500";
  if (level === "partial") return "bg-amber-400";
  if (level === "minimal") return "bg-orange-400";
  return "bg-red-400";
}

function coverageLabel(level: CoverageLevel): string {
  if (level === "covered") return "Chair named";
  if (level === "partial") return "Workbench only";
  if (level === "minimal") return "No lead";
  return "None";
}

function readinessBadgeClass(band: CoalitionCoverageRow["readinessBand"]): string {
  if (band === "green") return "bg-emerald-50 text-emerald-950 ring-emerald-200";
  if (band === "yellow") return "bg-amber-50 text-amber-950 ring-amber-200";
  return "bg-red-50 text-red-950 ring-red-200";
}

type Props = {
  payload: LaneCoverageDashboardPayload;
  activeView?: "city" | "coalition" | "campus";
};

export function LaneCoverageDashboard({ payload, activeView }: Props) {
  const showAll = !activeView;

  return (
    <div className="ep-chapter-body px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-12">
        {!payload.dbAvailable ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Database not configured — workbench readiness and community leads need{" "}
            <code className="text-xs">DATABASE_URL</code>. City ranks and roster assignments still load.
          </div>
        ) : null}

        <nav className="flex flex-wrap gap-2" aria-label="Coverage boards">
          {(
            [
              ["city", "City leadership", payload.city.stats.covered, payload.city.stats.total],
              ["coalition", "Coalition leads", payload.coalition.stats.withOwner, payload.coalition.stats.total],
              ["campus", "Campus chapters", payload.campus.stats.filled, payload.campus.stats.total],
            ] as const
          ).map(([view, label, filled, total]) => (
            <Link
              key={view}
              href={`/election-plan/operators/lane-coverage?view=${view}`}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ring-1 transition ${
                activeView === view
                  ? "bg-[var(--ep-navy)] text-white ring-[var(--ep-navy)]"
                  : "bg-white text-[var(--ep-navy-muted)] ring-[var(--ep-navy)]/10 hover:bg-[var(--ep-cream)]"
              }`}
            >
              {label} · {filled}/{total}
            </Link>
          ))}
        </nav>

        {(showAll || activeView === "city") && (
          <section id="city-coverage">
            <h2 className="font-heading text-xl font-bold text-[var(--ep-navy)]">City leadership coverage</h2>
            <p className="mt-2 max-w-3xl text-sm text-[var(--ep-navy-muted)]">
              Top 250 priority cities — named city chair from roster or community workbench lead. Mirrors county
              coverage at city scale.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Chairs named</p>
                <p className="mt-2 font-heading text-3xl font-bold text-emerald-800">{payload.city.stats.covered}</p>
                <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">of {payload.city.stats.total} top-250 cities</p>
              </div>
              <div className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Workbench only</p>
                <p className="mt-2 font-heading text-3xl font-bold text-amber-800">{payload.city.stats.partial}</p>
                <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">Lead on workbench — no city chair title</p>
              </div>
              <div className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">No lead yet</p>
                <p className="mt-2 font-heading text-3xl font-bold text-orange-800">{payload.city.stats.minimal}</p>
                <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">Workbench exists — leadership open</p>
              </div>
              <div className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Top 10 cities</p>
                <p className="mt-2 font-heading text-3xl font-bold text-[var(--ep-navy)]">
                  {payload.city.stats.top10Covered}/{payload.city.stats.top10Total}
                </p>
                <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">Named chairs in highest-vote cities</p>
              </div>
            </div>

            <div className="mt-6 ep-card">
              <h3 className="font-heading text-sm font-bold text-[var(--ep-navy)]">Top-250 coverage map</h3>
              <div className="mt-3 flex flex-wrap gap-1">
                {payload.city.rows.map((row) => (
                  <Link
                    key={row.slug}
                    href={row.cityBriefHref}
                    title={`${row.name}: ${coverageLabel(row.coverageLevel)}${row.cityChairName ? ` · ${row.cityChairName}` : ""}`}
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold text-white ${coverageColor(row.coverageLevel)} hover:opacity-80`}
                  >
                    {row.name}
                  </Link>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--ep-navy-muted)]">
                <span>
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> Chair named
                </span>
                <span>
                  <span className="inline-block h-2 w-2 rounded-full bg-amber-400" /> Workbench only
                </span>
                <span>
                  <span className="inline-block h-2 w-2 rounded-full bg-orange-400" /> No lead
                </span>
              </div>
            </div>

            <CityGapTable rows={payload.city.gapRows} />
          </section>
        )}

        {(showAll || activeView === "coalition") && (
          <section id="coalition-coverage" className={showAll ? "border-t border-[var(--ep-navy)]/10 pt-10" : ""}>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-heading text-xl font-bold text-[var(--ep-navy)]">Coalition lead coverage</h2>
                <p className="mt-2 max-w-3xl text-sm text-[var(--ep-navy-muted)]">
                  Twelve coalition workbenches — community lead on workbench plus roster liaison assignment.
                </p>
              </div>
              <Link
                href="/election-plan/operators/coalition-command"
                className="text-xs font-semibold text-[var(--ep-blue)] hover:underline"
              >
                Coalition command →
              </Link>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">With owner</p>
                <p className="mt-2 font-heading text-3xl font-bold text-emerald-800">
                  {payload.coalition.stats.withOwner}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Missing owner</p>
                <p className="mt-2 font-heading text-3xl font-bold text-red-800">
                  {payload.coalition.stats.missingOwners}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Roster liaisons</p>
                <p className="mt-2 font-heading text-3xl font-bold text-[var(--ep-navy)]">
                  {payload.coalition.stats.rosterLeads}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Avg readiness</p>
                <p className="mt-2 font-heading text-3xl font-bold text-[var(--ep-navy)]">
                  {payload.coalition.stats.avgReadinessPct}%
                </p>
              </div>
            </div>

            <div className="mt-8 overflow-x-auto rounded-xl border border-[var(--ep-navy)]/10 bg-white shadow-sm">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-[var(--ep-navy)]/10 bg-[var(--ep-cream)]/60 text-xs uppercase tracking-wide text-[var(--ep-navy-muted)]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Workbench</th>
                    <th className="px-4 py-3 font-semibold">Community lead</th>
                    <th className="px-4 py-3 font-semibold">Roster liaison</th>
                    <th className="px-4 py-3 font-semibold">Readiness</th>
                    <th className="px-4 py-3 font-semibold">Open</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--ep-navy)]/10">
                  {payload.coalition.rows.map((row) => (
                    <tr key={row.slug} className="hover:bg-[var(--ep-cream)]/30">
                      <td className="px-4 py-3">
                        <Link href={row.workbenchHref} className="font-semibold text-[var(--ep-navy)] hover:underline">
                          {row.name}
                        </Link>
                        {row.leadRole ? (
                          <p className="text-xs text-[var(--ep-navy-muted)]">{row.leadRole}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-[var(--ep-navy)]">{row.communityLead ?? "—"}</td>
                      <td className="px-4 py-3">
                        {row.rosterLeadName ? (
                          <Link
                            href={row.rosterLeadSlug ? `/election-plan/operators/leaders/${row.rosterLeadSlug}` : row.workbenchHref}
                            className="text-[var(--ep-blue)] hover:underline"
                          >
                            {row.rosterLeadName}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ring-1 ${readinessBadgeClass(row.readinessBand)}`}
                        >
                          {row.readinessPct}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {!row.hasOwner || !row.rosterLeadName ? (
                          <span className="text-xs font-semibold text-red-800">Needs lead</span>
                        ) : (
                          <span className="text-xs text-emerald-800">Assigned</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {(showAll || activeView === "campus") && (
          <section id="campus-coverage" className={showAll ? "border-t border-[var(--ep-navy)]/10 pt-10" : ""}>
            <h2 className="font-heading text-xl font-bold text-[var(--ep-navy)]">Campus chapter coverage</h2>
            <p className="mt-2 max-w-3xl text-sm text-[var(--ep-navy-muted)]">
              Students for Arkansas co-chair slots — five chapter anchors plus open metro and regional seats.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Filled</p>
                <p className="mt-2 font-heading text-3xl font-bold text-emerald-800">{payload.campus.stats.filled}</p>
              </div>
              <div className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Open slots</p>
                <p className="mt-2 font-heading text-3xl font-bold text-red-800">{payload.campus.stats.open}</p>
              </div>
              <div className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Total chapters</p>
                <p className="mt-2 font-heading text-3xl font-bold text-[var(--ep-navy)]">{payload.campus.stats.total}</p>
              </div>
            </div>

            <div className="mt-8 overflow-x-auto rounded-xl border border-[var(--ep-navy)]/10 bg-white shadow-sm">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-[var(--ep-navy)]/10 bg-[var(--ep-cream)]/60 text-xs uppercase tracking-wide text-[var(--ep-navy-muted)]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Campus</th>
                    <th className="px-4 py-3 font-semibold">Region</th>
                    <th className="px-4 py-3 font-semibold">Co-chair</th>
                    <th className="px-4 py-3 font-semibold">County</th>
                    <th className="px-4 py-3 font-semibold">Links</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--ep-navy)]/10">
                  {payload.campus.rows.map((row) => (
                    <CampusRow key={row.id} row={row} />
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="border-t border-[var(--ep-navy)]/10 pt-10">
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Weekly coverage rhythm</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {payload.weeklyRhythm.map((item) => (
              <li key={item.id} className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-4 shadow-sm">
                {item.href ? (
                  <Link href={item.href} className="font-semibold text-[var(--ep-navy)] hover:underline">
                    {item.label} →
                  </Link>
                ) : (
                  <p className="font-semibold text-[var(--ep-navy)]">{item.label}</p>
                )}
                <p className="mt-1 text-xs leading-relaxed text-[var(--ep-navy-muted)]">{item.description}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function CityGapTable({ rows }: { rows: CityCoverageRow[] }) {
  return (
    <div className="mt-8">
      <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Priority gaps — no city chair</h3>
      <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
        Highest-rank cities without a named chair — recruit before expanding to rank 50+.
      </p>
      <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--ep-navy)]/10 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--ep-navy)]/10 bg-[var(--ep-cream)]/60 text-xs uppercase tracking-wide text-[var(--ep-navy-muted)]">
            <tr>
              <th className="px-4 py-3 font-semibold">Rank</th>
              <th className="px-4 py-3 font-semibold">City</th>
              <th className="px-4 py-3 font-semibold">County</th>
              <th className="px-4 py-3 font-semibold">Target votes</th>
              <th className="px-4 py-3 font-semibold">Workbench lead</th>
              <th className="px-4 py-3 font-semibold">Coverage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--ep-navy)]/10">
            {rows.map((row) => (
              <tr key={row.slug} className="hover:bg-[var(--ep-cream)]/30">
                <td className="px-4 py-3 tabular-nums font-semibold text-[var(--ep-navy)]">{row.rank}</td>
                <td className="px-4 py-3">
                  <Link href={row.cityBriefHref} className="font-semibold text-[var(--ep-navy)] hover:underline">
                    {row.name}
                  </Link>
                  {row.isTop10 ? (
                    <span className="ml-2 rounded-full bg-[var(--ep-gold)]/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-[var(--ep-navy)]">
                      Top 10
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <Link href={countyPlaybookHref(row.county, row.countySlug)} className="text-[var(--ep-navy-muted)] hover:underline">
                    {row.county}
                  </Link>
                </td>
                <td className="px-4 py-3 tabular-nums text-[var(--ep-navy-muted)]">
                  {row.targetVotes.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-[var(--ep-navy-muted)]">{row.workbenchLead ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-white ${coverageColor(row.coverageLevel)}`}
                  >
                    {coverageLabel(row.coverageLevel)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CampusRow({ row }: { row: CampusChapterRow }) {
  return (
    <tr className="hover:bg-[var(--ep-cream)]/30">
      <td className="px-4 py-3">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ring-1 ${
            row.isOpen ? "bg-red-50 text-red-950 ring-red-200" : "bg-emerald-50 text-emerald-950 ring-emerald-200"
          }`}
        >
          {row.isOpen ? "Open" : "Filled"}
        </span>
      </td>
      <td className="px-4 py-3 font-semibold text-[var(--ep-navy)]">
        <Link href={row.campusPageHref} className="hover:underline">
          {row.campusLabel}
        </Link>
      </td>
      <td className="px-4 py-3 text-[var(--ep-navy-muted)]">{row.regionLabel}</td>
      <td className="px-4 py-3">
        {row.leaderWorkbenchHref ? (
          <Link href={row.leaderWorkbenchHref} className="font-semibold text-[var(--ep-navy)] hover:underline">
            {row.coChairName}
          </Link>
        ) : (
          <span className="font-semibold text-red-900">{row.coChairName}</span>
        )}
      </td>
      <td className="px-4 py-3 text-[var(--ep-navy-muted)]">{row.county ?? "—"}</td>
      <td className="px-4 py-3 text-xs">
        {row.workbenchHref ? (
          <Link href={row.workbenchHref} className="font-semibold text-[var(--ep-blue)] hover:underline">
            Campus WB →
          </Link>
        ) : null}
      </td>
    </tr>
  );
}
