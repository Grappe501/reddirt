import type { ReactNode } from "react";
import type { CountyDashboardCityDrilldown } from "@/lib/campaign-engine/county-dashboards/types";
import { countyDashboardCardClass } from "./countyDashboardClassNames";
import { CountySourceBadge, formatCountyDashboardNumber } from "./countyDashboardFormat";
import { CountySectionHeader } from "./CountySectionHeader";
import { cn } from "@/lib/utils";

type Props = {
  overline?: string;
  title?: string;
  description?: string;
  /** Optional callout (e.g. drill path). */
  pathwayCallout?: ReactNode;
  cities: CountyDashboardCityDrilldown[];
  precinctPlaceholders: { id: string; label: string; note: string }[];
  precinctGroupTitle?: string;
  className?: string;
};

export function CountyDrilldownGrid({
  overline = "Turf & scale",
  title = "City & town drilldown",
  description,
  pathwayCallout,
  cities,
  precinctPlaceholders,
  precinctGroupTitle = "Precinct placeholders (list mode first)",
  className,
}: Props) {
  return (
    <section className={className}>
      <CountySectionHeader overline={overline} title={title} description={description} />
      {pathwayCallout ? (
        <div className="mt-2 rounded-lg border border-kelly-navy/20 bg-kelly-navy/[0.04] px-3 py-2.5 text-xs leading-relaxed text-kelly-navy/95">
          {pathwayCallout}
        </div>
      ) : null}
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {cities.map((c) => (
          <div
            key={c.key}
            className={cn(
              countyDashboardCardClass,
              "border-l-4 border-l-kelly-navy/30 transition-shadow hover:shadow-elevated",
            )}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-kelly-slate/70">{c.displayName}</p>
            <ul className="mt-2 space-y-1 text-sm text-kelly-text/85">
              <li>
                Population: {formatCountyDashboardNumber(c.population.value)}{" "}
                <CountySourceBadge source={c.population.source} note={c.population.note} />
              </li>
              <li>
                Reg. voters: {formatCountyDashboardNumber(c.registeredVoters.value)}{" "}
                <CountySourceBadge source={c.registeredVoters.source} note={c.registeredVoters.note} />
              </li>
              <li>Power Teams: {c.powerTeams.value}</li>
              <li>Coverage: {c.coveragePct.value}%</li>
              <li>Turnout gap: {c.turnoutGapPct.value}% (planning target delta)</li>
              <li>Priority: {c.priorityScore.value}/100</li>
            </ul>
            <p className="mt-2 border-t border-kelly-text/8 pt-2 text-sm font-semibold text-kelly-navy">Next: {c.nextAction}</p>
            <p className="mt-1.5 text-[10px] text-kelly-text/50">Route target (not live):</p>
            <p className="font-mono text-[9px] leading-tight text-kelly-text/55">
              <code className="break-all text-kelly-slate/90">{c.futureCityHref}</code>
            </p>
            <p className="font-mono text-[9px] leading-tight text-kelly-text/45">
              <code className="break-all">{c.futurePrecinctPattern}</code>
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-kelly-text/70">{precinctGroupTitle}</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {precinctPlaceholders.map((pr) => (
            <div
              key={pr.id}
              className="rounded-lg border border-kelly-text/10 bg-kelly-page/70 px-3 py-2 text-xs text-kelly-text/80"
            >
              <span className="font-bold text-kelly-navy">{pr.label}</span> — {pr.note}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
