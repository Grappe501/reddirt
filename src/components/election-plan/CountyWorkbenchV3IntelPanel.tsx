import Link from "next/link";
import type { ReactNode } from "react";

import type { CountyWorkbenchV3View } from "@/lib/election-plan/county-workbench/types";
import { cn } from "@/lib/utils";

type Props = {
  intel: CountyWorkbenchV3View;
  /** Parent renders CountyIntelligenceNav — hide duplicate section pills. */
  hideNav?: boolean;
  /** Strategy / overview already rendered above — skip duplicate blocks. */
  skipStrategySection?: boolean;
  skipIdentitySection?: boolean;
};

function Section({
  id,
  title,
  subtitle,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mb-10 scroll-mt-24">
      <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{subtitle}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="ep-stat">
      <div className="ep-stat-value text-lg">{value}</div>
      <div className="ep-stat-label">{label}</div>
      {note ? <p className="mt-1 text-[10px] text-[var(--ep-navy-muted)]">{note}</p> : null}
    </div>
  );
}

function fmt(n: number | null | undefined, opts?: Intl.NumberFormatOptions): string {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toLocaleString("en-US", opts);
}

function fmtPct(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return `${n}%`;
}

function JsonTable({ data, emptyLabel }: { data: unknown; emptyLabel: string }) {
  if (data == null) {
    return <p className="text-sm italic text-[var(--ep-navy-muted)]">{emptyLabel}</p>;
  }
  if (typeof data === "object" && !Array.isArray(data)) {
    const entries = Object.entries(data as Record<string, unknown>);
    if (entries.length === 0) return <p className="text-sm italic text-[var(--ep-navy-muted)]">{emptyLabel}</p>;
    return (
      <ul className="space-y-1 text-sm">
        {entries.map(([k, v]) => (
          <li key={k} className="flex justify-between gap-3 border-b border-[var(--ep-border)] py-1 last:border-0">
            <span className="text-[var(--ep-navy-muted)]">{k}</span>
            <span className="text-right font-medium text-[var(--ep-navy)]">{String(v)}</span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <pre className="overflow-x-auto rounded-lg bg-[var(--ep-cream)]/60 p-3 text-xs text-[var(--ep-navy-muted)]">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export function CountyWorkbenchV3IntelPanel({
  intel,
  hideNav = false,
  skipStrategySection = false,
  skipIdentitySection = false,
}: Props) {
  const nav = [
    { id: "strategy", label: "Why this county" },
    { id: "identity", label: "Identity" },
    { id: "demographics", label: "Census" },
    { id: "economy", label: "BLS / economy" },
    { id: "elections", label: "Elections" },
    { id: "officials", label: "Elected officials" },
    { id: "history", label: "History" },
    { id: "gaps", label: "Data gaps" },
  ];

  return (
    <div className="mb-10">
      {!hideNav ? (
        <>
          <div className="ep-card-glass mb-6 border border-[var(--ep-gold)]/30 px-4 py-3 text-sm">
            <p className="font-semibold text-[var(--ep-navy)]">County intelligence · reference layer</p>
            <p className="mt-1 text-[var(--ep-navy-muted)]">
              Census, BLS, election history, elected officials, and campaign reasoning — sourced records only; gaps
              show as <span className="font-mono text-xs">—</span>.
            </p>
          </div>
          <nav className="mb-8 flex flex-wrap gap-2">
            {nav.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="rounded-full border border-[var(--ep-border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--ep-navy)] hover:border-[var(--ep-gold)]"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </>
      ) : null}

      {!skipStrategySection ? (
      <Section
        id="strategy"
        title="Why we are working this county"
        subtitle="Campaign reasoning — VCI, tier, missions, and path to victory from the election plan + county profile engine"
      >
        <div className="mb-4 ep-stat-grid">
          <Metric label="VCI rank" value={`#${intel.campaignReasoning.vciRank}`} />
          <Metric label="Tier" value={intel.campaignReasoning.tier} />
          <Metric label="VCI (votes)" value={fmt(intel.campaignReasoning.vci)} />
        </div>
        <div className="space-y-3 text-sm">
          <p>
            <span className="font-semibold text-[var(--ep-navy)]">Strategic role:</span>{" "}
            {intel.campaignReasoning.strategicRole}
          </p>
          <p>
            <span className="font-semibold text-[var(--ep-navy)]">Primary mission:</span>{" "}
            {intel.campaignReasoning.primaryMission}
          </p>
          <p>
            <span className="font-semibold text-[var(--ep-navy-muted)]">Secondary:</span>{" "}
            {intel.campaignReasoning.secondaryMission}
          </p>
          <p className="rounded-lg bg-[var(--ep-cream)]/50 px-3 py-2 text-[var(--ep-navy-muted)]">
            {intel.campaignReasoning.recommendedAction}
          </p>
          {intel.campaignReasoning.pathToVictory ? (
            <p>
              <span className="font-semibold text-[var(--ep-navy)]">Path to victory:</span>{" "}
              {intel.campaignReasoning.pathToVictory}
            </p>
          ) : null}
        </div>
      </Section>
      ) : null}

      {!skipIdentitySection ? (
      <Section id="identity" title="Official location & identity" subtitle="Registry · FIPS · region · county seat">
        <ul className="grid gap-2 text-sm sm:grid-cols-2">
          <li className="ep-card py-2 px-3">
            <span className="text-xs text-[var(--ep-navy-muted)]">Display name</span>
            <p className="font-semibold">{intel.displayName}</p>
          </li>
          <li className="ep-card py-2 px-3">
            <span className="text-xs text-[var(--ep-navy-muted)]">FIPS</span>
            <p className="font-semibold">{intel.fips || "—"}</p>
          </li>
          <li className="ep-card py-2 px-3">
            <span className="text-xs text-[var(--ep-navy-muted)]">Campaign region</span>
            <p className="font-semibold">{intel.regionLabel}</p>
          </li>
          <li className="ep-card py-2 px-3">
            <span className="text-xs text-[var(--ep-navy-muted)]">County seat</span>
            <p className="font-semibold">{intel.countySeat ?? "—"}</p>
          </li>
        </ul>
      </Section>
      ) : null}

      <Section
        id="demographics"
        title="Census & demographics"
        subtitle={
          intel.censusDemographics.source
            ? `Source: ${intel.censusDemographics.source}${intel.censusDemographics.asOfYear ? ` · ${intel.censusDemographics.asOfYear}` : ""}`
            : "CountyPublicDemographics + ACS block from county profile engine"
        }
      >
        <div className="mb-4 ep-stat-grid">
          <Metric label="Population" value={fmt(intel.censusDemographics.population)} />
          <Metric label="Voting-age pop." value={fmt(intel.censusDemographics.votingAgePopulation)} />
          <Metric label="Median HH income" value={fmt(intel.censusDemographics.medianIncome, { style: "currency", currency: "USD", maximumFractionDigits: 0 })} />
          <Metric label="Poverty rate" value={fmtPct(intel.censusDemographics.povertyRate)} />
          <Metric label="Bachelor+" value={fmtPct(intel.censusDemographics.bachelorsPct)} />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="ep-card">
            <h3 className="text-sm font-bold">Age bands</h3>
            <JsonTable data={intel.censusDemographics.ageBands} emptyLabel="No age-band data ingested." />
          </div>
          <div className="ep-card">
            <h3 className="text-sm font-bold">Race / ethnicity (ACS aggregate)</h3>
            <JsonTable data={intel.censusDemographics.raceEthnicity} emptyLabel="No race/ethnicity table ingested." />
          </div>
        </div>
      </Section>

      <Section id="economy" title="BLS & economy" subtitle="Unemployment and industry mix when present in demographics row">
        <div className="mb-4 ep-stat-grid">
          <Metric label="Unemployment" value={fmtPct(intel.blsEconomy.unemploymentRate)} />
        </div>
        {intel.blsEconomy.laborNote ? (
          <p className="mb-3 text-sm text-[var(--ep-navy-muted)]">{intel.blsEconomy.laborNote}</p>
        ) : null}
        <div className="ep-card">
          <h3 className="text-sm font-bold">Industry mix</h3>
          <JsonTable data={intel.blsEconomy.industryMix} emptyLabel="No BLS industry mix ingested." />
        </div>
      </Section>

      <Section id="elections" title="Election history & turnout" subtitle="From ElectionCountyResult ingest — general elections, contest totals omitted">
        <div className="mb-4 ep-stat-grid">
          <Metric label="Registered (est.)" value={fmt(intel.registeredVotersEstimate)} note="Last known from result rows" />
          <Metric label="Last general turnout" value={fmtPct(intel.lastGeneralTurnoutPct)} />
        </div>
        {intel.electionHistory.length === 0 ? (
          <p className="text-sm italic text-[var(--ep-navy-muted)]">No election history rows for this county yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--ep-border)] text-xs uppercase text-[var(--ep-navy-muted)]">
                  <th className="py-2 pr-3">Election</th>
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Registered</th>
                  <th className="py-2 pr-3">Ballots</th>
                  <th className="py-2">Turnout</th>
                </tr>
              </thead>
              <tbody>
                {intel.electionHistory.map((row) => (
                  <tr key={`${row.electionDate}-${row.electionName}`} className="border-b border-[var(--ep-border)] last:border-0">
                    <td className="py-2 pr-3">{row.electionName}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{row.electionDate.slice(0, 10)}</td>
                    <td className="py-2 pr-3">{fmt(row.registeredVoters)}</td>
                    <td className="py-2 pr-3">{fmt(row.ballotsCast)}</td>
                    <td className="py-2">{fmtPct(row.turnoutPct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section id="officials" title="Elected officials" subtitle="CountyElectedOfficial records — county, state, and federal where entered">
        {intel.electedOfficials.length === 0 ? (
          <div className="ep-card border-dashed text-sm text-[var(--ep-navy-muted)]">
            <p>No elected officials in DB for this county.</p>
            <p className="mt-2 text-xs">Add records via admin county bridge or civic infrastructure ingest — slots only until verified.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {intel.electedOfficials.map((o) => (
              <li key={`${o.jurisdiction}-${o.officeTitle}-${o.name}`} className="ep-card text-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-[var(--ep-navy)]">{o.name}</p>
                    <p className="text-xs text-[var(--ep-navy-muted)]">
                      {o.officeTitle} · {o.jurisdiction.replace(/_/g, " ")}
                      {o.party ? ` · ${o.party}` : ""}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                      o.reviewStatus === "APPROVED" ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900",
                    )}
                  >
                    {o.reviewStatus.replace(/_/g, " ")}
                  </span>
                </div>
                {o.sourceUrl ? (
                  <a href={o.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-[var(--ep-gold)] underline">
                    Source ↗
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        )}
        {intel.factoryFacts.length > 0 ? (
          <div className="mt-6">
            <h3 className="text-sm font-bold text-[var(--ep-navy)]">Civic infrastructure facts (factory)</h3>
            <ul className="mt-2 space-y-1 text-xs">
              {intel.factoryFacts.slice(0, 20).map((f) => (
                <li key={`${f.factType}-${f.factKey}`} className="flex justify-between gap-2 border-b border-[var(--ep-border)] py-1">
                  <span className="text-[var(--ep-navy-muted)]">
                    {f.factType}/{f.factKey}
                  </span>
                  <span className="text-right font-medium">{f.value}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Section>

      <Section id="history" title="County history (reference)" subtitle="Wikipedia ingest — verify before public adaptation">
        {intel.wikipediaExcerpt ? (
          <>
            <p className="text-sm leading-relaxed text-[var(--ep-navy-muted)]">{intel.wikipediaExcerpt}</p>
            <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">
              {intel.wikipediaLicenseNote}
              {intel.wikipediaUrl ? (
                <>
                  {" · "}
                  <Link href={intel.wikipediaUrl} target="_blank" rel="noopener noreferrer" className="underline">
                    Wikipedia article ↗
                  </Link>
                </>
              ) : null}
            </p>
          </>
        ) : (
          <p className="text-sm italic text-[var(--ep-navy-muted)]">No Wikipedia reference file for this county slug.</p>
        )}
      </Section>

      <Section id="gaps" title="Data gaps & research queue" subtitle="Honest inventory — factory brief + profile engine warnings">
        <ul className="space-y-2 text-sm">
          {intel.dataGaps.map((gap) => (
            <li key={gap} className="rounded-lg border border-dashed border-[var(--ep-border)] px-3 py-2 text-[var(--ep-navy-muted)]">
              {gap}
            </li>
          ))}
        </ul>
        {intel.factoryBrief?.researchTasks.length ? (
          <div className="mt-4 ep-card">
            <h3 className="text-sm font-bold">Factory research tasks</h3>
            <ul className="mt-2 list-inside list-disc text-xs text-[var(--ep-navy-muted)]">
              {intel.factoryBrief.researchTasks.slice(0, 8).map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {intel.sources.length > 0 ? (
          <div className="mt-4">
            <h3 className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Profile sources</h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {intel.sources.map((s) => (
                <li key={s.id} className="rounded-full bg-[var(--ep-cream)] px-2 py-1 text-[10px] font-semibold">
                  {s.label}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Section>
    </div>
  );
}
