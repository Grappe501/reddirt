import Link from "next/link";

import { KellyPageSummary } from "@/components/election-plan/KellyPageSummary";
import { countyPlaybookHref } from "@/lib/election-plan/location-links";
import type { GopSos2026LocationView, GopSos2026ResultsBundle } from "@/lib/election-plan/gop-sos-2026-results-types";
import { formatGopPct } from "@/lib/election-plan/gop-sos-2026-results-types";
import { formatVotes } from "@/lib/election-plan/electionPlanData";
import { cn } from "@/lib/utils";

type Props = {
  view: GopSos2026LocationView;
  variant?: "hero" | "panel";
  showDrillDown?: boolean;
};

function tierClass(tier: GopSos2026LocationView["analysis"]["opportunityTier"]) {
  if (tier === "high") return "border-emerald-400 bg-emerald-50/40";
  if (tier === "medium") return "border-amber-400 bg-amber-50/30";
  return "border-[var(--ep-border)] bg-white";
}

function tierLabel(tier: GopSos2026LocationView["analysis"]["opportunityTier"]) {
  if (tier === "high") return "High-opportunity · Norris coalition";
  if (tier === "medium") return "Persuadable GOP base";
  return "Hammer base · service frame";
}

function winnerBadge(winner: string, label: string) {
  const isNorris = winner === "norris";
  const isHammer = winner === "hammer";
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
        isNorris && "bg-orange-100 text-orange-900",
        isHammer && "bg-red-100 text-red-900",
        !isNorris && !isHammer && "bg-[var(--ep-cream)] text-[var(--ep-navy-muted)]",
      )}
    >
      {label}: {winner === "norris" ? "Norris" : winner === "hammer" ? "Hammer" : winner === "harrison" ? "Harrison" : "Tie"}
    </span>
  );
}

export function LocationGopPrimaryRunoffPanel({ view, variant = "hero", showDrillDown = true }: Props) {
  const { primary, runoff, analysis } = view;
  const locationLabel =
    view.scope === "city" && view.cityName
      ? `${view.cityName} · ${view.county} County`
      : `${view.county} County`;
  const countyLevelNote =
    view.scope === "city"
      ? "Vote totals below are county-wide — Arkansas SOS public export is FIPS-county only; municipal or precinct Norris/Hammer splits require a future precinct ingest."
      : null;

  const statGrid = (
    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg border border-[var(--ep-border)] bg-white/80 p-3">
        <p className="text-[10px] font-bold uppercase text-[var(--ep-navy-muted)]">GOP primary · Norris</p>
        <p className="mt-1 font-heading text-lg font-bold text-[var(--ep-navy)]">
          {formatGopPct(primary.norrisPct)}
        </p>
        <p className="text-xs text-[var(--ep-navy-muted)]">{formatVotes(primary.norrisVotes)} votes</p>
      </div>
      <div className="rounded-lg border border-[var(--ep-border)] bg-white/80 p-3">
        <p className="text-[10px] font-bold uppercase text-[var(--ep-navy-muted)]">GOP primary · Hammer</p>
        <p className="mt-1 font-heading text-lg font-bold text-[var(--ep-navy)]">
          {formatGopPct(primary.hammerPct)}
        </p>
        <p className="text-xs text-[var(--ep-navy-muted)]">{formatVotes(primary.hammerVotes)} votes</p>
      </div>
      <div className="rounded-lg border border-[var(--ep-border)] bg-white/80 p-3">
        <p className="text-[10px] font-bold uppercase text-[var(--ep-navy-muted)]">GOP runoff · Norris</p>
        <p className="mt-1 font-heading text-lg font-bold text-[var(--ep-navy)]">
          {formatGopPct(runoff.norrisPct)}
        </p>
        <p className="text-xs text-[var(--ep-navy-muted)]">{formatVotes(runoff.norrisVotes)} votes</p>
      </div>
      <div className="rounded-lg border border-[var(--ep-border)] bg-white/80 p-3">
        <p className="text-[10px] font-bold uppercase text-[var(--ep-navy-muted)]">GOP runoff · Hammer</p>
        <p className="mt-1 font-heading text-lg font-bold text-[var(--ep-navy)]">
          {formatGopPct(runoff.hammerPct)}
        </p>
        <p className="text-xs text-[var(--ep-navy-muted)]">
          {formatVotes(runoff.hammerVotes)} · margin {formatGopPct(runoff.marginPct)}
        </p>
      </div>
    </div>
  );

  if (variant === "panel") {
    return (
      <section className={cn("ep-card mb-6 border-l-4 p-4", tierClass(analysis.opportunityTier))}>
        <p className="text-[10px] font-bold uppercase text-[var(--ep-gold)]">2026 GOP SOS · Norris coalition map</p>
        <h2 className="mt-1 font-heading text-lg font-bold text-[var(--ep-navy)]">{locationLabel}</h2>
        <p className="mt-2 text-sm font-semibold text-[var(--ep-navy)]">{analysis.headline}</p>
        {statGrid}
      </section>
    );
  }

  return (
    <section className={cn("ep-card mb-6 border-2 p-5", tierClass(analysis.opportunityTier))}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase text-[var(--ep-gold)]">
            2026 Republican SOS · primary + runoff
          </p>
          <h2 className="mt-1 font-heading text-xl font-bold text-[var(--ep-navy)]">{locationLabel}</h2>
          {countyLevelNote ? (
            <p className="mt-2 text-xs text-amber-900/80">{countyLevelNote}</p>
          ) : null}
          <p className="mt-1 text-xs font-semibold text-[var(--ep-navy-muted)]">{tierLabel(analysis.opportunityTier)}</p>
        </div>
        <div className="flex flex-wrap gap-1">
          {winnerBadge(primary.winner, "Primary")}
          {winnerBadge(runoff.winner, "Runoff")}
        </div>
      </div>

      <KellyPageSummary
        label="Kelly read · 30 seconds"
        summary={`${analysis.headline} ${analysis.hammerWeakness}`}
      />

      {statGrid}

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-[var(--ep-border)] bg-white/70 p-3 text-sm">
          <p className="text-[10px] font-bold uppercase text-emerald-800">Where Hammer is weak</p>
          <p className="mt-2 leading-relaxed text-[var(--ep-navy-muted)]">{analysis.hammerWeakness}</p>
        </div>
        <div className="rounded-lg border border-[var(--ep-border)] bg-white/70 p-3 text-sm">
          <p className="text-[10px] font-bold uppercase text-indigo-800">Norris → Kelly alignment</p>
          <p className="mt-2 leading-relaxed text-[var(--ep-navy-muted)]">{analysis.coalitionFrame}</p>
        </div>
      </div>

      {primary.harrisonVotes > 0 ? (
        <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">
          Primary also: Harrison {formatGopPct(primary.harrisonPct)} ({formatVotes(primary.harrisonVotes)} votes)
          {analysis.primaryToRunoffFlip ? " · Primary-to-runoff flip county" : null}
        </p>
      ) : null}

      {showDrillDown ? (
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {view.scope === "city" && view.citySlug ? (
            <Link
              href={countyPlaybookHref(view.county, view.countySlug)}
              className="rounded-full border border-[var(--ep-navy)] px-3 py-1 font-semibold text-[var(--ep-navy)] hover:bg-[var(--ep-navy)] hover:text-white"
            >
              Full county playbook →
            </Link>
          ) : null}
          <Link
            href="/election-plan/opposition-research/gop-primary-election-analysis"
            className="rounded-full border border-[var(--ep-border)] px-3 py-1 font-semibold text-[var(--ep-navy)] hover:bg-[var(--ep-cream)]"
          >
            All 75 counties · GOP analysis →
          </Link>
          <Link
            href="/election-plan/debate-prep/days/day-2/blocks/b2-film"
            className="rounded-full border border-indigo-400 px-3 py-1 font-semibold text-indigo-900 hover:bg-indigo-50"
          >
            Day 2 · read Hammer tells →
          </Link>
          <Link
            href="/election-plan/debate-prep/days/day-3/blocks/b3-opposition"
            className="rounded-full border border-emerald-400 px-3 py-1 font-semibold text-emerald-900 hover:bg-emerald-50"
          >
            Day 3 · superiority map →
          </Link>
        </div>
      ) : null}
    </section>
  );
}

export function LocationGopPrimaryRunoffCompactStrip({ view }: { view: GopSos2026LocationView }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-[var(--ep-border)] bg-[var(--ep-cream)]/40 px-3 py-2 text-xs">
      <span className="font-bold text-[var(--ep-navy)]">2026 GOP SOS runoff:</span>
      <span>Norris {formatGopPct(view.runoff.norrisPct)}</span>
      <span>·</span>
      <span>Hammer {formatGopPct(view.runoff.hammerPct)}</span>
      <span className="rounded-full bg-white px-2 py-0.5 font-semibold capitalize">{view.analysis.opportunityTier}</span>
    </div>
  );
}
