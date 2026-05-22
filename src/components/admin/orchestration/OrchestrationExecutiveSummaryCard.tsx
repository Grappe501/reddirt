import type { OrchestrationStatePayload } from "@/lib/agents/orchestration/build-orchestration-payload";

const MODE_STYLES: Record<string, string> = {
  live: "bg-emerald-100 text-emerald-900",
  degraded: "bg-amber-100 text-amber-900",
  skeleton: "bg-red-100 text-red-900",
};

export function OrchestrationExecutiveSummaryCard({ payload }: { payload: OrchestrationStatePayload }) {
  const { diagnosis, campaignState, safety } = payload;
  const mode = campaignState.operatingMode;

  return (
    <section className="rounded-2xl border border-kelly-navy/10 bg-kelly-page p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-kelly-muted">Executive summary</h2>
          <p className="mt-2 text-base font-medium text-kelly-navy">{diagnosis.headline}</p>
          <p className="mt-2 text-sm text-kelly-muted">{diagnosis.executiveSummary}</p>
          <p className="mt-1 text-xs text-kelly-subtle">{diagnosis.campaignDiagnosis}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${MODE_STYLES[mode] ?? MODE_STYLES.degraded}`}>
            {mode}
          </span>
          <span className="rounded-full bg-kelly-navy/10 px-2.5 py-1 text-[10px] font-bold uppercase text-kelly-navy">
            confidence {diagnosis.confidenceLevel}
          </span>
          <span className="rounded-full bg-kelly-navy/10 px-2.5 py-1 text-[10px] font-bold uppercase text-kelly-navy">
            risk {campaignState.systemRisk}
          </span>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3 text-xs">
        <div className="rounded-lg border bg-white p-3">
          <p className="font-bold text-kelly-muted">Human gate</p>
          <p className="mt-1 text-kelly-navy">{safety.humanGateRequired ? "Required on all execution" : "—"}</p>
        </div>
        <div className="rounded-lg border bg-white p-3">
          <p className="font-bold text-kelly-muted">Auto execution</p>
          <p className="mt-1 text-kelly-navy">{safety.autoExecutionDisabled ? "Disabled" : "—"}</p>
        </div>
        <div className="rounded-lg border bg-white p-3">
          <p className="font-bold text-kelly-muted">Ops readiness</p>
          <p className="mt-1 text-kelly-navy">{campaignState.operationalReadiness}%</p>
        </div>
      </div>
    </section>
  );
}
