import type { Metadata } from "next";
import { ARKANSAS_COUNTY_REGISTRY } from "@/lib/county/arkansas-county-registry";
import { buildCountyAgentRuntimePayload } from "@/lib/agents/county-intelligence/countyAgentRuntimePayloadBuilder";
import { runCampaignManagerAnalysisAgent } from "@/lib/agents/county-intelligence/campaignManagerAnalysisAgent";
import { loadSimulationEngineReadiness } from "@/lib/agents/county-intelligence/statewideScenarioMatrix";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Statewide Simulations Dashboard",
  description:
    "Aggregate-only simulation scenario matrix for county readiness, bottlenecks, intervention impacts, and operational tradeoff modeling.",
};

export default async function StatewideSimulationsPage() {
  const runtime = await buildCountyAgentRuntimePayload();
  const analysis = runCampaignManagerAnalysisAgent(runtime);
  const readiness = loadSimulationEngineReadiness();
  const rows = analysis.simulationScenarioEngine.countyScenarioRankings;

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-wide text-kelly-muted">Statewide Dashboard</p>
        <h1 className="text-2xl font-bold text-kelly-navy">Simulations & Forecasts</h1>
        <p className="mt-2 text-sm text-kelly-muted">
          All outputs are labeled SCENARIO/FORECAST/MODEL and remain aggregate planning guidance only.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs uppercase text-kelly-muted">Counties</p>
          <p className="text-xl font-bold text-kelly-navy">{ARKANSAS_COUNTY_REGISTRY.length}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs uppercase text-kelly-muted">Readiness rows</p>
          <p className="text-xl font-bold text-kelly-navy">{readiness.rows.length}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs uppercase text-kelly-muted">Low confidence counties</p>
          <p className="text-xl font-bold text-kelly-navy">
            {readiness.rows.filter((r) => r.simulationConfidence < 65).length}
          </p>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="text-sm font-bold uppercase text-kelly-muted">Statewide bottleneck forecasts</h2>
        <ul className="mt-2 list-inside list-disc text-sm text-kelly-text">
          {analysis.simulationScenarioEngine.statewideModeledBottlenecks.map((row, i) => (
            <li key={i}>{row}</li>
          ))}
        </ul>
      </section>

      <section className="overflow-auto rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-kelly-page text-kelly-muted">
            <tr>
              <th className="px-3 py-2 text-left">County</th>
              <th className="px-3 py-2 text-left">Scenario label</th>
              <th className="px-3 py-2 text-left">Confidence</th>
              <th className="px-3 py-2 text-left">Risk</th>
              <th className="px-3 py-2 text-left">Assumptions present</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const ready = readiness.rows.find((r) => r.countySlug === row.countySlug);
              return (
                <tr key={row.countySlug} className="border-t">
                  <td className="px-3 py-2">{row.countyName}</td>
                  <td className="px-3 py-2">{row.label}</td>
                  <td className="px-3 py-2">{row.confidenceScore}</td>
                  <td className="px-3 py-2">{row.scenarioRisk}</td>
                  <td className="px-3 py-2">{ready?.assumptionsPresent ? "YES" : "NO"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </main>
  );
}

