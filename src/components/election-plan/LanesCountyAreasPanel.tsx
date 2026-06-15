import Link from "next/link";

import { FOUR_LANE_DEFINITIONS } from "@/lib/election-plan/four-lanes-labels";
import { lanesClusterHref } from "@/lib/election-plan/lanes-drill-down-links";
import type { LanesClusterKpi, LanesCountyKpi } from "@/lib/election-plan/load-lanes-drill-down";
import { cityLocationBriefHref, countyPlaybookHref } from "@/lib/election-plan/location-links";
import { formatPct, formatVotes } from "@/lib/election-plan/electionPlanData";

type Props = {
  cluster: LanesClusterKpi;
  county: LanesCountyKpi;
};

export function LanesCountyAreasPanel({ cluster, county }: Props) {
  return (
    <section>
      <Link
        href={lanesClusterHref(cluster.id)}
        className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]"
      >
        ← {cluster.name}
      </Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[var(--ep-gold)]">{cluster.name}</p>
          <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">{county.county} County</h1>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
            Tier {county.tier} · VCI #{county.vciRank} · {formatVotes(county.vci)} VCI
          </p>
        </div>
        <Link href={countyPlaybookHref(county.county, county.slug)} className="ep-chapter-link text-sm">
          County playbook →
        </Link>
      </div>

      <div className="my-6 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(county.expectedContribution)}</div>
          <div className="ep-stat-label">Expected lane capture</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(county.lane2)}</div>
          <div className="ep-stat-label">{FOUR_LANE_DEFINITIONS.lane2.tableHeader}</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(county.lane3)}</div>
          <div className="ep-stat-label">{FOUR_LANE_DEFINITIONS.lane3.tableHeader}</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(county.lane4)}</div>
          <div className="ep-stat-label">{FOUR_LANE_DEFINITIONS.lane4.tableHeader}</div>
        </div>
      </div>

      <h2 className="mb-2 font-heading text-lg font-bold">City, town & geographic areas</h2>
      <p className="mb-4 text-sm text-[var(--ep-navy-muted)]">
        Priority cities carry Top 40 vote targets; outlying & rural areas cover the rest of the county by geography.
      </p>

      <div className="ep-card overflow-x-auto">
        <table className="w-full min-w-[40rem] text-sm">
          <thead>
            <tr className="border-b border-[var(--ep-border)] text-left text-xs uppercase tracking-wide text-[var(--ep-navy-muted)]">
              <th className="pb-3 pr-4">Area</th>
              <th className="pb-3 pr-4 text-right">Expected total</th>
              <th className="pb-3 pr-4 text-right">{FOUR_LANE_DEFINITIONS.lane2.tableHeader}</th>
              <th className="pb-3 pr-4 text-right">{FOUR_LANE_DEFINITIONS.lane3.tableHeader}</th>
              <th className="pb-3 pr-4 text-right">{FOUR_LANE_DEFINITIONS.lane4.tableHeader}</th>
              <th className="pb-3 text-right">County share</th>
            </tr>
          </thead>
          <tbody>
            {county.areas.map((area) => (
              <tr key={area.slug} className="border-b border-[var(--ep-border)] last:border-0">
                <td className="py-2.5 pr-4">
                  {area.citySlug ? (
                    <Link href={cityLocationBriefHref(area.citySlug)} className="font-medium hover:text-[var(--ep-gold)]">
                      {area.name}
                    </Link>
                  ) : (
                    <span className="font-medium">{area.name}</span>
                  )}
                  <div className="text-[10px] uppercase text-[var(--ep-navy-muted)]">
                    {area.kind === "city" ? "Priority city" : "Geographic area"}
                  </div>
                </td>
                <td className="py-2.5 pr-4 text-right font-semibold tabular-nums">
                  {formatVotes(area.expectedContribution)}
                </td>
                <td className="py-2.5 pr-4 text-right tabular-nums text-[var(--ep-navy-muted)]">
                  {formatVotes(area.lane2)}
                </td>
                <td className="py-2.5 pr-4 text-right tabular-nums text-[var(--ep-navy-muted)]">
                  {formatVotes(area.lane3)}
                </td>
                <td className="py-2.5 pr-4 text-right tabular-nums text-[var(--ep-navy-muted)]">
                  {formatVotes(area.lane4)}
                </td>
                <td className="py-2.5 text-right tabular-nums text-[var(--ep-navy-muted)]">
                  {formatPct(area.shareOfCounty)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
