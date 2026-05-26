import type { CountyAgentRuntimePayload } from "@/lib/agents/county-intelligence/countyAgentRuntimePayloadBuilder";

function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <dt className="font-bold uppercase text-kelly-muted text-[10px]">{label}</dt>
      <dd className="text-sm font-bold text-kelly-navy">{value}</dd>
    </div>
  );
}

export function OrchestrationCountyAgentRuntimePanel({
  runtime,
}: {
  runtime: CountyAgentRuntimePayload | null;
}) {
  if (!runtime) {
    return (
      <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
        <h2 className="text-sm font-bold text-kelly-navy">County AI Agent Runtime Payload (4L.1 / 4N)</h2>
        <p className="mt-2 text-sm text-amber-900">
          Runtime payload unavailable. Registry wiring exists, but runtime consumer could not load.
        </p>
      </section>
    );
  }

  const firstBlocked = runtime.countyPayloads.find((c) => c.strategyGate.status === "NO");

  return (
    <section className="rounded-2xl border border-indigo-900/15 bg-gradient-to-br from-indigo-50/30 to-white p-5">
      <h2 className="text-sm font-bold text-kelly-navy">County AI Agent Runtime Payload (4L.1 / 4N)</h2>
      <p className="mt-1 text-xs text-kelly-muted">
        Runtime-aware county payload with full operating-system context and county institutional memory (read-only; no automation).
      </p>

      <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Counties" value={runtime.meta.countyCount} />
        <Stat label="Brief available" value={runtime.meta.briefAvailableCount} />
        <Stat label="Win pathway ready" value={runtime.meta.winPathwayReadyCount} />
        <Stat label="Voter metrics ready" value={runtime.meta.voterMetricsReadyCount} />
        <Stat label="Map ready" value={runtime.meta.mapReadyCount} />
        <Stat label="Strategy gate YES" value={runtime.meta.strategyGateYesCount} />
        <Stat label="Automation gate YES" value={runtime.meta.automationGateYesCount} />
      </dl>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-3">
          <h3 className="text-xs font-bold uppercase text-kelly-muted">What the agent knows</h3>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            <li>County identity + readiness + strategy gates</li>
            <li>Schema blocker status + registration ops status</li>
            <li>Win pathway inputs/readiness + landing page sections</li>
            <li>Institutional memory timeline, issue gaps, and regional relationship context</li>
          </ul>
        </div>
        <div className="rounded-lg border bg-white p-3">
          <h3 className="text-xs font-bold uppercase text-kelly-muted">What is blocked</h3>
          <p className="mt-2 text-xs text-kelly-muted">
            {firstBlocked
              ? `${firstBlocked.countyName}: ${firstBlocked.strategyGate.blockedReasons.slice(0, 2).join("; ")}`
              : "No county-level strategy blockers detected."}
          </p>
          <p className="mt-2 text-xs text-kelly-muted">
            Warehouse blockers and institutional memory gaps are reflected per-county.
          </p>
        </div>
        <div className="rounded-lg border bg-white p-3">
          <h3 className="text-xs font-bold uppercase text-kelly-muted">What command/operator action comes next</h3>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {(firstBlocked?.nextBestDataActions ?? ["No next actions surfaced."]).slice(0, 4).map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border bg-white p-3">
          <h3 className="text-xs font-bold uppercase text-kelly-muted">Landing page / Win pathway / Memory readiness</h3>
          <p className="mt-2 text-xs text-kelly-muted">
            Landing sections block explicitly when prerequisites are missing; memory fields remain MISSING/NEEDS_REVIEW until sourced.
          </p>
        </div>
      </div>

      <div className="mt-5 overflow-auto rounded-lg border bg-white">
        <table className="min-w-full text-xs">
          <thead className="bg-kelly-page text-kelly-muted">
            <tr>
              <th className="px-2 py-1 text-left">County</th>
              <th className="px-2 py-1 text-left">Brief</th>
              <th className="px-2 py-1 text-left">Win pathway</th>
              <th className="px-2 py-1 text-left">Voter metrics</th>
              <th className="px-2 py-1 text-left">Map</th>
              <th className="px-2 py-1 text-left">Institutional memory</th>
              <th className="px-2 py-1 text-left">Resource pressure</th>
              <th className="px-2 py-1 text-left">Intervention urgency</th>
              <th className="px-2 py-1 text-left">Strategy gate</th>
              <th className="px-2 py-1 text-left">Automation gate</th>
            </tr>
          </thead>
          <tbody>
            {runtime.statewideDashboard.rows.map((row) => {
              const county = runtime.countyPayloads.find((x) => x.countySlug === row.countySlug);
              return (
                <tr key={row.countySlug} className="border-t">
                  <td className="px-2 py-1">{row.countyName}</td>
                  <td className="px-2 py-1">{row.briefAvailable ? "YES" : "NO"}</td>
                  <td className="px-2 py-1">{row.winPathwayReady ? "YES" : "NO"}</td>
                  <td className="px-2 py-1">{row.voterMetricsReady ? "YES" : "NO"}</td>
                  <td className="px-2 py-1">{row.mapReady ? "YES" : "NO"}</td>
                  <td className="px-2 py-1">{row.institutionalMemory}</td>
                  <td className="px-2 py-1">{county?.resourceOperations.resourcePressure ?? "-"}</td>
                  <td className="px-2 py-1">{county?.resourceOperations.interventionUrgencyScore ?? "-"}</td>
                  <td className="px-2 py-1">{row.strategyGate}</td>
                  <td className="px-2 py-1">{row.automationGate}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

