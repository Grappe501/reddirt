import Link from "next/link";
import type { OrchestrationStatePayload } from "@/lib/agents/orchestration/build-orchestration-payload";

export function OrchestrationBlockersRisksOpportunities({ payload }: { payload: OrchestrationStatePayload }) {
  const { blockers, risks, opportunities } = payload;

  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <details className="rounded-2xl border p-4 open:pb-4" open>
        <summary className="cursor-pointer text-sm font-bold text-kelly-navy">Blockers ({blockers.length})</summary>
        <ul className="mt-3 space-y-2 text-sm">
          {blockers.length === 0 ? (
            <li className="text-kelly-muted">No active blockers.</li>
          ) : (
            blockers.map((b) => (
              <li key={b.id} className="rounded-lg border bg-kelly-page px-3 py-2">
                <p className="text-[10px] font-bold uppercase text-kelly-muted">{b.severity} · {b.domainId.replaceAll("_", " ")}</p>
                <p className="mt-1 text-kelly-navy">{b.message}</p>
                {b.suggestedRoute ? (
                  <Link href={b.suggestedRoute} className="mt-1 inline-block text-xs font-bold underline">
                    Next step →
                  </Link>
                ) : null}
                {b.missingSignal ? <p className="mt-1 text-[10px] text-amber-800">Missing signal: {b.missingSignal}</p> : null}
              </li>
            ))
          )}
        </ul>
      </details>

      <details className="rounded-2xl border p-4">
        <summary className="cursor-pointer text-sm font-bold text-kelly-navy">Risks ({risks.length})</summary>
        <ul className="mt-3 space-y-2 text-sm">
          {risks.length === 0 ? (
            <li className="text-kelly-muted">No elevated risks flagged.</li>
          ) : (
            risks.map((r, i) => (
              <li key={i} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-950">
                {r}
              </li>
            ))
          )}
        </ul>
      </details>

      <details className="rounded-2xl border p-4">
        <summary className="cursor-pointer text-sm font-bold text-kelly-navy">Opportunities ({opportunities.length})</summary>
        <ul className="mt-3 space-y-2 text-sm">
          {opportunities.length === 0 ? (
            <li className="text-kelly-muted">No opportunities surfaced yet.</li>
          ) : (
            opportunities.map((o) => (
              <li key={o.id} className="rounded-lg border bg-emerald-50 px-3 py-2">
                <p className="text-[10px] font-bold uppercase text-emerald-800">{o.impact} · {o.domainId.replaceAll("_", " ")}</p>
                <p className="mt-1 text-emerald-950">{o.message}</p>
              </li>
            ))
          )}
        </ul>
      </details>
    </section>
  );
}
