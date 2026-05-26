import type { CampaignManagerAnalysisResult } from "@/lib/agents/county-intelligence/campaignManagerAnalysisAgent";

export function OrchestrationCampaignManagerAnalysisPanel({
  analysis,
}: {
  analysis: CampaignManagerAnalysisResult | null;
}) {
  if (!analysis) {
    return (
      <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
        <h2 className="text-sm font-bold text-kelly-navy">Campaign Manager Analysis Agent (4M)</h2>
        <p className="mt-2 text-sm text-amber-900">Analysis unavailable for current runtime payload.</p>
      </section>
    );
  }

  const sampleBrief = analysis.countyManagerBriefs[0];

  return (
    <section className="rounded-2xl border border-kelly-navy/15 bg-gradient-to-br from-kelly-page to-white p-5">
      <h2 className="text-sm font-bold text-kelly-navy">Campaign Manager Analysis Agent (4M)</h2>
      <p className="mt-1 text-xs text-kelly-muted">
        Operational analysis only: efficiency, gaps, trends, simulations, modeling, readiness, and resource needs.
      </p>
      <p className="mt-1 text-xs font-medium text-amber-900">
        No voter-level targeting, no contact-list generation, no automated persuasion copy, no final strategy when gate is NO.
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-3">
          <h3 className="text-xs font-bold uppercase text-kelly-muted">System efficiency analyzer</h3>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {analysis.systemEfficiencyAnalyzer.blockedPipelines.slice(0, 4).map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border bg-white p-3">
          <h3 className="text-xs font-bold uppercase text-kelly-muted">Statewide portfolio optimizer</h3>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {analysis.statewidePortfolioOptimizer.rankedOperationalUrgency.slice(0, 5).map((x) => (
              <li key={x.countySlug}>
                <span className="font-bold">{x.countyName}</span> — urgency {x.urgencyScore}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-3">
          <h3 className="text-xs font-bold uppercase text-kelly-muted">Public narrative & issues (4P)</h3>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {analysis.publicNarrativeIntelligence.countyComparisons.slice(0, 5).map((x) => (
              <li key={x.countySlug}>
                {x.countyName} — {x.topIssue} ({x.signalKind}) · volatility {x.volatility}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border bg-white p-3">
          <h3 className="text-xs font-bold uppercase text-kelly-muted">Statewide narrative trends</h3>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {analysis.publicNarrativeIntelligence.statewideNarrativeTrends.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-3">
          <h3 className="text-xs font-bold uppercase text-kelly-muted">Operations & resources (4O)</h3>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {analysis.resourceAllocationForecasting.statewideOperationalRanking.slice(0, 5).map((x) => (
              <li key={x.countySlug}>
                {x.countyName} — urgency {x.interventionUrgency} · burnout {x.burnoutRisk} ({x.forecastType})
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border bg-white p-3">
          <h3 className="text-xs font-bold uppercase text-kelly-muted">Statewide operational bottlenecks</h3>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {analysis.resourceAllocationForecasting.statewideBottlenecks.slice(0, 4).map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </div>
      </div>

      {sampleBrief ? (
        <div className="mt-4 rounded-lg border bg-white p-3">
          <h3 className="text-xs font-bold uppercase text-kelly-muted">AI Campaign Manager Brief (sample)</h3>
          <p className="mt-2 text-xs">
            <span className="font-bold">{sampleBrief.countyName}</span>: {sampleBrief.whatChanged}
          </p>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            <li>Biggest opportunity: {sampleBrief.biggestOperationalOpportunity}</li>
            <li>Biggest risk: {sampleBrief.biggestRisk}</li>
            <li>Data confidence: {sampleBrief.dataConfidence}</li>
            <li>Win-pathway readiness: {sampleBrief.winPathwayReadiness}</li>
          </ul>
          <p className="mt-2 text-[11px] font-bold text-kelly-navy">Recommended operator actions</p>
          <ul className="mt-1 list-inside list-disc text-xs text-kelly-muted">
            {sampleBrief.recommendedOperatorActions.slice(0, 4).map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] font-bold text-amber-900">Human approvals needed</p>
          <ul className="mt-1 list-inside list-disc text-xs text-kelly-muted">
            {sampleBrief.humanApprovalsNeeded.slice(0, 3).map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

