import Link from "next/link";

import { buildCountyMissionImpact } from "@/lib/election-plan/county-mission-impact";
import type { CountyVictoryTarget } from "@/lib/election-plan/load-county-victory-targets";
import { countyPathToVictoryHref } from "@/lib/election-plan/path-to-victory-links";
import type { ElectionPlanCounty } from "@/lib/election-plan/types";
import { cn } from "@/lib/utils";

type Props = {
  county: ElectionPlanCounty;
  victoryTarget?: CountyVictoryTarget | null;
};

function tierBadgeClass(tier: string) {
  if (tier === "A") return "bg-[var(--ep-navy)] text-white";
  if (tier === "B") return "bg-blue-100 text-blue-950";
  if (tier === "C") return "bg-amber-100 text-amber-950";
  return "bg-slate-100 text-slate-800";
}

export function CountyMissionImpactPanel({ county, victoryTarget }: Props) {
  const impact = buildCountyMissionImpact(county, victoryTarget);

  return (
    <div className="ep-card mb-8 border-l-4 border-[var(--ep-navy)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-gold)]">County mission · what to run here</p>
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Why this county matters</h2>
        </div>
        <span className={cn("rounded-full px-3 py-1 text-xs font-bold uppercase", tierBadgeClass(county.tier))}>
          Tier {county.tier}
        </span>
      </div>

      <p className="mt-3 text-sm font-medium text-[var(--ep-navy)]">{impact.victoryImpactLine}</p>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <article className="rounded-lg border border-[var(--ep-border)] bg-[var(--ep-cream)]/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--ep-gold)]">Primary mission</p>
          <h3 className="mt-1 font-heading text-base font-bold text-[var(--ep-navy)]">{impact.primaryTitle}</h3>
          <p className="mt-1 text-xs font-semibold text-[var(--ep-navy-muted)]">{impact.primaryLaneLabel}</p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--ep-navy-muted)]">{impact.primaryExplanation}</p>
          <p className="mt-3 rounded-md bg-white px-3 py-2 text-sm font-medium text-[var(--ep-navy)]">{impact.primaryVoteLine}</p>
        </article>

        <article className="rounded-lg border border-[var(--ep-border)] bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Secondary mission</p>
          <h3 className="mt-1 font-heading text-base font-bold text-[var(--ep-navy)]">{impact.secondaryTitle}</h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--ep-navy-muted)]">{impact.secondaryExplanation}</p>
          <p className="mt-3 text-sm text-[var(--ep-navy)]">{impact.secondaryVoteLine}</p>
        </article>
      </div>

      <div className="mt-4 rounded-lg border border-[var(--ep-gold)]/30 bg-[var(--ep-cream)]/30 p-4">
        <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">Field cadence</p>
        <p className="mt-1 font-semibold text-[var(--ep-navy)]">{impact.cadenceHeadline}</p>
        <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{impact.cadenceDetail}</p>
        <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">{impact.tierGuidance}</p>
      </div>

      <div className="mt-4">
        <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Volunteer focus this week</p>
        <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm text-[var(--ep-navy-muted)]">
          {impact.volunteerThisWeek.map((line) => (
            <li key={line.slice(0, 48)}>{line}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 border-t border-[var(--ep-border)] pt-4">
        <Link href={countyPathToVictoryHref(county.slug)} className="ep-chapter-link text-sm font-semibold">
          Full path to victory drill-down →
        </Link>
      </div>
    </div>
  );
}
