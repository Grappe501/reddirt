import Link from "next/link";
import {
  buildPopeCountyPoliticalProfile,
} from "@/lib/campaign-engine/county-profiles/pope-county";
import { computePluralityThreshold, computeWinNumberFromTotal } from "@/lib/campaign-engine/county-political-profile";

export const dynamic = "force-dynamic";

const card = "rounded-md border border-deep-soil/10 bg-cream-canvas px-3 py-2 text-sm";

export default async function CountyProfilesAdminPage() {
  const profile = await buildPopeCountyPoliticalProfile();

  const wn = profile.winNumberModel.expectedTotalVotes != null
    ? computeWinNumberFromTotal(profile.winNumberModel.expectedTotalVotes)
    : null;
  const pl = profile.winNumberModel.expectedTotalVotes
    ? [0.5, 0.45, 0.38].map((s) => ({
        s,
        t: computePluralityThreshold(profile.winNumberModel.expectedTotalVotes!, s),
      }))
    : [];

  return (
    <div className="mx-auto max-w-5xl text-deep-soil">
      <header className="mb-6 border-b border-deep-soil/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-deep-soil/45">
          County profile engine · COUNTY-PROFILE-ENGINE-1
        </p>
        <h1 className="font-heading text-2xl font-bold">County political profiles</h1>
        <p className="mt-2 max-w-3xl font-body text-sm leading-relaxed text-deep-soil/70">
          This page is the classic county profile. For <strong>aggregate</strong> intelligence (turnout, registration KPIs, 50K, ACS status, &quot;How we win&quot;), use{" "}
          <Link href="/admin/county-intelligence" className="text-civic-slate underline">County intel</Link>
          . Public briefing: <Link href="/county-briefings/pope" className="text-civic-slate underline">/county-briefings/pope</Link>. No person-level targeting on public static exports (COUNTY-INTEL-2 guardrails).
        </p>
      </header>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-deep-soil/50">County</p>
          <p className="mt-1 font-heading text-lg font-bold">
            {profile.county ? profile.county.displayName : "Not found"}
          </p>
          <p className="mt-1 text-xs text-deep-soil/60">DB rows (county result): {profile.dataStatus.electionCountyRowCount}</p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-deep-soil/50">Precinct rows</p>
          <p className="mt-1 font-heading text-2xl font-bold">{profile.dataStatus.electionPrecinctRowCount}</p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-deep-soil/50">Relational (agg)</p>
          <p className="mt-1 font-heading text-2xl font-bold">
            {profile.engagementPlan.relationalOrganizing.aggregateRelationalCount ?? "—"}
          </p>
          <p className="mt-1 text-xs text-deep-soil/60">Core five: {profile.engagementPlan.relationalOrganizing.aggregateCoreFiveCount ?? "—"}</p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-deep-soil/50">Generated</p>
          <p className="mt-1 font-mono text-xs text-deep-soil/80">{new Date(profile.generatedAt).toLocaleString()}</p>
        </div>
      </div>

      <h2 className="font-heading text-lg font-bold">Census / ACS / BLS (placeholders in profile)</h2>
      <div className="mb-6 grid gap-2 md:grid-cols-2">
        <div className={card}>
          <p className="text-xs font-bold">Population / income / poverty</p>
          <p className="mt-1 text-sm">Population: {profile.censusAcsBls.censusPopulation ?? "—"} | Median income: {profile.censusAcsBls.acsMedianIncome ?? "—"} | Poverty%: {profile.censusAcsBls.acsPovertyRate ?? "—"}</p>
        </div>
        <div className={card}>
          <p className="text-xs font-bold">BLS / bands</p>
          <p className="mt-1 text-sm">Unemployment%: {profile.censusAcsBls.blsUnemployment ?? "—"} (import template when ready)</p>
        </div>
      </div>
      {profile.censusAcsBls.missingDataWarnings.length > 0 && (
        <p className="mb-4 text-xs text-amber-900/90">{profile.censusAcsBls.missingDataWarnings[0]}</p>
      )}

      <h2 className="font-heading text-lg font-bold">Win number & plurality (planning)</h2>
      <div className="mb-4 grid gap-3 md:grid-cols-2">
        <div className={card}>
          <p className="text-xs font-bold text-deep-soil/60">Majority model</p>
          <p className="mt-1 text-sm">Expected total (from last general in DB, ballots cast if present): {profile.winNumberModel.expectedTotalVotes ?? "—"}</p>
          <p className="mt-1 font-heading text-2xl font-bold">Win # (majority): {wn?.value ?? "—"}</p>
          <p className="mt-1 text-xs text-deep-soil/55">{wn?.formula}</p>
          <p className="mt-1 text-xs text-amber-800">{profile.winNumberModel.assumptions.join(" ")}</p>
        </div>
        <div className={card}>
          <p className="text-xs font-bold text-deep-soil/60">Illustrative pluralities</p>
          <ul className="mt-1 list-inside list-disc text-xs text-deep-soil/80">
            {pl.map((x) => (
              <li key={x.s}>
                {x.s * 100}% share → {x.t.value} votes (illustrative) — {x.t.formula}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <h2 className="font-heading text-lg font-bold">Relational & Power of Five</h2>
      <p className="mb-2 max-w-3xl font-body text-sm text-deep-soil/75">{profile.engagementPlan.relationalOrganizing.summary}</p>
      <p className="mb-4 max-w-3xl font-body text-sm text-deep-soil/70">{profile.engagementPlan.relationalOrganizing.powerOfFiveDefinition}</p>

      <h2 className="font-heading text-lg font-bold">Turnout profile</h2>
      <p className="mb-2 text-sm text-deep-soil/75">{profile.turnoutProfile.dropOffNarrative}</p>
      <div className="mb-6 grid gap-2 md:grid-cols-2">
        <div className={card}>
          <p className="text-xs font-bold">Last general (in results)</p>
          <pre className="mt-1 max-h-40 overflow-auto text-xs">{JSON.stringify(profile.turnoutProfile.lastGeneral, null, 2)}</pre>
        </div>
        <div className={card}>
          <p className="text-xs font-bold">Last primary (in results)</p>
          <pre className="mt-1 max-h-40 overflow-auto text-xs">{JSON.stringify(profile.turnoutProfile.lastPrimary, null, 2)}</pre>
        </div>
      </div>

      <h2 className="font-heading text-lg font-bold">Precinct concentration</h2>
      <p className="text-sm text-deep-soil/70">Confidence: {profile.precinctMapData.confidence}</p>
      <ul className="mb-6 list-inside list-disc text-sm text-deep-soil/80">
        {profile.precinctMapData.topPrecinctsByBallots.slice(0, 8).map((p) => (
          <li key={p.label}>
            {p.label}: {p.ballots} ballots ({p.source})
          </li>
        ))}
        {profile.precinctMapData.topPrecinctsByBallots.length === 0 && <li>No precinct rows — ingest / mapping gap.</li>}
      </ul>

      <h2 className="font-heading text-lg font-bold">Opposition highlights (title metadata)</h2>
      <p className="mb-2 text-xs text-deep-soil/60">SOS-relevant title scan of Hammer dry-run — verify on Arkleg.</p>
      <ul className="mb-6 max-h-64 overflow-auto list-inside list-disc text-xs text-deep-soil/80">
        {profile.oppositionHighlights.slice(0, 15).map((b) => (
          <li key={b.billNumber + b.session + b.title.slice(0, 20)}>
            <strong>{b.billNumber}</strong> ({b.session}): {b.title.slice(0, 120)}…
          </li>
        ))}
      </ul>

      <h2 className="font-heading text-lg font-bold">Missing / warnings</h2>
      <ul className="list-inside list-disc text-sm text-amber-900/90">
        {profile.missingDataWarnings.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
    </div>
  );
}
