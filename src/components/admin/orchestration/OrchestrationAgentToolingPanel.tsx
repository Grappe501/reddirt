import type { AgentToolingState } from "@/lib/agents/orchestration/tooling/agent-tooling-types";

export function OrchestrationAgentToolingPanel({ tooling }: { tooling: AgentToolingState }) {
  const best = tooling.bestNextToolForCampaignState;

  return (
    <section className="rounded-2xl border border-indigo-900/15 bg-gradient-to-br from-indigo-50/50 to-white p-5">
      <h2 className="text-sm font-bold text-kelly-navy">AI Agent Tooling Brain</h2>
      <p className="mt-2 text-sm text-kelly-muted">{tooling.toolingSummary}</p>
      {best ? (
        <p className="mt-2 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm">
          <span className="font-bold">Best next tool: </span>
          {best.title} — {best.whyNow}
        </p>
      ) : null}

      <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="font-bold uppercase text-kelly-muted">Registry</dt>
          <dd className="text-lg font-bold text-kelly-navy">{tooling.registryToolCount}</dd>
        </div>
        <div>
          <dt className="font-bold uppercase text-kelly-muted">Recommended</dt>
          <dd className="text-lg font-bold text-kelly-navy">{tooling.topRecommendedTools.length}</dd>
        </div>
        <div>
          <dt className="font-bold uppercase text-kelly-muted">Prepared actions</dt>
          <dd className="text-lg font-bold text-kelly-navy">{tooling.preparedActions.length}</dd>
        </div>
        <div>
          <dt className="font-bold uppercase text-kelly-muted">Execution</dt>
          <dd className="text-lg font-bold text-amber-900">Disabled</dd>
        </div>
      </dl>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="text-xs font-bold uppercase text-kelly-muted">Top recommended tools</h3>
          <ul className="mt-2 space-y-2 text-xs">
            {tooling.topRecommendedTools.length === 0 ? (
              <li className="text-kelly-muted">No tools recommended.</li>
            ) : (
              tooling.topRecommendedTools.map((t) => (
                <li key={t.id} className="rounded-lg border px-2 py-1.5">
                  <span className="font-bold">{t.title}</span>
                  <p className="text-kelly-muted">{t.whyNow}</p>
                  <p className="mt-1 text-[10px] uppercase text-amber-900">Safety: {t.safety}</p>
                </li>
              ))
            )}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase text-kelly-muted">Recommended sequences</h3>
          <ul className="mt-2 space-y-2 text-xs">
            {tooling.recommendedSequences.slice(0, 4).map((s) => (
              <li key={s.id} className="rounded-lg border px-2 py-1.5">
                <span className="font-bold">{s.title}</span>
                <p className="text-kelly-muted">{s.summary.slice(0, 100)}</p>
                <p className="mt-1 text-[10px]">{s.steps.length} steps · {s.humanGateRequired ? "human gate" : "read-only"}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase text-kelly-muted">Prepared actions (awaiting review)</h3>
          <ul className="mt-2 space-y-2 text-xs">
            {tooling.preparedActions.length === 0 ? (
              <li className="text-kelly-muted">None prepared.</li>
            ) : (
              tooling.preparedActions.slice(0, 5).map((a) => (
                <li key={a.id} className="rounded-lg border px-2 py-1.5">
                  <span className="font-bold">{a.title}</span>
                  <p className="text-kelly-muted">{a.approvalPrompt}</p>
                  <p className="mt-1 font-bold text-amber-900">canExecuteNow: false</p>
                </li>
              ))
            )}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase text-kelly-muted">Tool coverage (weak domains)</h3>
          <ul className="mt-2 space-y-1 text-xs text-kelly-muted">
            {tooling.coverageByDomain
              .filter((c) => c.coverageStatus === "weak" || c.coverageStatus === "missing")
              .slice(0, 6)
              .map((c) => (
                <li key={c.domain}>
                  <span className="font-bold">{c.domainLabel}</span> ({c.coverageStatus}) — {c.recommendedNextTool}
                </li>
              ))}
          </ul>
          <h3 className="mt-4 text-xs font-bold uppercase text-kelly-muted">Safety summary</h3>
          <p className="mt-1 text-xs text-kelly-muted">
            {tooling.safetySummary.safeReadCount} safe read · {tooling.safetySummary.approvalRequiredCount} approval required ·{" "}
            {tooling.safetySummary.prohibitedCount} prohibited · auto-execution disabled
          </p>
        </div>
      </div>
    </section>
  );
}
