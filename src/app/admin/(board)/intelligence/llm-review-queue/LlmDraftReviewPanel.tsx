import type { LlmDraftReviewEntry } from "@/lib/intelligence/llmDraftGateway";

export function LlmDraftReviewPanel({ drafts }: { drafts: LlmDraftReviewEntry[] }) {
  if (drafts.length === 0) {
    return (
      <section className="rounded-xl border border-kelly-text/10 bg-white p-4 text-sm text-kelly-muted">
        No active drafts in queue. Run AI copilot tools to generate governed drafts.
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Draft viewer</h2>
      {drafts.map((draft) => (
        <article key={draft.draftId} className="rounded-xl border border-violet-200/50 bg-violet-50/30 p-4 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-heading text-sm font-bold text-violet-950">{draft.draftTitle}</h3>
            <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
              {draft.reviewStatus}
            </span>
            <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-900">
              {draft.publicationSafety}
            </span>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-800">
              {draft.generationMode}
            </span>
          </div>
          <p className="mt-1 text-[10px] text-violet-900/80">
            {draft.draftId} · {draft.generatedByTool} · {draft.generatedAt} · Reviewer: {draft.recommendedReviewer}
          </p>

          <details className="mt-3">
            <summary className="cursor-pointer font-semibold text-violet-950">Draft content (internal only)</summary>
            <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded border border-violet-200/50 bg-white p-3 text-[10px] text-violet-950">
              {draft.draftContent.slice(0, 4000)}
            </pre>
          </details>

          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <div>
              <p className="font-semibold text-violet-950">Source dependencies</p>
              <ul className="list-inside list-disc text-violet-900">
                {draft.sourceDependencies.slice(0, 5).map((dep) => (
                  <li key={dep}>{dep}</li>
                ))}
              </ul>
              <p className="mt-2 font-semibold text-violet-950">Citation dependencies</p>
              <ul className="list-inside list-disc text-violet-900">
                {draft.citationDependencies.length > 0 ? draft.citationDependencies.slice(0, 4).map((dep) => <li key={dep}>{dep}</li>) : <li>None linked</li>}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-violet-950">Narrative dependencies</p>
              <ul className="list-inside list-disc text-violet-900">
                {draft.narrativeDependencies.slice(0, 4).map((dep) => (
                  <li key={dep}>{dep}</li>
                ))}
              </ul>
              <p className="mt-2 font-semibold text-violet-950">County dependencies</p>
              <ul className="list-inside list-disc text-violet-900">
                {draft.countyDependencies.slice(0, 4).map((dep) => (
                  <li key={dep}>{dep}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-3">
            <p className="font-semibold text-rose-800">Risk / governance warnings</p>
            <ul className="list-inside list-disc text-rose-900">
              {[...draft.governanceWarnings, ...draft.unsupportedClaimWarnings, ...draft.hallucinationRiskWarnings].slice(0, 6).map((w) => (
                <li key={w.slice(0, 48)}>{w}</li>
              ))}
            </ul>
          </div>

          <p className="mt-3 text-[10px] font-semibold text-violet-900">
            Publication restrictions: {draft.publicationRestrictions.join(", ")} · No export/publish buttons by design.
          </p>
          <p className="mt-1 text-[10px] text-violet-900">
            Status updates via review workflow API — human authority required for promotion.
          </p>
        </article>
      ))}
    </section>
  );
}
