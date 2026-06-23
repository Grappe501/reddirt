"use client";

import { useMemo, useState } from "react";

import type { ElectionPlanCity } from "@/lib/election-plan/types";
import { formatVotes } from "@/lib/election-plan/electionPlanData";
import { cn } from "@/lib/utils";

type Props = {
  cities: ElectionPlanCity[];
  top10TargetVotes: number;
  top40TargetVotes: number;
  top250TargetVotes?: number;
  top175TargetVotes?: number;
  top125TargetVotes?: number;
  top100TargetVotes?: number;
  top75TargetVotes?: number;
  initialTop10Only?: boolean;
};

export function CityStrategyGrid({
  cities,
  top10TargetVotes,
  top40TargetVotes,
  top250TargetVotes,
  top175TargetVotes,
  top125TargetVotes,
  top100TargetVotes,
  top75TargetVotes,
  initialTop10Only = true,
}: Props) {
  const combinedTarget = top250TargetVotes ?? top175TargetVotes ?? top125TargetVotes ?? top100TargetVotes ?? top75TargetVotes ?? top40TargetVotes;
  const [showTop10Only, setShowTop10Only] = useState(initialTop10Only);

  const displayed = useMemo(
    () => (showTop10Only ? cities.filter((c) => c.isTop10) : cities),
    [cities, showTop10Only],
  );

  return (
    <div className="space-y-6">
      <div className="ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(combinedTarget)}</div>
          <div className="ep-stat-label">Top 250 target votes</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(top10TargetVotes)}</div>
          <div className="ep-stat-label">Top 10 target votes</div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShowTop10Only(true)}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-semibold transition",
            showTop10Only ? "bg-[var(--ep-navy)] text-white" : "bg-[var(--ep-cream)]",
          )}
        >
          Top 10 deep dives
        </button>
        <button
          type="button"
          onClick={() => setShowTop10Only(false)}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-semibold transition",
            !showTop10Only ? "bg-[var(--ep-navy)] text-white" : "bg-[var(--ep-cream)]",
          )}
        >
          All 250 cities
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {displayed.map((city) => (
          <div key={city.slug} className="ep-card-glass">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-semibold text-[var(--ep-gold)]">#{city.rank}</div>
                <div className="font-heading text-xl font-bold">{city.name}</div>
                <div className="text-sm text-[var(--ep-navy-muted)]">{city.county} County</div>
              </div>
              <div className="text-right">
                <div className="font-heading text-2xl font-bold text-[var(--ep-navy)]">
                  {formatVotes(city.targetVotes)}
                </div>
                <div className="text-xs text-[var(--ep-navy-muted)]">target votes</div>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[var(--ep-navy-muted)]">{city.strategicRole}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-[var(--ep-cream)] px-2 py-0.5">{city.visitFrequency}</span>
              <span className="rounded-full bg-[var(--ep-gold-soft)] px-2 py-0.5">
                +{formatVotes(city.voteGain)} gain
              </span>
              {city.influenceTags.slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-full bg-[var(--ep-cream)] px-2 py-0.5">
                  {tag.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
