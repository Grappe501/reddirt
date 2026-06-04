import Link from "next/link";
import {
  formatFundingAmount,
  loadCountyElectionFundingResearch,
  type CountyAwardRecord,
  type EvidenceTier,
} from "@/lib/intelligence/v4/countyElectionFundingIntelligence";

const TIER_BADGE: Record<EvidenceTier, string> = {
  VERIFIED_FACT: "bg-emerald-100 text-emerald-950",
  VERIFIED_PARTIAL: "bg-sky-100 text-sky-950",
  PARTIAL: "bg-amber-100 text-amber-950",
  NEEDS_RESEARCH: "bg-rose-100 text-rose-950",
  STRATEGY: "bg-violet-100 text-violet-950",
};

function TierBadge({ tier }: { tier: EvidenceTier }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${TIER_BADGE[tier]}`}>{tier.replaceAll("_", " ")}</span>
  );
}

function CountyRow({ row }: { row: CountyAwardRecord }) {
  return (
    <tr className="border-t border-kelly-text/10">
      <td className="px-3 py-2 font-semibold text-kelly-navy">{row.county}</td>
      <td className="px-3 py-2">{row.year ?? "—"}</td>
      <td className="px-3 py-2">{row.amount != null ? formatFundingAmount(row.amount) : "See source"}</td>
      <td className="px-3 py-2 text-kelly-muted">{row.label}</td>
      <td className="px-3 py-2">
        <TierBadge tier={row.evidenceTier} />
      </td>
    </tr>
  );
}

export function V4ElectionFundingIntelligencePanel() {
  const r = loadCountyElectionFundingResearch();
  const verified = r.appropriations.filter((a) => a.evidenceTier === "VERIFIED_FACT");

  return (
    <div className="space-y-8">
      <article className="rounded-xl border-2 border-kelly-gold/50 bg-kelly-page/60 p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-kelly-navy">Executive summary</p>
        <p className="mt-3 text-sm leading-relaxed text-kelly-text">{r.executiveSummary}</p>
        <p className="mt-3 text-[10px] font-bold text-amber-900">{r.governance.publicationSafety}</p>
      </article>

      <section>
        <h2 className="text-sm font-bold uppercase text-kelly-navy">Statutory authority — who funds what</h2>
        <div className="mt-4 space-y-4">
          {r.statutoryAuthority.map((stat) => (
            <article key={stat.id} className="rounded-xl border border-indigo-200 bg-indigo-50/30 p-4 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold text-indigo-950">{stat.citation}</p>
                <TierBadge tier={stat.evidenceTier} />
              </div>
              <p className="mt-1 font-semibold text-kelly-navy">{stat.title}</p>
              <p className="mt-2 text-kelly-muted">{stat.summary}</p>
              <ul className="mt-3 space-y-1">
                {stat.sources.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noreferrer" className="font-bold text-kelly-navy underline">
                      {s.label}
                    </a>
                    {s.note ? ` — ${s.note}` : null}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-5">
        <h2 className="text-sm font-bold uppercase text-emerald-950">SOS control — what the Secretary of State decides</h2>
        <p className="mt-2 text-sm font-semibold text-emerald-950">{r.sosControlDiscretion.headline}</p>
        <ul className="mt-3 list-inside list-disc text-xs text-kelly-muted">
          {r.sosControlDiscretion.controls.map((c) => (
            <li key={c.slice(0, 48)}>{c}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase text-kelly-navy">Appropriations &amp; one-time transfers</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-kelly-text/10 bg-white">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="bg-kelly-page/80 text-[10px] font-bold uppercase text-kelly-navy">
              <tr>
                <th className="px-3 py-2">FY / Year</th>
                <th className="px-3 py-2">Act</th>
                <th className="px-3 py-2">Line item</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Fund</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {verified.map((a) => (
                <tr key={`${a.fiscalYear}-${a.lineItem}`} className="border-t border-kelly-text/10">
                  <td className="px-3 py-2">{a.fiscalYear}</td>
                  <td className="px-3 py-2">{a.act}</td>
                  <td className="px-3 py-2">{a.lineItem}</td>
                  <td className="px-3 py-2 font-bold text-kelly-navy">{formatFundingAmount(a.amount)}</td>
                  <td className="px-3 py-2">{a.fund}</td>
                  <td className="px-3 py-2">
                    <TierBadge tier={a.evidenceTier} />
                  </td>
                </tr>
              ))}
              {r.oneTimeTransfers.map((t) => (
                <tr key={t.id} className="border-t border-kelly-text/10">
                  <td className="px-3 py-2">{t.year}</td>
                  <td className="px-3 py-2">{t.act}</td>
                  <td className="px-3 py-2">One-time transfer</td>
                  <td className="px-3 py-2 font-bold text-kelly-navy">{formatFundingAmount(t.amount)}</td>
                  <td className="px-3 py-2">{t.from} → CVSGF</td>
                  <td className="px-3 py-2">
                    <TierBadge tier={t.evidenceTier} />
                  </td>
                </tr>
              ))}
              {r.appropriations
                .filter((a) => a.evidenceTier === "NEEDS_RESEARCH")
                .map((a) => (
                  <tr key={`pending-${a.fiscalYear}`} className="border-t border-kelly-text/10 bg-amber-50/40">
                    <td className="px-3 py-2">{a.fiscalYear}</td>
                    <td className="px-3 py-2">{a.act}</td>
                    <td className="px-3 py-2">{a.lineItem}</td>
                    <td className="px-3 py-2">{formatFundingAmount(a.amount)} + HAVA</td>
                    <td className="px-3 py-2">{a.fund}</td>
                    <td className="px-3 py-2">
                      <TierBadge tier="NEEDS_RESEARCH" />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-kelly-muted">{r.expenditureHistory.note}</p>
        {r.expenditureHistory.sources.map((s) => (
          <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="mt-1 block text-xs font-bold text-kelly-navy underline">
            {s.label}
          </a>
        ))}
      </section>

      <section className="rounded-xl border-2 border-amber-200 bg-amber-50/40 p-5">
        <h2 className="text-sm font-bold uppercase text-amber-950">County-by-county ledger — research status</h2>
        <p className="mt-2 text-sm text-amber-950">
          Public statewide dashboard: <strong>{r.countyAwardLedger.publicDashboardExists ? "Yes" : "Not located"}</strong>
        </p>
        <p className="mt-2 text-xs text-kelly-muted">{r.countyAwardLedger.masterLedgerLocation}</p>
        <p className="mt-2 text-xs font-bold text-rose-900">{r.countyAwardLedger.researchStatus}</p>

        <div className="mt-4 overflow-x-auto rounded-lg border border-amber-100 bg-white">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="bg-amber-50 text-[10px] font-bold uppercase text-amber-950">
              <tr>
                <th className="px-3 py-2">County</th>
                <th className="px-3 py-2">Year</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Budget line / note</th>
                <th className="px-3 py-2">Evidence</th>
              </tr>
            </thead>
            <tbody>
              {r.countyAwardLedger.knownCountyReferences.map((row) => (
                <CountyRow key={row.county} row={row} />
              ))}
            </tbody>
          </table>
        </div>

        <article className="mt-4 rounded-lg border border-sky-200 bg-sky-50/40 p-4 text-xs">
          <p className="font-bold text-sky-950">SOS historical county funding (legislative presentation)</p>
          <p className="mt-2 text-kelly-muted">
            SOS expended ${r.countyAwardLedger.sosHistoricalCountyList.sosExpendedThroughPresentation.toLocaleString()} on
            equipment; counties ${r.countyAwardLedger.sosHistoricalCountyList.countiesExpendedThroughPresentation.toLocaleString()} (per presentation snapshot)
          </p>
          <a
            href={r.countyAwardLedger.sosHistoricalCountyList.url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block font-bold text-kelly-navy underline"
          >
            Arkleg SOS Exhibit E presentation →
          </a>
          <p className="mt-2 text-kelly-muted">
            Delivery types: {r.countyAwardLedger.deliveryTypes.join("; ")}
          </p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-violet-200 bg-violet-50/30 p-5 text-xs">
          <h2 className="font-bold uppercase text-violet-950">Records request — exact ask</h2>
          <p className="mt-2 font-semibold text-violet-950">{r.recordsRequest.title}</p>
          <p className="mt-3 rounded-lg border border-violet-100 bg-white p-3 italic text-kelly-text">
            &ldquo;{r.recordsRequest.exactAsk}&rdquo;
          </p>
          <ul className="mt-3 list-inside list-disc text-kelly-muted">
            {r.recordsRequest.alsoRequest.map((line) => (
              <li key={line.slice(0, 48)}>{line}</li>
            ))}
          </ul>
        </article>
        <article className="rounded-xl border border-sky-200 bg-sky-50/30 p-5 text-xs">
          <h2 className="font-bold uppercase text-sky-950">SOS outreach — policy learner approach</h2>
          <p className="mt-2 text-kelly-muted">{r.sosOutreach.recommendedContact}</p>
          <p className="mt-3 rounded-lg border border-sky-100 bg-white p-3 italic text-kelly-text">
            &ldquo;{r.sosOutreach.openingScript}&rdquo;
          </p>
          <p className="mt-3 font-bold text-emerald-900">Ask</p>
          <ul className="mt-1 list-inside list-disc text-kelly-muted">
            {r.sosOutreach.questionsToAsk.map((q) => (
              <li key={q.slice(0, 48)}>{q}</li>
            ))}
          </ul>
          <p className="mt-3 font-bold text-rose-900">Do not open with</p>
          <ul className="mt-1 list-inside list-disc text-rose-950/90">
            {r.sosOutreach.doNotOpenWith.map((q) => (
              <li key={q.slice(0, 48)}>{q}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="rounded-xl border-2 border-kelly-navy/20 bg-white p-5">
        <h2 className="text-sm font-bold uppercase text-kelly-navy">Debate strategy — evidence &amp; traps</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2 text-xs">
          <div className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-4">
            <p className="font-bold text-emerald-950">Kelly frame</p>
            <p className="mt-2 text-emerald-950">{r.debateStrategy.kellyFrame}</p>
          </div>
          <div className="rounded-lg border border-rose-100 bg-rose-50/40 p-4">
            <p className="font-bold text-rose-950">Hammer likely says</p>
            <p className="mt-2 text-rose-950">{r.debateStrategy.hammerLikelyFrame}</p>
          </div>
        </div>
        <article className="mt-4 rounded-lg border-2 border-kelly-gold/40 bg-kelly-page/50 p-4 text-xs">
          <p className="font-bold text-kelly-navy">Trap question</p>
          <p className="mt-2 text-kelly-text">{r.debateStrategy.hammerTrapQuestion}</p>
          <p className="mt-3 font-bold text-violet-950">If he counters</p>
          <p className="mt-1 text-kelly-muted">{r.debateStrategy.hammerRebuttalIfHeCounters}</p>
        </article>
        <p className="mt-4 rounded-lg border border-sky-200 bg-sky-50/40 p-3 text-sm italic text-sky-950">
          Fair public line: &ldquo;{r.debateStrategy.fairPublicLine}&rdquo;
        </p>
        <p className="mt-3 font-bold text-amber-900">Do not say</p>
        <ul className="mt-1 list-inside list-disc text-xs text-amber-950">
          {r.debateStrategy.doNotSay.map((line) => (
            <li key={line.slice(0, 48)}>{line}</li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={r.debateStrategy.trapLaneHref} className="text-xs font-bold text-kelly-navy underline">
            County champion trap lane →
          </Link>
          <Link href="/admin/intelligence/claims" className="text-xs font-bold text-amber-950 underline">
            Claims gate →
          </Link>
          <Link href="/admin/intelligence/kim-hammer/county-administration-burden" className="text-xs font-bold text-violet-950 underline">
            County burden module →
          </Link>
        </div>
      </section>

      <section className="rounded-xl border border-kelly-text/10 bg-kelly-page/40 p-5 text-xs">
        <h2 className="font-bold uppercase text-kelly-navy">Verified claims for ledger</h2>
        <ul className="mt-3 space-y-2">
          {r.verifiedClaimsForLedger.map((c) => (
            <li key={c.claimText.slice(0, 48)} className="rounded-lg border border-white bg-white p-3">
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                  c.classification === "VERIFIED" ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"
                }`}
              >
                {c.classification}
              </span>
              <p className="mt-2 text-kelly-text">{c.claimText}</p>
              <p className="mt-1 text-[10px] text-kelly-subtle">{c.sourceHint}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
