import Link from "next/link";
import type { CountyNormalizedKpi, StatewideCountyIntelligence } from "@/lib/agents/county-intelligence/county-kpi-types";

export function CountyIntelligencePanel({
  statewide,
  compact = false,
}: {
  statewide: StatewideCountyIntelligence;
  compact?: boolean;
}) {
  if (!statewide.bridgeAvailable) {
    return (
      <section className="rounded-2xl border border-amber-600/30 bg-amber-600/5 p-5">
        <p className="text-sm font-bold text-kelly-navy">County intelligence</p>
        <p className="mt-2 text-xs text-kelly-muted">
          countyWorkbench bridge unavailable. Set <code className="text-[10px]">COUNTY_WORKBENCH_ROOT</code> or run RedDirt from monorepo with sibling{" "}
          <code className="text-[10px]">countyWorkbench/</code>.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-kelly-navy/15 bg-white/80 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-slate">County intelligence</p>
          <h2 className="font-heading text-lg font-bold text-kelly-navy">Statewide county readiness</h2>
          <p className="mt-1 text-xs text-kelly-muted">
            Read-only from countyWorkbench · Reg goal {statewide.statewideRegistrationGoal.toLocaleString()} · Power of 5{" "}
            {statewide.statewidePowerOfFiveGoal.toLocaleString()}
          </p>
        </div>
        <Link href="/admin/counties/pulaski" className="text-xs font-bold text-kelly-navy underline">
          County bridge →
        </Link>
      </div>

      {!compact ? (
        <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-3">
          <div className="rounded-xl border border-kelly-text/10 p-3">
            <dt className="font-bold">Counties tracked</dt>
            <dd className="mt-1 text-lg font-bold text-kelly-navy">{statewide.counties.length}</dd>
          </div>
          <div className="rounded-xl border border-kelly-text/10 p-3">
            <dt className="font-bold">Need attention</dt>
            <dd className="mt-1 text-lg font-bold text-kelly-navy">{statewide.topAttention.length}</dd>
          </div>
          <div className="rounded-xl border border-kelly-text/10 p-3">
            <dt className="font-bold">Weak counties</dt>
            <dd className="mt-1 text-lg font-bold text-kelly-navy">{statewide.weakCounties.length}</dd>
          </div>
        </dl>
      ) : null}

      <div className="mt-4">
        <p className="text-xs font-bold text-kelly-navy">Top counties needing attention</p>
        <ul className="mt-2 space-y-2">
          {statewide.topAttention.slice(0, compact ? 5 : 10).map((c) => (
            <CountyAttentionRow key={c.countySlug} county={c} reason={statewide.heatList.find((h) => h.countySlug === c.countySlug)?.reason} />
          ))}
        </ul>
      </div>

      {statewide.recommendedStateActions.length > 0 && !compact ? (
        <p className="mt-4 text-[10px] text-kelly-muted">{statewide.recommendedStateActions[0]}</p>
      ) : null}
    </section>
  );
}

function CountyAttentionRow({ county, reason }: { county: CountyNormalizedKpi; reason?: string }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-kelly-text/10 px-3 py-2">
      <span className="text-xs font-semibold">
        {county.countyName}{" "}
        <span className="font-normal text-kelly-subtle">readiness {county.countyReadinessScore}</span>
      </span>
      <span className="text-[10px] text-kelly-muted">{reason ?? county.topWeaknesses[0]}</span>
      <Link href={`/admin/counties/${county.countySlug}`} className="text-[10px] font-bold text-kelly-navy underline">
        Bridge
      </Link>
    </li>
  );
}
