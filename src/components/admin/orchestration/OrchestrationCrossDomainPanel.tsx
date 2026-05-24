import type { CrossDomainOrchestrationState } from "@/lib/agents/orchestration/cross-domain/cross-domain-orchestrator-types";

export function OrchestrationCrossDomainPanel({ state }: { state: CrossDomainOrchestrationState }) {
  const focus = state.recommendedSectionFocus;
  return (
    <section className="rounded-2xl border border-emerald-900/15 bg-gradient-to-br from-emerald-50/50 to-white p-5">
      <h2 className="text-sm font-bold text-kelly-navy">Cross-Domain Agent Orchestrator</h2>
      <p className="mt-2 text-sm text-kelly-muted">{state.summary}</p>
      {focus ? (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm">
          <span className="font-bold">Recommended section focus: </span>
          {focus.label} — {focus.whyNeedsAttention}
        </div>
      ) : null}

      <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="font-bold uppercase text-kelly-muted">Sections</dt>
          <dd className="text-lg font-bold text-kelly-navy">{state.sectionMap.length}</dd>
        </div>
        <div>
          <dt className="font-bold uppercase text-kelly-muted">Playbooks</dt>
          <dd className="text-lg font-bold text-kelly-navy">{state.playbooks.length}</dd>
        </div>
        <div>
          <dt className="font-bold uppercase text-kelly-muted">Packets</dt>
          <dd className="text-lg font-bold text-kelly-navy">{state.actionPackets.length}</dd>
        </div>
        <div>
          <dt className="font-bold uppercase text-kelly-muted">Execution</dt>
          <dd className="text-lg font-bold text-amber-900">Disabled</dd>
        </div>
      </dl>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="text-xs font-bold uppercase text-kelly-muted">Dependency warnings</h3>
          <ul className="mt-2 space-y-1 text-xs text-kelly-muted">
            {state.dependencyGraph.dependencyWarnings.length === 0 ? (
              <li>No cross-domain dependency warnings.</li>
            ) : (
              state.dependencyGraph.dependencyWarnings.slice(0, 5).map((w) => <li key={w}>{w}</li>)
            )}
          </ul>
          <h3 className="mt-4 text-xs font-bold uppercase text-kelly-muted">High-leverage sections</h3>
          <p className="mt-1 text-xs text-kelly-muted">{state.dependencyGraph.highLeverageSections.join(", ") || "None"}</p>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase text-kelly-muted">Cross-domain playbooks</h3>
          <ul className="mt-2 space-y-2 text-xs">
            {state.playbooks.slice(0, 6).map((p) => (
              <li key={p.id} className="rounded-lg border px-2 py-1.5">
                <span className="font-bold">{p.title}</span>
                <p className="text-kelly-muted">{p.summary}</p>
                <p className="mt-1 text-[10px] uppercase text-amber-900">{p.humanReviewChecklist.length} human checks · preparation only</p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase text-kelly-muted">Action packets</h3>
          <ul className="mt-2 space-y-2 text-xs">
            {state.actionPackets.slice(0, 5).map((p) => (
              <li key={p.id} className="rounded-lg border px-2 py-1.5">
                <span className="font-bold">{p.title}</span>
                <p className="text-kelly-muted">{p.whyNow}</p>
                <p className="mt-1 font-bold text-amber-900">canExecuteNow: false · {p.humanApprovalsRequired.length} approvals</p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase text-kelly-muted">Learning hooks</h3>
          <ul className="mt-2 space-y-1 text-xs text-kelly-muted">
            {state.learningHooks.slice(0, 6).map((h) => (
              <li key={h.id}>
                <span className="font-bold">{h.sectionId.replaceAll("_", " ")}</span>: {h.prompt}
              </li>
            ))}
          </ul>
          <h3 className="mt-4 text-xs font-bold uppercase text-kelly-muted">Safety gates</h3>
          <p className="mt-1 text-xs text-kelly-muted">
            {state.safetySummary.approvalGateCount} approval checks · packets are preparation-only · no send/submit/export/write/post controls.
          </p>
        </div>
      </div>
    </section>
  );
}
