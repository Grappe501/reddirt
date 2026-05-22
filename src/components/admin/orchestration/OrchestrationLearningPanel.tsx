import type { OrchestrationLearningInsight } from "@/lib/agents/orchestration/orchestration-learning-insights";

export function OrchestrationLearningPanel({ insights }: { insights: OrchestrationLearningInsight }) {
  return (
    <section className="rounded-2xl border border-kelly-navy/15 bg-gradient-to-br from-kelly-page to-white p-5">
      <h2 className="text-sm font-bold text-kelly-navy">How the AI gets smarter from here</h2>
      <p className="mt-2 text-sm text-kelly-muted">{insights.knowsSummary}</p>
      <p className="mt-1 text-sm font-medium text-amber-900">{insights.unknownSummary}</p>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="text-xs font-bold uppercase text-kelly-muted">Weak domains</h3>
          <ul className="mt-2 space-y-1 text-xs">
            {insights.weakDomains.length === 0 ? (
              <li className="text-kelly-muted">None flagged.</li>
            ) : (
              insights.weakDomains.map((d) => (
                <li key={d.id}>
                  <span className="font-bold">{d.label}:</span> {d.summary}
                </li>
              ))
            )}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase text-kelly-muted">Missing / degraded sources</h3>
          <ul className="mt-2 space-y-1 text-xs">
            {insights.missingSources.length === 0 ? (
              <li className="text-kelly-muted">All sources ready.</li>
            ) : (
              insights.missingSources.map((s) => (
                <li key={s.sourceId}>
                  <span className="font-bold">{s.label}:</span> {s.detail ?? "needs attention"}
                </li>
              ))
            )}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase text-kelly-muted">Needed observations</h3>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {insights.neededObservations.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase text-kelly-muted">Recommended intelligence improvements</h3>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {insights.recommendedImprovements.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
