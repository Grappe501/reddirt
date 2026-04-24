import Link from "next/link";
import { buildAggregateDropoffProfile } from "@/lib/campaign-engine/aggregate-dropoff";
import { buildPopeIntelBriefingBundle, KELLY_HOME, KELLY_VOLUNTEER } from "@/lib/campaign-engine/pope-briefing-bundle";
import { buildPopeCountyPoliticalProfile } from "@/lib/campaign-engine/county-profiles/pope-county";
import { buildCountyWinStrategy } from "@/lib/campaign-engine/county-win-strategy";
import {
  buildCountyRegistrationGoal,
  buildStatewideRegistrationGoalProgress,
  getCountyRegistrationSnapshotSummary,
} from "@/lib/campaign-engine/registration-kpis";
import { computePluralityThreshold, computeWinNumberFromTotal } from "@/lib/campaign-engine/county-political-profile";

export const dynamic = "force-dynamic";

const card = "rounded-md border border-deep-soil/10 bg-cream-canvas px-3 py-2 text-sm";

export default async function CountyIntelligencePage() {
  const profile = await buildPopeCountyPoliticalProfile();
  const b = await buildPopeIntelBriefingBundle().catch(() => null);
  const drop = await buildAggregateDropoffProfile("Pope", "05115");
  const regC = await getCountyRegistrationSnapshotSummary("Pope");
  const regS = await buildStatewideRegistrationGoalProgress(50_000);
  const regGoal = await buildCountyRegistrationGoal("Pope", 50_000);
  const win = buildCountyWinStrategy(profile);

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
          COUNTY-INTEL-2 · Workbench
        </p>
        <h1 className="font-heading text-2xl font-bold">County intelligence (default: Pope)</h1>
        <p className="mt-2 max-w-3xl text-sm text-deep-soil/70">
          <strong>Aggregate only</strong> — no individual persuasion labels, no public voter tables. For classic profile math, see{" "}
          <Link href="/admin/county-profiles" className="text-civic-slate underline">County profiles</Link>. For GOTV read models, see{" "}
          <Link href="/admin/gotv" className="text-civic-slate underline">GOTV</Link>.
        </p>
      </header>

      <div className="mb-4 grid gap-2 sm:grid-cols-2">
        <div className={card}>
          <p className="text-xs font-bold text-deep-soil/55">50K statewide (planning sum)</p>
          <p className="text-lg font-bold">{regS.observedNetNew ?? "—"} / {regS.goal}</p>
          <p className="text-xs text-deep-soil/60">{regS.missingDataNotes[0] ?? "—"}</p>
        </div>
        <div className={card}>
          <p className="text-xs font-bold text-deep-soil/55">Pope “fair share” of 50K</p>
          <p className="text-lg font-bold">{regGoal.impliedCountyContribution ?? "—"}</p>
          <p className="text-xs text-deep-soil/60">Registration latest: {regGoal.countyRegistrationLatest ?? "—"}</p>
        </div>
        <div className={card}>
          <p className="text-xs font-bold text-deep-soil/55">File-based reg KPI (Pope)</p>
          <p className="text-sm">Net: {regC.netNewRegistrations ?? "—"}</p>
          <p className="text-xs text-deep-soil/60">{regC.source}</p>
        </div>
        <div className={card}>
          <p className="text-xs font-bold text-deep-soil/55">Win # (DB anchor)</p>
          <p className="text-lg font-bold">{wn?.value ?? "—"}</p>
        </div>
      </div>

      <h2 className="font-heading text-lg font-bold">Census / ACS / BLS (CountyPublicDemographics)</h2>
      <p className="text-sm text-deep-soil/75">
        Population: {profile.censusAcsBls.censusPopulation ?? "—"} | Median income: {profile.censusAcsBls.acsMedianIncome ?? "—"} | Poverty%: {profile.censusAcsBls.acsPovertyRate ?? "—"} | BLS/ACS unemployment%: {profile.censusAcsBls.blsUnemployment ?? "—"}
      </p>
      <p className="text-xs text-amber-900/80">{profile.censusAcsBls.missingDataWarnings[0] ?? "—"}</p>

      <h2 className="font-heading mt-6 text-lg font-bold">Turnout drop-off (aggregate)</h2>
      <p className="text-sm text-deep-soil/80">{drop.presVsMidGeneral.narrative}</p>
      <p className="text-sm">Gap (pts) pres–mid: {drop.presVsMidGeneral.gapPoints ?? "—"}</p>
      <p className="text-sm">{drop.generalVsPrimary.narrative}</p>

      <h2 className="font-heading mt-6 text-lg font-bold">How we win (narrative)</h2>
      <p className="text-sm text-deep-soil/80">{win.turnoutOpportunity}</p>
      <p className="text-sm text-deep-soil/80">{win.noIndividualTargeting}</p>

      <h2 className="font-heading mt-6 text-lg font-bold">Hammer / SOS (title level)</h2>
      <p className="text-xs text-amber-900">
        {b?.hammer.researchNote ?? "Verify on Arkleg before public claims. Categories below are heuristics on titles only."}
      </p>
      <ul className="mt-2 list-inside list-disc text-xs text-deep-soil/80">
        {b &&
          Object.entries(b.hammer.categories)
            .flatMap(([k, v]) => v.slice(0, 2).map((r) => `${k}: ${r.billNumber}`))
            .slice(0, 12)
            .map((x) => <li key={x}>{x}</li>)}
        {!b && <li>Bundle not loaded</li>}
      </ul>

      <h2 className="font-heading mt-6 text-lg font-bold">Plurality (illustrative)</h2>
      <ul className="list-inside list-disc text-xs text-deep-soil/80">
        {pl.map((x) => (
          <li key={x.s}>{(x.s * 100).toFixed(0)}% → {x.t.value} votes</li>
        ))}
      </ul>

      <h2 className="font-heading mt-6 text-lg font-bold">Static export</h2>
      <p className="text-sm text-deep-soil/75">
        Build: <code className="text-xs">npx tsx scripts/emit-pope-county-intel-site.ts</code> — output{" "}
        <code className="text-xs">H:\SOSWebsite\dist-county-briefings\pope</code>. Zip:{" "}
        <code className="text-xs">pope-county-intelligence-briefing-site.zip</code> (repo root). CTAs:{" "}
        <a className="text-civic-slate underline" href={KELLY_VOLUNTEER}>
          volunteer
        </a>{" "}
        and{" "}
        <a className="text-civic-slate underline" href={KELLY_HOME}>
          home
        </a>
        .
      </p>

      <h2 className="font-heading mt-6 text-lg font-bold">Missing / warnings (profile engine)</h2>
      <ul className="list-inside list-disc text-sm text-amber-900/90">
        {profile.missingDataWarnings.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
    </div>
  );
}
