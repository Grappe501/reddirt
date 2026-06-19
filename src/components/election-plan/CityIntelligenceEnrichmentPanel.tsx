import Link from "next/link";

import {
  CITY_INTELLIGENCE_DIMENSION_LABELS,
  type CityIntelligenceProfile,
  type CivicContactRef,
  type EnrichmentStatus,
} from "@/lib/election-plan/city-intelligence-types";
import { countyPlaybookHref } from "@/lib/election-plan/location-links";
import { cityPathToVictoryHref } from "@/lib/election-plan/path-to-victory-links";
import { formatVotes } from "@/lib/election-plan/electionPlanData";
import { cn } from "@/lib/utils";

type Props = {
  profile: CityIntelligenceProfile;
  countySlug: string;
};

function statusClass(status: EnrichmentStatus): string {
  if (status === "verified") return "bg-emerald-100 text-emerald-900";
  if (status === "api") return "bg-blue-100 text-blue-900";
  if (status === "inherited") return "bg-slate-100 text-slate-800";
  return "bg-amber-100 text-amber-900";
}

function statusLabel(status: EnrichmentStatus): string {
  if (status === "verified") return "Verified seed";
  if (status === "api") return "API (build-time)";
  if (status === "inherited") return "Inherited";
  return "Field verify";
}

function DimensionCard({ label, ref }: { label: string; ref: CivicContactRef }) {
  return (
    <article className="rounded-lg border border-[var(--ep-border)] bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--ep-gold)]">{label}</p>
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", statusClass(ref.status))}>
          {statusLabel(ref.status)}
        </span>
      </div>
      <p className="mt-2 font-heading text-sm font-bold text-[var(--ep-navy)]">{ref.name ?? "—"}</p>
      {ref.title ? <p className="text-xs text-[var(--ep-navy-muted)]">{ref.title}</p> : null}
      {ref.district ? (
        <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
          District: <span className="font-mono">{ref.district}</span>
          {ref.party ? ` · ${ref.party}` : ""}
        </p>
      ) : null}
      {ref.note ? <p className="mt-2 text-xs leading-relaxed text-[var(--ep-navy-muted)]">{ref.note}</p> : null}
      <p className="mt-2 text-[10px] text-[var(--ep-navy-muted)]">Source: {ref.source}</p>
      {ref.url ? (
        <Link href={ref.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs font-semibold underline">
          Link ↗
        </Link>
      ) : null}
    </article>
  );
}

export function CityIntelligenceEnrichmentPanel({ profile, countySlug }: Props) {
  const dims = Object.entries(profile.dimensions) as Array<
    [keyof CityIntelligenceProfile["dimensions"], CivicContactRef]
  >;

  return (
    <section className="mb-8 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-gold)]">
            City intelligence · 10 enrichment dimensions
          </p>
          <h2 className="font-heading text-xl font-bold text-[var(--ep-navy)]">{profile.name} — place profile</h2>
          <p className="mt-1 max-w-3xl text-sm text-[var(--ep-navy-muted)]">
            Geographic, cultural, electoral, and civic-institution context for strategic planning. Scaffold rows need
            field verification before public claims.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-emerald-100 px-2 py-1 font-semibold text-emerald-900">
            {profile.enrichmentSummary.verified} verified
          </span>
          <span className="rounded-full bg-blue-100 px-2 py-1 font-semibold text-blue-900">
            {profile.enrichmentSummary.api} API
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-800">
            {profile.enrichmentSummary.inherited} inherited
          </span>
          <span className="rounded-full bg-amber-100 px-2 py-1 font-semibold text-amber-900">
            {profile.enrichmentSummary.scaffold} field verify
          </span>
        </div>
      </div>

      <div className="ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{profile.population2020.toLocaleString()}</div>
          <div className="ep-stat-label">2020 population</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(profile.election.targetVotes)}</div>
          <div className="ep-stat-label">Vote target</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{profile.election.countySharePct}%</div>
          <div className="ep-stat-label">Of {profile.county} County pop.</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">#{profile.rank}</div>
          <div className="ep-stat-label">Top 100 rank</div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="ep-card">
          <h3 className="font-heading text-base font-bold text-[var(--ep-navy)]">Geographic & cluster</h3>
          <p className="mt-3 text-sm leading-relaxed text-[var(--ep-navy-muted)]">{profile.narrative.geographic}</p>
          {profile.cluster ? (
            <p className="mt-3 text-sm text-[var(--ep-navy)]">
              <strong>{profile.cluster.name}</strong> — {profile.cluster.description}
            </p>
          ) : null}
        </div>
        <div className="ep-card">
          <h3 className="font-heading text-base font-bold text-[var(--ep-navy)]">Historical & cultural</h3>
          <p className="mt-3 text-sm leading-relaxed text-[var(--ep-navy-muted)]">{profile.narrative.historicalCultural}</p>
        </div>
        <div className="ep-card">
          <h3 className="font-heading text-base font-bold text-[var(--ep-navy)]">Socio-economic</h3>
          <p className="mt-3 text-sm leading-relaxed text-[var(--ep-navy-muted)]">{profile.narrative.socioEconomic}</p>
          {profile.countyIntel.topIssues.length > 0 ? (
            <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
              County issues: {profile.countyIntel.topIssues.join(" · ")}
            </p>
          ) : null}
        </div>
        <div className="ep-card">
          <h3 className="font-heading text-base font-bold text-[var(--ep-navy)]">County context</h3>
          <p className="mt-3 text-sm leading-relaxed text-[var(--ep-navy-muted)]">{profile.narrative.countyContext}</p>
          {profile.countyIntel.wikiExcerpt ? (
            <p className="mt-3 border-t border-[var(--ep-border)] pt-3 text-xs italic text-[var(--ep-navy-muted)]">
              {profile.countyIntel.wikiExcerpt}
            </p>
          ) : null}
          <Link href={countyPlaybookHref(profile.county, countySlug)} className="mt-3 inline-block text-xs font-semibold underline">
            {profile.county} County intelligence →
          </Link>
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-heading text-lg font-bold text-[var(--ep-navy)]">Ten dimensions — officials & institutions</h3>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {dims.map(([key, ref]) => (
            <DimensionCard key={key} label={CITY_INTELLIGENCE_DIMENSION_LABELS[key]} ref={ref} />
          ))}
        </div>
      </div>

      <div className="ep-card border-l-4 border-[var(--ep-gold)] text-sm">
        <p className="font-semibold text-[var(--ep-navy)]">Strategic plan next pass</p>
        <p className="mt-2 text-[var(--ep-navy-muted)]">
          This profile is the input layer for per-city strategic plans: replace scaffold rows with verified contacts,
          then lock house-party and registration math in the location brief.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link href={cityPathToVictoryHref(profile.slug)} className="ep-chapter-link text-xs font-semibold">
            Path to victory drill-down →
          </Link>
          <Link href="/election-plan/locations/master-plan" className="ep-chapter-link text-xs font-semibold">
            Location master plan →
          </Link>
        </div>
      </div>
    </section>
  );
}
