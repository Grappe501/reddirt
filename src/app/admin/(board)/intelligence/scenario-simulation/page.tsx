import Link from "next/link";
import {
  loadStrategicScenarioRegistry,
  summarizeStrategicScenarioSimulation,
} from "@/lib/intelligence/strategicScenarioSimulation";
import { loadDebateIntelligenceV4Packet } from "@/lib/intelligence/v4/debateIntelligenceV4";
import { getSurfaceGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";
import { V4OperatorGuide } from "@/components/admin/intelligence/v4/V4OperatorGuide";
import { V3ResearchIntro } from "@/components/admin/intelligence/v3/V3ResearchIntro";
import { tryIntelligenceLoad } from "@/lib/intelligence/safeIntelligenceLoad";
import type { StrategicScenarioSimulationResult } from "@/lib/intelligence/types/strategicScenarioSimulation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 26;

function ScenarioCard({ row }: { row: StrategicScenarioSimulationResult }) {
  return (
    <li className="rounded border border-kelly-text/10 bg-kelly-page/40 p-3 text-xs">
      <p className="font-semibold text-kelly-navy">{row.title}</p>
      <p className="mt-1 text-[10px] uppercase tracking-wider text-kelly-subtle">
        {row.scenarioType.replaceAll("_", " ")} · {row.confidenceBand} · Risk {row.riskScore} · Opportunity {row.opportunityScore}
      </p>
      <p className="mt-1 font-semibold text-amber-900">{row.primarySignal}</p>
      <p className="mt-1 text-kelly-muted">{row.reasons[0]?.slice(0, 160)}</p>
      {row.signals.length > 0 ? (
        <p className="mt-1 text-[10px] text-violet-900">Signals: {row.signals.join(", ")}</p>
      ) : null}
      {row.linkedNarratives.length > 0 ? (
        <p className="mt-1 text-[10px]">Narratives: {row.linkedNarratives.join(", ")}</p>
      ) : null}
      {row.linkedCounties.length > 0 ? (
        <p className="mt-1 text-[10px]">Counties: {row.linkedCounties.join(", ")}</p>
      ) : null}
      {row.linkedBills.length > 0 ? (
        <p className="mt-1 text-[10px]">Bills: {row.linkedBills.join(", ")}</p>
      ) : null}
      {row.whatToWatchNext.length > 0 ? (
        <p className="mt-2 text-[10px] font-semibold text-emerald-900">Watch: {row.whatToWatchNext[0]}</p>
      ) : null}
      {row.whatNotToDo.length > 0 ? (
        <p className="mt-1 text-[10px] font-semibold text-rose-900">Avoid: {row.whatNotToDo[0]}</p>
      ) : null}
    </li>
  );
}

function ScenarioList({ items }: { items: StrategicScenarioSimulationResult[] }) {
  if (items.length === 0) return <p className="text-xs text-kelly-subtle">None flagged.</p>;
  return (
    <ul className="mt-2 space-y-2">
      {items.map((row) => (
        <ScenarioCard key={row.scenarioId} row={row} />
      ))}
    </ul>
  );
}

export default async function ScenarioSimulationPage() {
  const v4 = loadDebateIntelligenceV4Packet();
  const registry = tryIntelligenceLoad("scenario-registry", () => loadStrategicScenarioRegistry(), {
    scenarios: [],
    generatedAt: new Date().toISOString(),
    version: 1,
    purpose: "fallback",
    governanceDefaults: [],
  } as unknown as ReturnType<typeof loadStrategicScenarioRegistry>);
  const summary = tryIntelligenceLoad("scenario-summary", () => summarizeStrategicScenarioSimulation(), {
    likelyOpponentAttacks: v4.likelyArguments.map((a) => a.argument).slice(0, 6),
    debateTrapWarnings: v4.weaknesses.map((w) => w.saferWording ?? w.label).slice(0, 4),
    whatNotToSay: v4.hub.riskClaims,
    bridgeLineGuidance: [],
    countySensitiveNotes: [],
    evidenceDependencies: [],
    weakCitationWarnings: [],
    doctrineSafeResponseNotes: [],
  } as unknown as ReturnType<typeof summarizeStrategicScenarioSimulation>);

  const familyLabels: Record<string, string> = {
    OPPONENT_RESPONSE: "Opponent response",
    NARRATIVE_COLLISION: "Narrative collision",
    DEBATE: "Debate",
    MEDIA_ESCALATION: "Media escalation",
    COUNTY_REACTION: "County reaction",
    TURNOUT_REGISTRATION: "Turnout / registration",
  };

  const familyOverview = Object.entries(
    registry.scenarios.reduce(
      (acc, row) => {
        acc[row.scenarioType] = (acc[row.scenarioType] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
  );

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V3ResearchIntro
        title="v4 — likely opponent arguments"
        description="Use with simulation outputs below. All scenario outputs remain INTERNAL_ONLY."
        sections={v4.researchLayers.likelyArguments}
      />
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">NSI-14 · Strategic Forecasting</p>
        <h1 className="font-heading text-2xl font-bold">Scenario Simulation Layer</h1>
        <p className="mt-2 max-w-4xl text-sm text-kelly-muted">
          Step 3b — trap warnings before mock debate. Governed scenario modeling — evidence-aware, doctrine-aware,
          explainable. {summary.scenarioModelLabel} ·
          INTERNAL_ONLY · NON_PUBLISHABLE · HUMAN_REVIEW_REQUIRED.
        </p>
        {getSurfaceGuide("scenarioSimulation") ? (
          <V4OperatorGuide guide={getSurfaceGuide("scenarioSimulation")!} />
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Link href="/admin/intelligence/morning-brief" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Morning brief
          </Link>
          <Link href="/admin/intelligence/intelligence-memory" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Intelligence memory (NSI-13)
          </Link>
          <Link href="/admin/intelligence/kim-hammer/evidence-command" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Evidence Command
          </Link>
          <Link href="/admin/intelligence/debate-command" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Debate command
          </Link>
        </div>
      </header>

      <section className="mb-6 rounded-xl border border-amber-300/50 bg-amber-50 p-4 text-xs text-amber-950">
        {summary.totalScenarios} scenarios registered · Generated {summary.generatedAt.slice(0, 19)} UTC
        <ul className="mt-2 list-inside list-disc">
          {Object.entries(summary.byType).map(([type, count]) => (
            <li key={type}>
              {familyLabels[type] ?? type}: {count}
            </li>
          ))}
        </ul>
        <p className="mt-2 font-semibold">Registration assumptions (aggregate only)</p>
        <ul className="list-inside list-disc">
          {summary.registrationAssumptionNotes.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="mb-6 rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Scenario family overview</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {familyOverview.map(([type, count]) => (
            <div key={type} className="rounded border border-kelly-text/10 p-3 text-xs">
              <p className="font-semibold text-kelly-navy">{familyLabels[type] ?? type}</p>
              <p className="mt-1 text-[10px] text-kelly-subtle">{count} scenarios</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-rose-200/50 bg-rose-50/40 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-rose-950">Highest-risk scenarios</h2>
          <ScenarioList items={summary.highestRisk.slice(0, 5)} />
        </div>
        <div className="rounded-xl border border-emerald-200/50 bg-emerald-50/40 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-950">Strongest opportunity scenarios</h2>
          <ScenarioList items={summary.strongestOpportunity.slice(0, 5)} />
        </div>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-violet-200/50 bg-violet-50/40 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-violet-950">Debate traps</h2>
          <ScenarioList items={summary.debateTraps} />
        </div>
        <div className="rounded-xl border border-indigo-200/50 bg-indigo-50/40 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-950">Media escalation warnings</h2>
          <ScenarioList items={summary.mediaEscalationWarnings} />
        </div>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-sky-200/50 bg-sky-50/40 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-sky-950">County reaction scenarios</h2>
          <ScenarioList items={summary.countyReactionScenarios} />
        </div>
        <div className="rounded-xl border border-teal-200/50 bg-teal-50/40 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-teal-950">Turnout / registration scenarios</h2>
          <ScenarioList items={summary.turnoutRegistrationScenarios} />
        </div>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-amber-200/50 bg-amber-50/40 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-950">Narrative collision warnings</h2>
          <ScenarioList items={summary.narrativeCollisionWarnings} />
        </div>
        <div className="rounded-xl border border-orange-200/50 bg-orange-50/40 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-orange-950">Field capacity risks</h2>
          <ScenarioList items={summary.fieldCapacityRisks} />
        </div>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Evidence dependency blockers</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {summary.evidenceDependencyBlockers.length > 0
              ? summary.evidenceDependencyBlockers.map((line) => <li key={line}>{line}</li>)
              : <li>None flagged.</li>}
          </ul>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Doctrine alignment warnings</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {summary.doctrineAlignmentWarnings.length > 0
              ? summary.doctrineAlignmentWarnings.map((line) => <li key={line}>{line}</li>)
              : <li>None flagged.</li>}
          </ul>
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-kelly-navy/20 bg-kelly-navy/5 p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Recommended human review actions</h2>
        <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
          {summary.recommendedHumanReviewActions.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="mt-3 text-[10px] text-kelly-subtle">
          Scenario brief drafts route through NSI-12 LLM queue only — INTERNAL_DRAFT · NON_PUBLISHABLE.
        </p>
      </section>
    </div>
  );
}
