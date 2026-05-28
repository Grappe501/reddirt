import type { Metadata } from "next";
import { loadCampaignBrainAgentRegistry, loadAgentRuntimeStateTable } from "@/lib/agents/county-intelligence/campaignBrainAgentRegistry";
import { statewideInterventionCoordinator } from "@/lib/agents/county-intelligence/statewideInterventionCoordinator";
import { runCampaignManagerAnalysisAgent } from "@/lib/agents/county-intelligence/campaignManagerAnalysisAgent";
import { buildCountyAgentRuntimePayload } from "@/lib/agents/county-intelligence/countyAgentRuntimePayloadBuilder";
import { buildExecutiveCommandRuntime } from "@/lib/agents/county-intelligence/executiveCommandRuntime";
import {
  loadCampaignHealthScorecard,
  loadExecutiveAlertStream,
  loadOperationalBottleneckMap,
  loadRegionalPressureMap,
  loadStatewideInterventionQueue,
  loadStatewideReadinessMatrix,
} from "@/lib/agents/county-intelligence/executiveCommandStateBuilder";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Campaign Brain Multi-Agent Command Center",
  description:
    "Read-only statewide command center for multi-agent coordination and executive command synthesis.",
};

export default async function CampaignBrainCommandCenterPage() {
  const registry = loadCampaignBrainAgentRegistry();
  const runtimeTable = loadAgentRuntimeStateTable();
  const interventions = statewideInterventionCoordinator();
  const runtime = await buildCountyAgentRuntimePayload();
  const analysis = runCampaignManagerAnalysisAgent(runtime);
  const executiveRuntime = buildExecutiveCommandRuntime();
  const readinessMatrix = loadStatewideReadinessMatrix();
  const interventionQueue = loadStatewideInterventionQueue();
  const bottleneckMap = loadOperationalBottleneckMap();
  const regionalPressure = loadRegionalPressureMap();
  const health = loadCampaignHealthScorecard();
  const alertStream = loadExecutiveAlertStream();

  const closestToReadiness = readinessMatrix.rows
    .slice()
    .sort((a, b) => b.countyReadiness - a.countyReadiness)
    .slice(0, 10);
  const highestOperationalRisk = bottleneckMap.rows
    .slice()
    .sort((a, b) => b.pressureScore - a.pressureScore)
    .slice(0, 10);
  const fastestImproving = runtime.countyPayloads
    .slice()
    .sort((a, b) => b.executiveCommand.readinessMatrixScore - a.executiveCommand.readinessMatrixScore)
    .slice(0, 10);
  const strongestVolunteerGrowth = runtime.countyPayloads
    .slice()
    .sort((a, b) => b.resourceOperations.volunteerCapacity - a.resourceOperations.volunteerCapacity)
    .slice(0, 10);
  const highestConfidence = executiveRuntime.counties
    .slice()
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 10);
  const requiredHumanApprovals = [
    ...new Set(interventionQueue.rows.flatMap((row) => row.requiredHumanApprovals)),
  ];
  const confidenceDistribution = {
    present: executiveRuntime.counties.filter((row) => row.status === "PRESENT").length,
    lowConfidence: executiveRuntime.counties.filter((row) => row.status === "LOW_CONFIDENCE").length,
    missing: executiveRuntime.counties.filter((row) => row.status === "MISSING").length,
  };

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
        <h2 className="text-sm font-bold uppercase text-kelly-muted">Executive Command (4S)</h2>
        <p className="mt-2 text-sm text-kelly-text">
          Governed statewide synthesis for campaign leadership: decision-support only, no autonomous execution.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <div className="rounded border p-2">
            <p className="text-xs uppercase text-kelly-muted">Campaign health</p>
            <p className="font-bold text-kelly-navy">{executiveRuntime.statewide.campaignHealth}</p>
          </div>
          <div className="rounded border p-2">
            <p className="text-xs uppercase text-kelly-muted">Readiness average</p>
            <p className="font-bold text-kelly-navy">{executiveRuntime.statewide.readinessAverage}</p>
          </div>
          <div className="rounded border p-2">
            <p className="text-xs uppercase text-kelly-muted">Urgency average</p>
            <p className="font-bold text-kelly-navy">{executiveRuntime.statewide.executiveUrgencyAverage}</p>
          </div>
          <div className="rounded border p-2">
            <p className="text-xs uppercase text-kelly-muted">Blocked automation controls</p>
            <p className="font-bold text-kelly-navy">{executiveRuntime.statewide.blockedAutomationCount}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-4">
          <h2 className="text-sm font-bold uppercase text-kelly-muted">Statewide Readiness Matrix</h2>
          <ul className="mt-2 list-inside list-disc text-sm text-kelly-text">
            {closestToReadiness.map((row) => (
              <li key={row.countySlug}>
                {row.countyName} - readiness {row.countyReadiness} / momentum {row.operationsMomentum}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <h2 className="text-sm font-bold uppercase text-kelly-muted">Statewide Intervention Queue</h2>
          <ul className="mt-2 list-inside list-disc text-sm text-kelly-text">
            {interventionQueue.rows.slice(0, 10).map((row) => (
              <li key={row.countySlug}>
                {row.countyName} - priority {row.priority}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-4">
          <h2 className="text-sm font-bold uppercase text-kelly-muted">Operational Bottleneck Map</h2>
          <ul className="mt-2 list-inside list-disc text-sm text-kelly-text">
            {highestOperationalRisk.map((row) => (
              <li key={row.countySlug}>
                {row.countyName} - pressure {row.pressureScore}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <h2 className="text-sm font-bold uppercase text-kelly-muted">Regional Pressure Map</h2>
          <ul className="mt-2 list-inside list-disc text-sm text-kelly-text">
            {regionalPressure.rows
              .slice()
              .sort((a, b) => b.pressureScore - a.pressureScore)
              .map((row) => (
                <li key={row.regionId}>
                  {row.regionLabel} - pressure {row.pressureScore}
                </li>
              ))}
          </ul>
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

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-4">
          <h2 className="text-sm font-bold uppercase text-kelly-muted">Executive Priority Ranking</h2>
          <ul className="mt-2 list-inside list-disc text-sm text-kelly-text">
            {analysis.executiveCommandCenter.priorityTopTen.map((row) => (
              <li key={row.countySlug}>
                {row.countyName} — score {row.executivePriorityScore} ({row.urgencyBand})
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <h2 className="text-sm font-bold uppercase text-kelly-muted">Executive Alerts</h2>
          <ul className="mt-2 list-inside list-disc text-sm text-kelly-text">
            {alertStream.rows.slice(0, 10).map((row) => (
              <li key={`${row.countySlug}-${row.severity}`}>
                {row.countyName} — {row.severity} ({row.label})
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="text-sm font-bold uppercase text-kelly-muted">Campaign Health Scorecard</h2>
        <ul className="mt-2 list-inside list-disc text-sm text-kelly-text">
          {health.metrics.map((metric) => (
            <li key={metric.metric}>
              {metric.metric} - score {metric.score} ({metric.status})
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-4">
          <h2 className="text-sm font-bold uppercase text-kelly-muted">Statewide Trend Fusion</h2>
          <ul className="mt-2 list-inside list-disc text-sm text-kelly-text">
            <li>Fastest improving counties: {fastestImproving.slice(0, 5).map((row) => row.countyName).join(", ")}</li>
            <li>Strongest volunteer growth: {strongestVolunteerGrowth.slice(0, 5).map((row) => row.countyName).join(", ")}</li>
            <li>Most fragile counties: {highestOperationalRisk.slice(0, 5).map((row) => row.countyName).join(", ")}</li>
            <li>Highest-confidence counties: {highestConfidence.slice(0, 5).map((row) => row.countyName).join(", ")}</li>
          </ul>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <h2 className="text-sm font-bold uppercase text-kelly-muted">Confidence Distribution</h2>
          <ul className="mt-2 list-inside list-disc text-sm text-kelly-text">
            <li>PRESENT: {confidenceDistribution.present}</li>
            <li>LOW_CONFIDENCE: {confidenceDistribution.lowConfidence}</li>
            <li>MISSING: {confidenceDistribution.missing}</li>
          </ul>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="text-sm font-bold uppercase text-kelly-muted">Blocked Automation Matrix</h2>
        <ul className="mt-2 list-inside list-disc text-sm text-kelly-text">
          {analysis.executiveCommandCenter.blockedAutomationMatrix.map((rule, idx) => (
            <li key={idx}>{rule}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="text-sm font-bold uppercase text-kelly-muted">Required Human Approvals</h2>
        <ul className="mt-2 list-inside list-disc text-sm text-kelly-text">
          {requiredHumanApprovals.map((approval) => (
            <li key={approval}>{approval}</li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-kelly-muted">
          Required human approvals remain mandatory before any statewide intervention execution.
        </p>
      </section>
    </main>
  );
}

