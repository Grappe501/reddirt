import Link from "next/link";

import { formatVotes } from "@/lib/election-plan/electionPlanData";
import type { CityElectionIntel } from "@/lib/election-plan/load-city-election-intel";
import { communityWorkbenchHref } from "@/lib/election-plan/community-workbench/links";
import { countyPlaybookHref } from "@/lib/election-plan/location-links";

type Props = {
  intel: CityElectionIntel;
  showWorkbenchLink?: boolean;
};

function fmt(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toLocaleString("en-US");
}

export function CityElectionIntelPanel({ intel, showWorkbenchLink = true }: Props) {
  return (
    <div className="ep-card mb-8 border-l-4 border-[var(--ep-navy)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">City election intelligence</p>
          <h2 className="mt-1 font-heading text-lg font-bold text-[var(--ep-navy)]">
            {intel.cityName} · {intel.countyName} County
          </h2>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
            #{intel.rank} · {intel.influenceCategory}
            {intel.isBonusCity ? " · Bonus cushion (isolated from Top 40 totals)" : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {intel.countySlug ? (
            <Link
              href={countyPlaybookHref(intel.countyName, intel.countySlug)}
              className="rounded-full border border-[var(--ep-border)] px-3 py-1 font-semibold text-[var(--ep-navy)] hover:border-[var(--ep-gold)]"
            >
              County intelligence →
            </Link>
          ) : null}
          {showWorkbenchLink ? (
            <Link
              href={communityWorkbenchHref(intel.citySlug)}
              className="rounded-full border border-[var(--ep-border)] px-3 py-1 font-semibold text-[var(--ep-navy)] hover:border-[var(--ep-gold)]"
            >
              Community workbench →
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mt-4 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{fmt(intel.population2020)}</div>
          <div className="ep-stat-label">Population (2020)</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{fmt(intel.estimatedRegisteredVoters)}</div>
          <div className="ep-stat-label">Registered voters (est.)</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{fmt(intel.baselineSosVotes2022)}</div>
          <div className="ep-stat-label">2022 SOS baseline</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(intel.voteTarget)}</div>
          <div className="ep-stat-label">2026 vote target</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">+{formatVotes(intel.voteGain)}</div>
          <div className="ep-stat-label">Gain needed</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{fmt(intel.countyRegistrationGoal)}</div>
          <div className="ep-stat-label">{intel.countyName} reg. goal</div>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-xs text-[var(--ep-navy-muted)]">
        {intel.populationSource ? <p>{intel.populationSource}</p> : null}
        {intel.registeredVotersNote ? <p>{intel.registeredVotersNote}</p> : null}
        {intel.baselineSource ? <p>{intel.baselineSource}</p> : null}
        {intel.population2020 == null && intel.estimatedRegisteredVoters == null ? (
          <p className="italic">
            Population and registration estimates pending — add to{" "}
            <code className="text-[10px]">bonus-city-workbenches.source.json</code> or ingest county demographics.
          </p>
        ) : null}
      </div>
    </div>
  );
}
