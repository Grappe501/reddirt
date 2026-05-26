import type { Metadata } from "next";
import { ARKANSAS_COUNTY_REGISTRY } from "@/lib/county/arkansas-county-registry";
import { runCampaignManagerAnalysisAgent } from "@/lib/agents/county-intelligence/campaignManagerAnalysisAgent";
import { buildCountyAgentRuntimePayload } from "@/lib/agents/county-intelligence/countyAgentRuntimePayloadBuilder";
import { loadPublicNarrativeReadiness } from "@/lib/agents/county-intelligence/publicIssueSignalRegistry";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Statewide Public Narrative Dashboard",
  description:
    "75-county aggregate public narrative comparison for issue trends, clusters, volatility, readiness, and safe operator guidance.",
};

export default async function PublicNarrativeStatewidePage() {
  const runtime = await buildCountyAgentRuntimePayload();
  const analysis = runCampaignManagerAnalysisAgent(runtime);
  const readiness = loadPublicNarrativeReadiness();

  const rows = analysis.publicNarrativeIntelligence.countyComparisons;
  const lowConfidenceCount = readiness.rows.filter((row) => row.messagingReadiness !== "PRESENT").length;

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-wide text-kelly-muted">Statewide Dashboard</p>
        <h1 className="text-2xl font-bold text-kelly-navy">Public Narrative & Issues</h1>
        <p className="mt-2 text-sm text-kelly-muted">
          Aggregate SIGNAL/TREND intelligence across all 75 counties. No individualized persuasion, private-belief inference, or outreach automation.
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
          <p className="text-xs uppercase text-kelly-muted">Missing/low confidence</p>
          <p className="text-xl font-bold text-kelly-navy">{lowConfidenceCount}</p>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="text-sm font-bold uppercase text-kelly-muted">Statewide Narrative Trends</h2>
        <ul className="mt-2 list-inside list-disc text-sm text-kelly-text">
          {analysis.publicNarrativeIntelligence.statewideNarrativeTrends.map((trend, i) => (
            <li key={i}>{trend}</li>
          ))}
        </ul>
      </section>

      <section className="overflow-auto rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-kelly-page text-kelly-muted">
            <tr>
              <th className="px-3 py-2 text-left">County</th>
              <th className="px-3 py-2 text-left">Top issue</th>
              <th className="px-3 py-2 text-left">Signal type</th>
              <th className="px-3 py-2 text-left">Volatility</th>
              <th className="px-3 py-2 text-left">Confidence</th>
              <th className="px-3 py-2 text-left">Messaging readiness</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const ready = readiness.rows.find((r) => r.countySlug === row.countySlug);
              return (
                <tr key={row.countySlug} className="border-t">
                  <td className="px-3 py-2">{row.countyName}</td>
                  <td className="px-3 py-2">{row.topIssue}</td>
                  <td className="px-3 py-2">{row.signalKind}</td>
                  <td className="px-3 py-2">{row.volatility}</td>
                  <td className="px-3 py-2">{row.confidence}</td>
                  <td className="px-3 py-2">{ready?.messagingReadiness ?? "MISSING"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </main>
  );
}

