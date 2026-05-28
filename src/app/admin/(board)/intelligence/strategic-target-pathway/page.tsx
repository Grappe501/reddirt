import Link from "next/link";
import { loadKellyWinTargetScenarioFile } from "@/lib/election-targets/load-win-target-scenario";
import { computeStatewideRegistrationRollup } from "@/lib/intelligence/voterRegistrationTargetModel";
import { loadCountyBriefingIntelligenceIndex } from "@/lib/intelligence/countyBriefingIntelligence";

export const dynamic = "force-dynamic";

export default async function StrategicTargetPathwayPage() {
  const winTarget = loadKellyWinTargetScenarioFile();
  const registration = computeStatewideRegistrationRollup();
  const countyBriefings = loadCountyBriefingIntelligenceIndex();

  const missingDataWarnings: string[] = [];
  if (!winTarget) missingDataWarnings.push("kelly-win-target-scenario-v1.json not loaded.");
  if (registration.missingCountyGoalCount === registration.countyRows.length) {
    missingDataWarnings.push("arkansas-voter-registration-goals.normalized.json has no populated county rows.");
  }
  if (winTarget && winTarget.counties.every((c) => c.missingData.includes("registration_goal"))) {
    missingDataWarnings.push("All 75 counties flag registration_goal missing in win-target scenario.");
  }

  const pathwayChecklist = [
    { item: "Statewide win number", status: winTarget ? "PRESENT" : "MISSING" },
    { item: "County vote targets (75 counties)", status: winTarget ? "PRESENT" : "MISSING" },
    { item: "County registration goals", status: registration.missingCountyGoalCount < 75 ? "PARTIAL" : "MISSING" },
    { item: "Turnout assumptions", status: winTarget ? "SCENARIO_MODEL" : "MISSING" },
    { item: "Registration conversion model", status: "ANECDOTAL_NEEDS_VALIDATION" },
    { item: "Volunteer capacity model", status: "ARTIFACT_PRESENT" },
    { item: "Field contact goals", status: "PARTIAL" },
    { item: "County priority tiers", status: "PRESENT" },
    { item: "Regional pathway model", status: "PRESENT" },
    { item: "Path-to-victory dashboard", status: "THIS_PAGE" },
  ];

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">
          NSI-7 · Strategic Target Pathway
        </p>
        <h1 className="font-heading text-2xl font-bold">Pathway to Victory Dashboard</h1>
        <p className="mt-2 max-w-4xl font-body text-sm leading-relaxed text-kelly-muted">
          County-aware target rollup, registration goal model, and missing-data warnings. Aggregate-only — no individual voter outputs.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Link href="/admin/intelligence" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Intelligence hub
          </Link>
          <Link href="/admin/intelligence/kim-hammer/county-briefings" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            County briefings
          </Link>
          <Link href="/admin/intelligence/strategy-alignment" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Strategy alignment
          </Link>
          <Link href="/admin/intelligence/morning-brief" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Morning brief
          </Link>
        </div>
      </header>

      <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-md border border-kelly-text/10 bg-kelly-page px-3 py-2 text-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Working target (+ cushion)</p>
          <p className="mt-1 font-heading text-2xl font-bold">
            {winTarget ? winTarget.statewide.workingTargetWithCushion.toLocaleString() : "MISSING"}
          </p>
          <p className="mt-1 text-xs text-kelly-muted">50%+1 legal: {winTarget?.statewide.legalTarget50Plus1.toLocaleString() ?? "—"}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-kelly-page px-3 py-2 text-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Statewide vote gap</p>
          <p className="mt-1 font-heading text-2xl font-bold">
            {winTarget ? winTarget.statewide.statewideVoteGap.toLocaleString() : "MISSING"}
          </p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-kelly-page px-3 py-2 text-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Registration goal (anchor)</p>
          <p className="mt-1 font-heading text-2xl font-bold">{registration.statewideRegistrationGoal.toLocaleString()}</p>
          <p className="mt-1 text-xs text-kelly-muted">GLOBAL_NEW_VOTER_REGISTRATION_GOAL constant</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-kelly-page px-3 py-2 text-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Expected support yield</p>
          <p className="mt-1 font-heading text-2xl font-bold">{registration.expectedSupportVotes.toLocaleString()}</p>
          <p className="mt-1 text-xs text-amber-800">NEEDS_VALIDATION — anecdotal 30% × 75%</p>
        </div>
      </section>

      {missingDataWarnings.length > 0 ? (
        <section className="mb-6 rounded-xl border border-amber-300/50 bg-amber-50 p-4 text-xs text-amber-950">
          <h2 className="text-sm font-bold uppercase tracking-wider">Missing data warnings</h2>
          <ul className="mt-2 list-inside list-disc">
            {missingDataWarnings.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mb-6 rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Registration goal model</h2>
        <p className="mt-2 text-xs text-kelly-muted">{registration.assumptions.notes}</p>
        <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
          <li>Turnout assumption: {(registration.assumptions.registrationTurnoutAssumption * 100).toFixed(0)}%</li>
          <li>Support capture assumption: {(registration.assumptions.supportCaptureAssumption * 100).toFixed(0)}%</li>
          <li>Expected votes from registrations: {registration.expectedVotes.toLocaleString()}</li>
          <li>{registration.winTargetComparison.note}</li>
          {registration.winTargetComparison.expectedSupportGap !== null ? (
            <li>
              Gap vs working target: {registration.winTargetComparison.expectedSupportGap.toLocaleString()} votes
              (illustrative only)
            </li>
          ) : null}
        </ul>
      </section>

      <section className="mb-6 rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Pathway-to-win checklist</h2>
        <table className="mt-2 w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-kelly-text/10 text-kelly-muted">
              <th className="py-1.5 pr-3 font-semibold">Item</th>
              <th className="py-1.5 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {pathwayChecklist.map((row) => (
              <tr key={row.item} className="border-b border-kelly-text/5">
                <td className="py-1.5 pr-3">{row.item}</td>
                <td className="py-1.5 font-semibold">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mb-6 rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">NSI-5 county briefing overlay (6 counties)</h2>
        <ul className="mt-2 text-xs text-kelly-muted">
          {countyBriefings.counties.map((row) => (
            <li key={row.countyId}>
              <Link href={`/admin/intelligence/kim-hammer/counties/${row.countyId}`} className="font-semibold text-kelly-navy underline">
                {row.countyName}
              </Link>
              {" · "}
              {row.confidenceBand} · {row.localRiskLevel} risk
            </li>
          ))}
        </ul>
      </section>

      {winTarget ? (
        <section className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">County target table (sample — low confidence counties first)</h2>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-kelly-text/10 text-kelly-muted">
                  <th className="py-1.5 pr-3 font-semibold">County</th>
                  <th className="py-1.5 pr-3 font-semibold">Target votes</th>
                  <th className="py-1.5 pr-3 font-semibold">Vote gain</th>
                  <th className="py-1.5 pr-3 font-semibold">Confidence</th>
                  <th className="py-1.5 font-semibold">Missing data</th>
                </tr>
              </thead>
              <tbody>
                {[...winTarget.counties]
                  .sort((a, b) => (a.confidence === "low" ? -1 : 1))
                  .slice(0, 20)
                  .map((row) => (
                    <tr key={row.county} className="border-b border-kelly-text/5">
                      <td className="py-1.5 pr-3">{row.county}</td>
                      <td className="py-1.5 pr-3">{row.targetVotes.toLocaleString()}</td>
                      <td className="py-1.5 pr-3">{row.targetVoteGain.toLocaleString()}</td>
                      <td className="py-1.5 pr-3">{row.confidence}</td>
                      <td className="py-1.5">{row.missingData.join(", ")}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[10px] text-kelly-subtle">Showing 20 of 75 counties. Full audit: docs/intelligence/STRATEGIC_TARGET_PATHWAY_AUDIT.md</p>
        </section>
      ) : null}
    </div>
  );
}
