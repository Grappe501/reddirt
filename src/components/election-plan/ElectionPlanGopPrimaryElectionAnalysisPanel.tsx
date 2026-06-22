import Link from "next/link";

import { KellyPageSummary } from "@/components/election-plan/KellyPageSummary";
import { countyPlaybookHref } from "@/lib/election-plan/location-links";
import { loadGopSos2026PrimaryElectionAnalysis } from "@/lib/election-plan/load-gop-sos-2026-primary-election-analysis";
import { formatVotes } from "@/lib/election-plan/electionPlanData";

function pct(n: number): string {
  return `${n.toFixed(1)}%`;
}

function tierChip(tier: string) {
  if (tier === "high") return "ep-pathway-chip ep-pathway-chip-strength";
  if (tier === "medium") return "ep-pathway-chip ep-pathway-chip-watch";
  return "ep-link-chip";
}

export function ElectionPlanGopPrimaryElectionAnalysisPanel() {
  const analysis = loadGopSos2026PrimaryElectionAnalysis();

  if (!analysis) {
    return (
      <section className="ep-warning text-sm">
        <p className="font-semibold">GOP primary analysis data is loading.</p>
        <p className="mt-2">Run election data build from RedDirt: npm run election:gop-sos-2026:build</p>
      </section>
    );
  }

  const { statewide, coalitionMath } = analysis;

  return (
    <div className="space-y-8">
      <KellyPageSummary summary={analysis.kellyExecutiveOneLiner} label="Executive brief · Kelly" />

      <section className="ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{pct(statewide.runoffMarginPct)}</div>
          <div className="ep-stat-label">Hammer runoff margin</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{statewide.norrisRunoffCounties}–{statewide.hammerRunoffCounties}</div>
          <div className="ep-stat-label">Norris vs Hammer counties</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{pct(statewide.turnoutRetentionPct)}</div>
          <div className="ep-stat-label">Runoff turnout vs primary</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{coalitionMath.highOpportunityCounties}</div>
          <div className="ep-stat-label">High-opportunity counties</div>
        </div>
      </section>

      <section className="ep-card p-5">
        <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Executive summary</h2>
        <ul className="mt-4 list-inside list-disc space-y-2 text-sm leading-relaxed text-[var(--ep-navy-muted)]">
          {analysis.executiveSummary.map((line) => (
            <li key={line.slice(0, 48)}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="ep-card ep-study-overview p-5">
        <h2 className="text-xs font-bold uppercase tracking-wide text-[var(--ep-blue)]">The story</h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-[var(--ep-navy)]">
          {analysis.theStory.map((para) => (
            <p key={para.slice(0, 48)}>{para}</p>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Primary vs runoff · statewide</h2>
        <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--ep-border)]">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="bg-[var(--ep-cream)] text-xs uppercase tracking-wide text-[var(--ep-navy-muted)]">
              <tr>
                <th className="px-4 py-3">Election</th>
                <th className="px-4 py-3">Turnout</th>
                <th className="px-4 py-3">Norris</th>
                <th className="px-4 py-3">Hammer</th>
                <th className="px-4 py-3">Harrison</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ep-border)]">
              <tr>
                <td className="px-4 py-3 font-semibold">Preferential primary</td>
                <td className="px-4 py-3">{formatVotes(statewide.primaryTotal)}</td>
                <td className="px-4 py-3">{pct(statewide.primaryNorrisPct)}</td>
                <td className="px-4 py-3">{pct(statewide.primaryHammerPct)}</td>
                <td className="px-4 py-3">{pct(statewide.primaryHarrisonPct)}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Runoff</td>
                <td className="px-4 py-3">{formatVotes(statewide.runoffTotal)}</td>
                <td className="px-4 py-3">{pct(statewide.runoffNorrisPct)}</td>
                <td className="px-4 py-3">{pct(statewide.runoffHammerPct)}</td>
                <td className="px-4 py-3 text-[var(--ep-navy-muted)]">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Geographic patterns · by region</h2>
        <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--ep-border)]">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="bg-[var(--ep-cream)] text-xs uppercase tracking-wide text-[var(--ep-navy-muted)]">
              <tr>
                <th className="px-4 py-3">Region</th>
                <th className="px-4 py-3">Counties</th>
                <th className="px-4 py-3">Primary Norris</th>
                <th className="px-4 py-3">Runoff Norris</th>
                <th className="px-4 py-3">Runoff Hammer</th>
                <th className="px-4 py-3">Turnout kept</th>
                <th className="px-4 py-3">Norris counties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ep-border)]">
              {analysis.regions.map((r) => (
                <tr key={r.regionId}>
                  <td className="px-4 py-3 font-semibold">{r.regionLabel}</td>
                  <td className="px-4 py-3">{r.countyCount}</td>
                  <td className="px-4 py-3">{pct(r.primaryNorrisPct)}</td>
                  <td className="px-4 py-3">{pct(r.runoffNorrisPct)}</td>
                  <td className="px-4 py-3">{pct(r.runoffHammerPct)}</td>
                  <td className="px-4 py-3">{pct(r.turnoutRetentionPct)}</td>
                  <td className="px-4 py-3">
                    {r.norrisRunoffCountyWins} / {r.countyCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Pattern intelligence</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {analysis.patterns.map((p) => (
            <article key={p.title} className="ep-card p-5 text-sm">
              <h3 className="font-heading font-bold text-[var(--ep-navy)]">{p.title}</h3>
              <p className="mt-2 leading-relaxed text-[var(--ep-navy-muted)]">{p.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Primary → runoff flips</h2>
          <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">Counties that changed winner — highest persuasion value</p>
          <ul className="mt-3 space-y-2">
            {analysis.flipCounties.map((row) => (
              <li key={row.countySlug}>
                <Link
                  href={countyPlaybookHref(row.county, row.countySlug)}
                  className="ep-card ep-card-interactive flex flex-wrap items-center justify-between gap-2 p-3 text-sm"
                >
                  <span>
                    <span className="font-bold text-[var(--ep-navy)]">{row.county}</span>
                    <span className="mt-0.5 block text-xs capitalize text-[var(--ep-navy-muted)]">
                      {row.primaryWinner} → {row.runoffWinner} · margin {pct(row.runoffMarginPct)}
                    </span>
                  </span>
                  <span className={tierChip(row.opportunityTier)}>{row.opportunityTier}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Turnout collapse leaders</h2>
          <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">Lowest primary-to-runoff retention — November pool is larger</p>
          <ul className="mt-3 space-y-2">
            {analysis.turnoutDropLeaders.slice(0, 8).map((row) => (
              <li key={row.countySlug}>
                <Link
                  href={countyPlaybookHref(row.county, row.countySlug)}
                  className="ep-card flex flex-wrap items-center justify-between gap-2 p-3 text-sm transition hover:border-[var(--ep-gold)]"
                >
                  <span className="font-bold text-[var(--ep-navy)]">{row.county}</span>
                  <span className="text-xs text-[var(--ep-navy-muted)]">
                    {pct(row.retentionPct)} kept · {row.runoffWinner} won runoff
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Precinct density · field targeting</h2>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
          {statewide.totalPrecinctsReporting.toLocaleString()} precincts reported statewide. Vote splits are county-aggregated
          in SOS export — precinct counts show where micro-targeting investment matters most.
        </p>
        <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--ep-border)]">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="bg-[var(--ep-cream)] text-xs uppercase tracking-wide text-[var(--ep-navy-muted)]">
              <tr>
                <th className="px-4 py-3">County</th>
                <th className="px-4 py-3">Precincts</th>
                <th className="px-4 py-3">Runoff votes</th>
                <th className="px-4 py-3">Avg / precinct</th>
                <th className="px-4 py-3">Norris</th>
                <th className="px-4 py-3">Hammer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ep-border)]">
              {analysis.precinctDensityLeaders.map((row) => (
                <tr key={row.countySlug}>
                  <td className="px-4 py-3">
                    <Link href={countyPlaybookHref(row.county, row.countySlug)} className="font-semibold hover:underline">
                      {row.county}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{row.totalPrecincts}</td>
                  <td className="px-4 py-3">{formatVotes(row.runoffVotes)}</td>
                  <td className="px-4 py-3">{row.votesPerPrecinct}</td>
                  <td className="px-4 py-3">{pct(row.runoffNorrisPct)}</td>
                  <td className="px-4 py-3">{pct(row.runoffHammerPct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">How Kelly uses this intelligence</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {analysis.campaignUtilization.map((block) => (
            <article key={block.title} className="ep-card ep-study-practice p-5 text-sm">
              <h3 className="font-heading font-bold text-[var(--ep-success)]">{block.title}</h3>
              <ul className="mt-3 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
                {block.bullets.map((b) => (
                  <li key={b.slice(0, 40)}>{b}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="ep-card p-5 text-sm">
        <h2 className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Coalition math · county winners</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs text-[var(--ep-navy-muted)]">Norris primary → Norris runoff</dt>
            <dd className="font-heading text-lg font-bold">{coalitionMath.norrisPrimaryNorrisRunoff}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--ep-navy-muted)]">Norris primary → Hammer runoff</dt>
            <dd className="font-heading text-lg font-bold">{coalitionMath.norrisPrimaryHammerRunoff}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--ep-navy-muted)]">Hammer primary → Norris runoff</dt>
            <dd className="font-heading text-lg font-bold">{coalitionMath.hammerPrimaryNorrisRunoff}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--ep-navy-muted)]">Harrison primary → Norris runoff</dt>
            <dd className="font-heading text-lg font-bold">{coalitionMath.harrisonPrimaryNorrisRunoff}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--ep-navy-muted)]">Harrison primary → Hammer runoff</dt>
            <dd className="font-heading text-lg font-bold">{coalitionMath.harrisonPrimaryHammerRunoff}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--ep-navy-muted)]">Hammer strongholds (both elections)</dt>
            <dd className="font-heading text-lg font-bold">{coalitionMath.hammerStrongholds}</dd>
          </div>
        </dl>
      </section>

      <section className="ep-warning text-sm">
        <h2 className="font-heading font-bold text-[var(--ep-navy)]">Data &amp; claims gate</h2>
        <ul className="mt-3 list-inside list-disc space-y-1">
          {analysis.dataLimitations.map((line) => (
            <li key={line.slice(0, 40)}>{line}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">Built {new Date(analysis.builtAt).toLocaleString()}</p>
      </section>
    </div>
  );
}
