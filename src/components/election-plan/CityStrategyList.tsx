import Link from "next/link";

import type { ElectionPlanCity } from "@/lib/election-plan/types";
import { cityLocationBriefHref } from "@/lib/election-plan/location-links";
import { formatVotes } from "@/lib/election-plan/electionPlanData";
import { formatPercentIncrease, getCityVictoryTarget } from "@/lib/election-plan/load-county-victory-targets";

type Props = {
  cities: ElectionPlanCity[];
  combinedTargetVotes: number;
  standalone?: boolean;
};

export function CityStrategyList({ cities, combinedTargetVotes, standalone }: Props) {
  const sorted = [...cities].sort((a, b) => a.rank - b.rank);
  const priorityCities = sorted.filter((c) => !c.isBonusCity);
  const bonus = sorted.filter((c) => c.isBonusCity);

  function CityRow({ city }: { city: ElectionPlanCity }) {
    return (
      <Link
        href={cityLocationBriefHref(city.slug)}
        className="ep-card block transition hover:ring-2 hover:ring-[var(--ep-gold-soft)]"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[var(--ep-gold)]">#{city.rank}</span>
              {city.isTop10 ? (
                <span className="rounded-full bg-[var(--ep-navy)] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                  Backbone
                </span>
              ) : null}
              {city.isBonusCity ? (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-900">
                  Bonus cushion
                </span>
              ) : null}
            </div>
            <div className="font-heading text-xl font-bold text-[var(--ep-navy)]">{city.name}</div>
            <div className="text-sm text-[var(--ep-navy-muted)]">
              {city.county} County · {city.influenceCategory}
            </div>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--ep-navy-muted)]">
              {city.strategicRole}
            </p>
            {(() => {
              const vt = getCityVictoryTarget({
                name: city.name,
                slug: city.slug,
                county: city.county,
                baselineVote: city.baselineVote,
                targetVotes: city.targetVotes,
                voteGain: city.voteGain,
                isTop10: city.isTop10,
              });
              return (
                <p className="mt-2 text-xs font-semibold text-emerald-800">
                  +{formatVotes(vt.growthNeeded)} votes · {formatPercentIncrease(vt.percentIncrease)} ·{" "}
                  {vt.powerOf5LeadersNeeded} Po5 leaders
                </p>
              );
            })()}
          </div>
          <div className="text-right">
            <div className="font-heading text-2xl font-bold text-[var(--ep-navy)]">
              {formatVotes(city.targetVotes)}
            </div>
            <div className="text-xs text-[var(--ep-navy-muted)]">target votes</div>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">
              Location brief →
            </p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">Priority cities</h1>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
            {priorityCities.length} priority cities (Top 125) · ranked by vote target
            {bonus.length > 0 ? " · bonus cities listed separately" : ""}
          </p>
        </div>
        {standalone ? (
          <Link
            href="/election-plan?tab=cities"
            className="rounded-md border border-[var(--ep-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--ep-navy)] hover:bg-[var(--ep-cream)]"
          >
            ← Election plan
          </Link>
        ) : null}
      </div>

      <div className="mb-8 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{priorityCities.length}</div>
          <div className="ep-stat-label">Priority cities (Top 125)</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(combinedTargetVotes)}</div>
          <div className="ep-stat-label">Top 125 combined target</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{priorityCities.filter((c) => c.isTop10).length}</div>
          <div className="ep-stat-label">Backbone cities (top 10 by target)</div>
        </div>
      </div>

      <div className="space-y-3">
        {priorityCities.map((city) => (
          <CityRow key={city.slug} city={city} />
        ))}
      </div>

      {bonus.length > 0 ? (
        <div className="mt-10">
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Bonus cushion cities</h2>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
            Isolated KPI plans — not included in Top 125 combined vote target
          </p>
          <div className="mt-4 space-y-3">
            {bonus.map((city) => (
              <CityRow key={city.slug} city={city} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
