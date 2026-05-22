import type { OrchestrationSafetyPayload } from "@/lib/agents/orchestration/build-orchestration-payload";

export function OrchestrationSafetyGateCard({ safety }: { safety: OrchestrationSafetyPayload }) {
  return (
    <section className="rounded-2xl border border-kelly-navy/20 bg-kelly-navy p-5 text-white">
      <h2 className="text-sm font-bold uppercase tracking-wide opacity-90">Human-gate safety status</h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 text-xs">
        <p>
          <span className="font-bold">Human gate:</span> {safety.humanGateRequired ? "Always required for execution" : "—"}
        </p>
        <p>
          <span className="font-bold">Auto execution:</span> {safety.autoExecutionDisabled ? "Disabled" : "—"}
        </p>
        <p>
          <span className="font-bold">Safety check:</span> {safety.safetyCheckOk ? "PASS" : "Review catalog"}
        </p>
      </div>
      <div className="mt-4">
        <p className="text-[10px] font-bold uppercase opacity-80">Forbidden auto actions</p>
        <ul className="mt-1 flex flex-wrap gap-1">
          {safety.restrictedActions.map((a) => (
            <li key={a} className="rounded bg-white/15 px-2 py-0.5 text-[10px]">
              {a}
            </li>
          ))}
        </ul>
      </div>
      <details className="mt-4">
        <summary className="cursor-pointer text-xs font-bold opacity-90">Control rules</summary>
        <ul className="mt-2 list-inside list-disc text-[11px] opacity-90">
          {safety.controlRules.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </details>
    </section>
  );
}
