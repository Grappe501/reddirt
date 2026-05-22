import Link from "next/link";
import type { UnifiedCampaignContext } from "@/lib/agents/campaign-intelligence/unified-campaign-context-assembler";

export function CampaignIntelligenceV3Panel({ ctx }: { ctx: UnifiedCampaignContext }) {
  return (
    <section className="space-y-6 rounded-3xl border border-kelly-navy/20 bg-gradient-to-br from-kelly-navy/[0.06] to-kelly-page p-6 font-body">
      <header>
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-slate">AI Command Center V3</p>
        <h2 className="mt-1 font-heading text-xl font-bold text-kelly-navy">Campaign operating intelligence</h2>
        <p className="mt-2 text-sm text-kelly-text/70">{ctx.situationSummary}</p>
        <p className="mt-3 text-xs text-kelly-slate">
          Tenant: <strong>{ctx.tenantDisplayName}</strong> · Period {ctx.period} · Readiness{" "}
          <span className="font-bold text-kelly-navy">{ctx.campaignReadinessIndex}</span>/100
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Momentum" value={ctx.strategic.momentumScore} hint={ctx.strategic.pacingHealth} />
        <MetricCard label="Finance efficiency" value={ctx.finance.resourceEfficiencyScore} hint={ctx.finance.budgetPacing} />
        <MetricCard label="Learning score" value={ctx.learning.eventSuccessScore} hint={ctx.learning.turnoutQuality} />
        <MetricCard label="Operator fatigue" value={ctx.operator.fatigueScore} hint={ctx.operator.fatigueDetected ? "elevated" : "ok"} warn={ctx.operator.fatigueDetected} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-4">
          <h3 className="text-xs font-bold uppercase text-kelly-slate">Strategic health</h3>
          <p className="mt-2 text-xs text-kelly-text/75">Schedule: {ctx.strategic.scheduleSustainability}</p>
          {ctx.strategic.candidateOverloadRisk ? (
            <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-950">
              Candidate overload risk — defer low-impact events
            </p>
          ) : null}
          <ul className="mt-3 space-y-1 text-xs">
            {ctx.strategic.strategicGaps.slice(0, 4).map((g) => (
              <li key={g.id}>
                <strong>{g.title}:</strong> {g.insight}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-4">
          <h3 className="text-xs font-bold uppercase text-kelly-slate">County & coalition</h3>
          <ul className="mt-2 space-y-1 text-xs text-kelly-text/75">
            {ctx.strategic.countyEngagementGaps.map((c) => (
              <li key={c}>• {c}</li>
            ))}
            {ctx.learning.coalitionIndicators.map((c) => (
              <li key={c}>• {c}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-4">
        <h3 className="text-xs font-bold uppercase text-kelly-slate">Executive briefing</h3>
        <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-kelly-text/80">{ctx.operator.dailyStrategicBriefing}</p>
        <p className="mt-2 text-[10px] text-kelly-text/50">Depth: {ctx.operator.explanationDepth} · {ctx.operator.specializationHint}</p>
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase text-kelly-slate">Recommended campaign moves</h3>
        <ul className="mt-2 flex flex-wrap gap-2">
          {ctx.recommendedCampaignMoves.map((m) => (
            <li key={m.href + m.title}>
              <Link href={m.href} className="inline-block rounded-full border border-kelly-navy/25 bg-kelly-page px-3 py-1.5 text-xs font-bold text-kelly-navy">
                {m.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <details className="rounded-xl border border-kelly-text/10 bg-kelly-wash p-3 text-xs">
        <summary className="cursor-pointer font-bold text-kelly-navy">Memory synthesis (human-reviewable)</summary>
        <ul className="mt-2 space-y-1 text-kelly-text/70">
          <li>{ctx.memory.campaignInstinctLine}</li>
          <li>{ctx.memory.operatorMemoryLine}</li>
          <li>{ctx.memory.strategicMemoryLine}</li>
          <li>{ctx.memory.candidateStyleLine}</li>
        </ul>
      </details>
    </section>
  );
}

function MetricCard({
  label,
  value,
  hint,
  warn,
}: {
  label: string;
  value: number;
  hint: string;
  warn?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-3 ${warn ? "border-amber-300 bg-amber-50/80" : "border-kelly-text/10 bg-kelly-page"}`}>
      <p className="text-[10px] font-bold uppercase text-kelly-slate">{label}</p>
      <p className="mt-1 font-heading text-2xl font-bold text-kelly-navy">{value}</p>
      <p className="text-[10px] text-kelly-text/50">{hint}</p>
    </div>
  );
}
