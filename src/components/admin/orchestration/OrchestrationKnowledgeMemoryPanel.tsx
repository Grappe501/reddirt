import type { CampaignKnowledgeSummary } from "@/lib/agents/orchestration/knowledge/campaign-knowledge-types";

export function OrchestrationKnowledgeMemoryPanel({ knowledge }: { knowledge: CampaignKnowledgeSummary }) {
  const gh = knowledge.graphHealth;
  const fb = knowledge.recommendationFeedbackSummary;

  return (
    <section className="rounded-2xl border border-emerald-900/15 bg-gradient-to-br from-emerald-50/40 to-white p-5">
      <h2 className="text-sm font-bold text-kelly-navy">Campaign Knowledge + Lessons</h2>
      <p className="mt-2 text-sm text-kelly-muted">{knowledge.knowsSummary}</p>
      <p className="mt-1 text-sm font-medium text-amber-900">{knowledge.unknownSummary}</p>

      <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <dt className="font-bold uppercase text-kelly-muted">Graph confidence</dt>
          <dd className="text-lg font-bold capitalize text-kelly-navy">{gh.confidence}</dd>
        </div>
        <div>
          <dt className="font-bold uppercase text-kelly-muted">Entities</dt>
          <dd className="text-lg font-bold text-kelly-navy">{gh.entityCount}</dd>
        </div>
        <div>
          <dt className="font-bold uppercase text-kelly-muted">Lessons</dt>
          <dd className="text-lg font-bold text-kelly-navy">{gh.lessonCount}</dd>
        </div>
        <div>
          <dt className="font-bold uppercase text-kelly-muted">Observations</dt>
          <dd className="text-lg font-bold text-kelly-navy">{gh.observationCount}</dd>
        </div>
        <div>
          <dt className="font-bold uppercase text-kelly-muted">Advice success</dt>
          <dd className="text-lg font-bold text-kelly-navy">{fb.successRate}%</dd>
        </div>
      </dl>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="text-xs font-bold uppercase text-kelly-muted">Strongest lessons</h3>
          <ul className="mt-2 space-y-2 text-xs">
            {knowledge.strongestLessons.length === 0 ? (
              <li className="text-kelly-muted">No lessons yet — run observation intake.</li>
            ) : (
              knowledge.strongestLessons.map((l) => (
                <li key={l.id} className="rounded-lg border px-2 py-1.5">
                  <span className="font-bold">{l.title}</span>
                  <p className="text-kelly-muted">{l.summary.slice(0, 120)}</p>
                </li>
              ))
            )}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase text-kelly-muted">Recent observations</h3>
          <ul className="mt-2 space-y-1 text-xs text-kelly-muted">
            {knowledge.recentObservations.length === 0 ? (
              <li>No recent observations.</li>
            ) : (
              knowledge.recentObservations.map((o) => (
                <li key={o.id}>
                  <span className="font-bold">{o.title}</span> — {o.type.replaceAll("_", " ")}
                </li>
              ))
            )}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase text-kelly-muted">Knowledge gaps</h3>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {knowledge.knowledgeGaps.length === 0 ? (
              <li>No critical gaps flagged.</li>
            ) : (
              knowledge.knowledgeGaps.slice(0, 5).map((g) => <li key={g.id}>{g.title}</li>)
            )}
          </ul>
          <h3 className="mt-4 text-xs font-bold uppercase text-kelly-muted">Stale domains</h3>
          <p className="mt-1 text-xs text-kelly-muted">
            {knowledge.staleDomains.length === 0
              ? "None"
              : knowledge.staleDomains.map((d) => d.replaceAll("_", " ")).join(", ")}
          </p>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase text-kelly-muted">Recurring blockers</h3>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {knowledge.recurringBlockers.length === 0 ? (
              <li>No recurring blockers detected.</li>
            ) : (
              knowledge.recurringBlockers.map((b) => <li key={b.id}>{b.summary}</li>)
            )}
          </ul>
          <h3 className="mt-4 text-xs font-bold uppercase text-kelly-muted">Recommendation feedback</h3>
          <p className="mt-1 text-xs text-kelly-muted">
            {fb.total} recorded · {fb.accepted} accepted · {fb.completed} completed · {fb.failed} failed
          </p>
        </div>
      </div>
    </section>
  );
}
