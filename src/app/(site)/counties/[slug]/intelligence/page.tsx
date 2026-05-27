import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ARKANSAS_COUNTY_REGISTRY } from "@/lib/county/arkansas-county-registry";
import { publicNarrativeBriefBuilder } from "@/lib/agents/county-intelligence/publicNarrativeBriefBuilder";
import { simulationBriefBuilder } from "@/lib/agents/county-intelligence/simulationBriefBuilder";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const county = ARKANSAS_COUNTY_REGISTRY.find((x) => x.slug === slug);
  if (!county) return { title: "County intelligence" };
  return {
    title: `${county.displayName} — Public Narrative & Issues`,
    description:
      "Aggregate public-signal intelligence only: issue trends, narrative clusters, civic sentiment, and safe operator actions.",
  };
}

export default async function CountyPublicNarrativeIntelligencePage({ params }: Props) {
  const { slug } = await params;
  const county = ARKANSAS_COUNTY_REGISTRY.find((x) => x.slug === slug);
  if (!county) notFound();
  const brief = publicNarrativeBriefBuilder(slug);
  const simulation = simulationBriefBuilder(slug);

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-wide text-kelly-muted">County Intelligence</p>
        <h1 className="text-2xl font-bold text-kelly-navy">Public Narrative & Issues — {county.displayName}</h1>
        <p className="mt-2 text-sm text-kelly-muted">
          Aggregate/public-facing SIGNAL and TREND analysis only. No microtargeting, no inferred private beliefs, no automated outreach.
        </p>
      </header>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="text-sm font-bold uppercase text-kelly-muted">Top Public Issues</h2>
        <ul className="mt-2 list-inside list-disc text-sm text-kelly-text">
          {brief.topPublicIssues.map((issue, i) => (
            <li key={i}>{issue}</li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-4">
          <h2 className="text-sm font-bold uppercase text-kelly-muted">Recurring Issue Timeline</h2>
          <ul className="mt-2 list-inside list-disc text-sm text-kelly-text">
            {brief.recurringIssueTimeline.map((row, i) => (
              <li key={i}>{row}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <h2 className="text-sm font-bold uppercase text-kelly-muted">Narrative Clusters</h2>
          <ul className="mt-2 list-inside list-disc text-sm text-kelly-text">
            {brief.narrativeClusters.map((row, i) => (
              <li key={i}>{row}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-4">
          <h2 className="text-sm font-bold uppercase text-kelly-muted">Regional Alignment + Volatility</h2>
          <p className="mt-2 text-sm text-kelly-text">{brief.regionalAlignment}</p>
          <p className="mt-2 text-sm text-kelly-text">TREND volatility score: {brief.issueVolatility}</p>
          <p className="mt-2 text-sm text-kelly-text">Narrative confidence: {brief.narrativeConfidenceScore}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <h2 className="text-sm font-bold uppercase text-kelly-muted">Civic Sentiment + Messaging Readiness</h2>
          <p className="mt-2 text-sm text-kelly-text">{brief.civicSentimentSummary}</p>
          <p className="mt-2 text-sm text-kelly-text">
            Messaging readiness: <span className="font-semibold">{brief.messagingReadinessStatus}</span>
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-4">
          <h2 className="text-sm font-bold uppercase text-kelly-muted">Earned-Media Opportunities</h2>
          <ul className="mt-2 list-inside list-disc text-sm text-kelly-text">
            {brief.earnedMediaOpportunities.map((row, i) => (
              <li key={i}>{row}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <h2 className="text-sm font-bold uppercase text-kelly-muted">Public Meeting Watch Items</h2>
          <ul className="mt-2 list-inside list-disc text-sm text-kelly-text">
            {brief.publicMeetingWatchItems.map((row, i) => (
              <li key={i}>{row}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-xl border border-amber-300 bg-amber-50 p-4">
        <h2 className="text-sm font-bold uppercase text-amber-900">Recommended Safe Operator Actions</h2>
        <ul className="mt-2 list-inside list-disc text-sm text-amber-900">
          {brief.recommendedSafeOperatorActions.map((row, i) => (
            <li key={i}>{row}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="text-sm font-bold uppercase text-kelly-muted">Simulations & Forecasts</h2>
        <p className="mt-2 text-sm text-kelly-text">
          SCENARIO/MODEL/FORECAST outputs only; assumptions are explicit and non-canonical.
        </p>
        <ul className="mt-2 list-inside list-disc text-sm text-kelly-text">
          {simulation.scenarioCards.slice(0, 5).map((row, i) => (
            <li key={i}>{row}</li>
          ))}
        </ul>
        <p className="mt-2 text-sm text-kelly-text">{simulation.registrationProjection}</p>
        <p className="mt-1 text-sm text-kelly-text">{simulation.turnoutScenario}</p>
        <p className="mt-1 text-sm text-kelly-text">{simulation.readinessTrajectory}</p>
        <p className="mt-1 text-sm text-kelly-text">{simulation.interventionImpactEstimate}</p>
        <p className="mt-2 text-sm text-kelly-text">Confidence score: {simulation.confidenceScore}</p>
      </section>
    </main>
  );
}

