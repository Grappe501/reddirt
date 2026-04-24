import { buildPopeCountyPoliticalProfile, getPopeCountyPriorityPlanMeta } from "@/lib/campaign-engine/county-profiles/pope-county";

export const dynamic = "force-dynamic";

export default async function PopeCountyPublicBriefingPage() {
  const p = await buildPopeCountyPoliticalProfile();
  const pri = await getPopeCountyPriorityPlanMeta();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-deep-soil">
      <p className="text-xs font-bold uppercase tracking-widest text-deep-soil/50">Pope County political profile</p>
      <h1 className="font-heading mt-2 text-3xl font-bold">Kelly Grappe for Secretary of State</h1>
      <p className="text-deep-soil/70">People over politics — path to victory (planning briefing)</p>
      <p className="mt-4 rounded-md border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-sm text-amber-950">
        <strong>Planning briefing.</strong> Some estimates and bill titles require verification before public use. No private voter
        data on this page.
      </p>

      <section className="mt-8 space-y-2 text-sm leading-relaxed text-deep-soil/85">
        <h2 className="font-heading text-lg font-bold text-deep-soil">What this county can move</h2>
        <p>
          {p.county
            ? `This profile targets ${p.county.displayName} (FIPS ${p.county.fips}) using election rows stored in the campaign database and transparent math models.`
            : "County record not found in the database — add county mapping and election ingest, then re-open this page."}
        </p>
        <p>
          {p.dataStatus.electionPrecinctRowCount > 0
            ? `Precinct-level rows available for geography signals (${p.dataStatus.electionPrecinctRowCount} ingested at aggregate level).`
            : "No precinct tabulation in DB yet — use county turnout until PRECINCT-1 / ingest is expanded."}
        </p>
      </section>

      <section className="mt-6">
        <h2 className="font-heading text-lg font-bold">Votes needed (illustration)</h2>
        <p className="text-sm text-deep-soil/80">
          Majority-style win number: <strong>{p.winNumberModel.majorityWinNumber ?? "—"}</strong> (if expected total ballots ={" "}
          {p.winNumberModel.expectedTotalVotes ?? "—"}). {p.pluralityModel.threeWayNarrative}
        </p>
      </section>

      {pri && (
        <section className="mt-6 rounded-md border border-deep-soil/10 bg-cream-canvas/50 px-4 py-3">
          <h2 className="font-heading text-lg font-bold">GOTV plan universe (aggregates only)</h2>
          <p className="mt-1 text-sm text-deep-soil/75">
            Internal operators score the voter file with participation history, model tiers, and field signals. This public page
            only shows <strong>counts and goals</strong>—no individual voter list.
          </p>
          <ul className="mt-2 list-inside list-disc text-sm text-deep-soil/80">
            <li>Registered voters in latest file (county): <strong>{pri.voterOnRollCount}</strong></li>
            <li>Participation cells stored: <strong>{pri.participationCellCount}</strong> (per-election Y/N, when imported)</li>
            <li>Planned contact universe: <strong>{pri.outreachListGoal ?? "—"}</strong> people (ceiling(majority win # × 1.1) for field planning—estimate)</li>
          </ul>
          {pri.dataWarnings.length > 0 && (
            <p className="mt-2 text-xs text-amber-900/90">{pri.dataWarnings[0]}</p>
          )}
          <p className="mt-2 text-xs text-deep-soil/60">
            Full priority tables, masked identifiers, and segment exports live on the team console at{" "}
            <code className="text-[10px]">/admin/county-profiles</code> (restricted access).
          </p>
        </section>
      )}

      <section className="mt-6">
        <h2 className="font-heading text-lg font-bold">Relational organizing & Power of Five</h2>
        <p className="text-sm text-deep-soil/80">{p.engagementPlan.relationalOrganizing.howItHelpsWin}</p>
        <p className="mt-2 text-sm text-deep-soil/70">
          Public hub: <a className="text-civic-slate underline" href="https://www.kellygrappe.com">kellygrappe.com</a> — sign up and
          volunteer. Internal tools in RedDirt support aggregates and GOTV; never export private data to unauthenticated pages.
        </p>
      </section>

      <section className="mt-6 text-sm text-deep-soil/70">
        <h2 className="font-heading text-base font-bold text-deep-soil">Data gaps (honest)</h2>
        <ul className="list-inside list-disc">
          {p.missingDataWarnings.slice(0, 5).map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
