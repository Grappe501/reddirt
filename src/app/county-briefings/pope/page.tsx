import { buildPopeCountyPoliticalProfile, getPopeCountyPriorityPlanMeta } from "@/lib/campaign-engine/county-profiles/pope-county";

export const dynamic = "force-dynamic";

export default async function PopeCountyPublicBriefingPage() {
  const p = await buildPopeCountyPoliticalProfile();
  const pri = await getPopeCountyPriorityPlanMeta();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-kelly-text">
      <p className="text-sm text-kelly-text/60">
        <a className="text-kelly-slate underline hover:text-kelly-text" href="/county-briefings">
          ← County planning briefings
        </a>
        {" "}
        ·{" "}
        <a className="text-kelly-slate underline hover:text-kelly-text" href="/county-briefings/pope/v2">
          County dashboard v2 (prototype)
        </a>
      </p>
      <p className="text-xs font-bold uppercase tracking-widest text-kelly-text/50">Pope County political profile</p>
      <h1 className="font-heading mt-2 text-3xl font-bold">Kelly Grappe for Secretary of State</h1>
      <p className="text-kelly-text/70">People over politics — path to victory (planning briefing)</p>
      <p className="mt-4 rounded-md border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-sm text-amber-950">
        <strong>Planning briefing.</strong> Some estimates and bill titles require verification before public use. No private voter
        data on this page.
      </p>

      <section className="mt-8 space-y-2 text-sm leading-relaxed text-kelly-text/85">
        <h2 className="font-heading text-lg font-bold text-kelly-text">What this county can move</h2>
        <p>
          {p.county
            ? `This profile targets ${p.county.displayName} (FIPS ${p.county.fips}) using verified public election results and transparent planning math—aggregates only, never individual voter lists.`
            : "County record not found yet—once county mapping and election data are loaded for this briefing, refresh this page."}
        </p>
        <p>
          {p.dataStatus.electionPrecinctRowCount > 0
            ? `Precinct-level public results are available for geography signals (${p.dataStatus.electionPrecinctRowCount} rows at aggregate level).`
            : "Precinct-level public results are not loaded yet—planning uses county-level turnout until fuller geography is available."}
        </p>
      </section>

      <section className="mt-6">
        <h2 className="font-heading text-lg font-bold">Votes needed (illustration)</h2>
        <p className="text-sm text-kelly-text/80">
          Majority-style win number: <strong>{p.winNumberModel.majorityWinNumber ?? "—"}</strong> (if expected total ballots ={" "}
          {p.winNumberModel.expectedTotalVotes ?? "—"}). {p.pluralityModel.threeWayNarrative}
        </p>
      </section>

      {pri && (
        <section className="mt-6 rounded-md border border-kelly-text/10 bg-kelly-page/50 px-4 py-3">
          <h2 className="font-heading text-lg font-bold">GOTV plan universe (aggregates only)</h2>
          <p className="mt-1 text-sm text-kelly-text/75">
            The campaign planning team uses participation history, model tiers, and field signals in secure tools. This public page
            only shows <strong>counts and goals</strong>—never an individual voter list.
          </p>
          <ul className="mt-2 list-inside list-disc text-sm text-kelly-text/80">
            <li>Registered voters in latest file (county): <strong>{pri.voterOnRollCount}</strong></li>
            <li>Participation cells stored: <strong>{pri.participationCellCount}</strong> (per-election Y/N, when imported)</li>
            <li>Planned contact universe: <strong>{pri.outreachListGoal ?? "—"}</strong> people (ceiling(majority win # × 1.1) for field planning—estimate)</li>
          </ul>
          {pri.dataWarnings.length > 0 && (
            <p className="mt-2 text-xs text-amber-900/90">{pri.dataWarnings[0]}</p>
          )}
          <p className="mt-2 text-xs text-kelly-text/60">
            Detailed priority tables and exports stay in the campaign&apos;s secure tools (staff sign-in only)—not on this public page.
          </p>
        </section>
      )}

      <section className="mt-6">
        <h2 className="font-heading text-lg font-bold">Relational organizing & Power of Five</h2>
        <p className="text-sm text-kelly-text/80">{p.engagementPlan.relationalOrganizing.howItHelpsWin}</p>
        <p className="mt-2 text-sm text-kelly-text/70">
          Public hub: <a className="text-kelly-slate underline" href="https://www.kellygrappe.com">kellygrappe.com</a> — sign up and
          volunteer. Campaign planning systems stay behind staff login; private voter data never belongs on a public page.
        </p>
      </section>

      <section className="mt-6 text-sm text-kelly-text/70">
        <h2 className="font-heading text-base font-bold text-kelly-text">Data gaps (honest)</h2>
        <ul className="list-inside list-disc">
          {p.missingDataWarnings.slice(0, 5).map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
