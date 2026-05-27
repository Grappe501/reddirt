import type { Metadata } from "next";
import { loadCampaignBrainAgentRegistry, loadAgentRuntimeStateTable } from "@/lib/agents/county-intelligence/campaignBrainAgentRegistry";
import { statewideInterventionCoordinator } from "@/lib/agents/county-intelligence/statewideInterventionCoordinator";
import { runCampaignManagerAnalysisAgent } from "@/lib/agents/county-intelligence/campaignManagerAnalysisAgent";
import { buildCountyAgentRuntimePayload } from "@/lib/agents/county-intelligence/countyAgentRuntimePayloadBuilder";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Campaign Brain Multi-Agent Command Center",
  description:
    "Read-only statewide command center for multi-agent coordination, conflicts, synthesis confidence, and executive urgency.",
};

export default async function CampaignBrainCommandCenterPage() {
  const registry = loadCampaignBrainAgentRegistry();
  const runtimeTable = loadAgentRuntimeStateTable();
  const interventions = statewideInterventionCoordinator();
  const runtime = await buildCountyAgentRuntimePayload();
  const analysis = runCampaignManagerAnalysisAgent(runtime);

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-wide text-kelly-muted">Statewide Command Center</p>
        <h1 className="text-2xl font-bold text-kelly-navy">Campaign Brain Coordination</h1>
        <p className="mt-2 text-sm text-kelly-muted">
          Multi-agent coordinated synthesis only; no autonomous campaign execution, no autonomous outreach, no voter targeting.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs uppercase text-kelly-muted">Active copilots</p>
          <p className="text-xl font-bold text-kelly-navy">{registry.agents.filter((a) => a.active).length}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs uppercase text-kelly-muted">Runtime rows</p>
          <p className="text-xl font-bold text-kelly-navy">{runtimeTable.rows.length}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs uppercase text-kelly-muted">Blocked automation controls</p>
          <p className="text-xl font-bold text-kelly-navy">
            {analysis.multiAgentCoordination.blockedAutomationMatrix.length}
          </p>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="text-sm font-bold uppercase text-kelly-muted">Active copilots</h2>
        <ul className="mt-2 list-inside list-disc text-sm text-kelly-text">
          {registry.agents.map((agent) => (
            <li key={agent.agentId}>
              {agent.label} — {agent.mode} · confidence {agent.confidenceScore}
            </li>
          ))}
        </ul>
      </section>

      <section className="overflow-auto rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-kelly-page text-kelly-muted">
            <tr>
              <th className="px-3 py-2 text-left">County</th>
              <th className="px-3 py-2 text-left">Executive urgency</th>
              <th className="px-3 py-2 text-left">Coordination confidence</th>
              <th className="px-3 py-2 text-left">Conflicts</th>
              <th className="px-3 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {interventions.rankedInterventions.map((row) => {
              const state = runtimeTable.rows.find((x) => x.countySlug === row.countySlug);
              return (
                <tr key={row.countySlug} className="border-t">
                  <td className="px-3 py-2">{row.countyName}</td>
                  <td className="px-3 py-2">{row.executiveUrgency}</td>
                  <td className="px-3 py-2">{row.coordinationConfidence}</td>
                  <td className="px-3 py-2">{state?.conflicts ?? 0}</td>
                  <td className="px-3 py-2">{state?.status ?? "MISSING"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </main>
  );
}

