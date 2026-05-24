import Link from "next/link";
import type { CrossDomainOrchestrationState } from "@/lib/agents/orchestration/cross-domain/cross-domain-orchestrator-types";

export function OrchestrationCrossDomainPanel({ state }: { state: CrossDomainOrchestrationState }) {
  const focus = state.recommendedSectionFocus;

  return (
    <section className="rounded-2xl border border-kelly-navy/15 bg-gradient-to-br from-white to-kelly-page/70 p-5" id="cross-domain-agent-orchestrator">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-kelly-subtle">Phase 4B</p>
          <h2 className="text-sm font-bold text-kelly-navy">Cross-Domain Agent Orchestrator</h2>
          <p className="mt-2 max-w-3xl text-sm text-kelly-muted">{state.summary}</p>
          <p className="mt-1 text-xs font-bold text-amber-900">
            Packets are preparation only. No send, submit, export, calendar write, finance post, or production mutation controls are exposed.
          </p>
        </div>
        <Link href="/api/agents/cross-domain-orchestration-state" className="text-xs font-bold text-kelly-navy underline">
          Cross-domain API
        </Link>
      </div>

      <div className="mt-4 grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white/70 p-3">
          <p className="font-bold uppercase text-kelly-muted">Recommended focus</p>
          <p className="mt-1 font-bold text-kelly-navy">{focus?.label ?? "No focus selected"}</p>
          <p className="mt-1 text-kelly-muted">{focus?.summary ?? "Section map loaded."}</p>
        </div>
        <div className="rounded-lg border bg-white/70 p-3">
          <p className="font-bold uppercase text-kelly-muted">High leverage</p>
          <p className="mt-1 text-kelly-navy">{state.dependencyGraph.highLeverageSections.slice(0, 3).join(", ").replaceAll("_", " ")}</p>
        </div>
        <div className="rounded-lg border bg-white/70 p-3">
          <p className="font-bold uppercase text-kelly-muted">Blocked sections</p>
          <p className="mt-1 text-kelly-navy">{state.dependencyGraph.blockedSections.length || 0}</p>
        </div>
        <div className="rounded-lg border bg-white/70 p-3">
          <p className="font-bold uppercase text-kelly-muted">Action packets</p>
          <p className="mt-1 text-kelly-navy">{state.actionPackets.length} review-ready</p>
        </div>
      </div>

      {state.dependencyGraph.dependencyWarnings.length > 0 ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs">
          <h3 className="font-bold uppercase text-amber-900">Dependency warnings</h3>
          <ul className="mt-2 space-y-1 text-amber-950">
            {state.dependencyGraph.dependencyWarnings.slice(0, 4).map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="text-xs font-bold uppercase text-kelly-muted">Cross-domain playbooks</h3>
          <ul className="mt-2 space-y-2 text-xs">
            {state.playbooks.slice(0, 6).map((p) => (
              <li key={p.id} className="rounded-lg border bg-white/70 p-3">
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="font-bold text-kelly-navy">{p.title}</span>
                  <span className="font-bold text-amber-900">human gated</span>
                </div>
                <p className="mt-1 text-kelly-muted">{p.summary}</p>
                <p className="mt-1 text-kelly-muted">Sections: {p.sections.join(", ").replaceAll("_", " ")}</p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase text-kelly-muted">Action packets</h3>
          <ul className="mt-2 space-y-2 text-xs">
            {state.actionPackets.slice(0, 6).map((packet) => (
              <li key={packet.id} className="rounded-lg border bg-white/70 p-3">
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="font-bold text-kelly-navy">{packet.title}</span>
                  <span className="font-bold text-red-800">canExecuteNow: false</span>
                </div>
                <p className="mt-1 text-kelly-muted">{packet.whyNow}</p>
                <p className="mt-1 text-kelly-muted">Owner: {packet.recommendedOwner.replaceAll("_", " ")}</p>
                <p className="mt-1 text-kelly-muted">Done when: {packet.doneWhen}</p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase text-kelly-muted">Learning hooks</h3>
          <ul className="mt-2 space-y-1 text-xs text-kelly-muted">
            {state.learningHooks.slice(0, 8).map((h) => (
              <li key={h.id}>
                <span className="font-bold text-kelly-navy">{h.sectionId.replaceAll("_", " ")}:</span> {h.prompt}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase text-kelly-muted">Safety gates</h3>
          <ul className="mt-2 space-y-1 text-xs text-kelly-muted">
            <li>Auto execution disabled: {state.safetySummary.autoExecutionDisabled ? "yes" : "no"}</li>
            <li>Human gate required: {state.safetySummary.humanGateRequired ? "yes" : "no"}</li>
            <li>Unsafe execution buttons exposed: {state.safetySummary.unsafeExecutionButtonsExposed ? "yes" : "no"}</li>
            <li>Restricted actions tracked: {state.safetySummary.restrictedActions.length}</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
