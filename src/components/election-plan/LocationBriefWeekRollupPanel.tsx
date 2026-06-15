import Link from "next/link";

import type { BriefCompletionRollup } from "@/lib/election-plan/location-calendar-binding";
import { currentWeekPlanCities } from "@/lib/election-plan/location-calendar-binding";
import { allCityLocationBriefs } from "@/lib/election-plan/load-city-location-brief";
import type { ElectionPlanCity, ElectionPlanWorkbenchSnapshot } from "@/lib/election-plan/types";
import { cityLocationBriefHref } from "@/lib/election-plan/location-links";
import { cn } from "@/lib/utils";

type Props = {
  rollup: BriefCompletionRollup;
  cities: ElectionPlanCity[];
  data: ElectionPlanWorkbenchSnapshot;
};

function briefStatusClass(status: string): string {
  if (status === "approved") return "bg-emerald-100 text-emerald-900";
  if (status === "review") return "bg-amber-100 text-amber-900";
  if (status === "draft") return "bg-blue-100 text-blue-900";
  return "bg-[var(--ep-cream)] text-[var(--ep-navy-muted)]";
}

export function LocationBriefWeekRollupPanel({ rollup, cities, data }: Props) {
  const weekCityNames = new Set(currentWeekPlanCities(data).map((c) => c.toLowerCase()));
  const weekCities = cities.filter((c) => weekCityNames.has(c.name.toLowerCase()));
  const briefs = allCityLocationBriefs(cities);
  const briefBySlug = new Map(briefs.map((b) => [b.slug, b]));

  return (
    <div className="ep-card mb-8">
      <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Week plan · brief completion</h2>
      <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
        Week {rollup.currentWeekNumber} ({rollup.currentWeekRange}) — location brief readiness roll-up
      </p>

      <div className="mt-4 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{rollup.currentWeekBriefsReady}/{rollup.currentWeekCityCount}</div>
          <div className="ep-stat-label">This week cities ready</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{rollup.draft + rollup.review + rollup.approved}</div>
          <div className="ep-stat-label">All 40 at draft+</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{rollup.numericLocked}</div>
          <div className="ep-stat-label">Numeric targets locked</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{rollup.approved}</div>
          <div className="ep-stat-label">Approved briefs</div>
        </div>
      </div>

      {weekCities.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {weekCities.map((city) => {
            const brief = briefBySlug.get(city.slug);
            if (!brief) return null;
            return (
              <li key={city.slug} className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--ep-border)] py-2 last:border-0">
                <Link href={cityLocationBriefHref(city.slug)} className="font-semibold text-[var(--ep-navy)] hover:text-[var(--ep-gold)]">
                  {city.name}
                </Link>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", briefStatusClass(brief.status))}>
                    {brief.status}
                  </span>
                  {brief.numericTargets?.locked ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-900">
                      targets locked
                    </span>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
