import Link from "next/link";

import { FOUR_LANE_DEFINITIONS } from "@/lib/election-plan/four-lanes-labels";
import { lanesCountyHref, lanesOverviewHref } from "@/lib/election-plan/lanes-drill-down-links";
import type { LanesClusterKpi } from "@/lib/election-plan/load-lanes-drill-down";
import { formatPct, formatVotes } from "@/lib/election-plan/electionPlanData";

type Props = {
  cluster: LanesClusterKpi;
  expectedProjection: number;
};

export function LanesClusterPanel({ cluster, expectedProjection }: Props) {
  return (
    <section>
      <Link href={lanesOverviewHref()} className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
        ← Vote projection · four lanes
      </Link>

      <div className="mt-2">
        <p className="text-xs font-semibold text-[var(--ep-gold)]">Cluster · four lane breakdown</p>
        <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">{cluster.name}</h1>
        {cluster.description ? (
          <p className="mt-2 text-sm leading-relaxed text-[var(--ep-navy-muted)]">{cluster.description}</p>
        ) : null}
      </div>

      <div className="my-6 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(cluster.expectedContribution)}</div>
          <div className="ep-stat-label">Expected lane capture (2+3+4)</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{formatPct(cluster.shareOfExpected)}</div>
          <div className="ep-stat-label">Share of {formatVotes(expectedProjection)} projection</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(cluster.vci)}</div>
          <div className="ep-stat-label">Victory Contribution Index</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{cluster.counties.length}</div>
          <div className="ep-stat-label">Counties</div>
        </div>
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <div className="ep-card">
          <div className="text-xs text-[var(--ep-navy-muted)]">{FOUR_LANE_DEFINITIONS.lane2.tableHeader}</div>
          <div className="font-heading text-xl font-bold">{formatVotes(cluster.lane2)}</div>
        </div>
        <div className="ep-card">
          <div className="text-xs text-[var(--ep-navy-muted)]">{FOUR_LANE_DEFINITIONS.lane3.tableHeader}</div>
          <div className="font-heading text-xl font-bold">{formatVotes(cluster.lane3)}</div>
        </div>
        <div className="ep-card">
          <div className="text-xs text-[var(--ep-navy-muted)]">{FOUR_LANE_DEFINITIONS.lane4.tableHeader}</div>
          <div className="font-heading text-xl font-bold">{formatVotes(cluster.lane4)}</div>
        </div>
      </div>

      <h2 className="mb-3 font-heading text-lg font-bold">Counties in this cluster</h2>
      <div className="space-y-3">
        {cluster.counties.map((c) => (
          <Link
            key={c.slug}
            href={lanesCountyHref(cluster.id, c.slug)}
            className="ep-card block transition hover:ring-2 hover:ring-[var(--ep-gold-soft)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-heading text-lg font-bold">{c.county}</div>
                <div className="text-xs text-[var(--ep-navy-muted)]">
                  Tier {c.tier} · VCI #{c.vciRank} · {c.areas.length} geographic areas
                </div>
              </div>
              <div className="text-right">
                <div className="font-heading text-xl font-bold">{formatVotes(c.expectedContribution)}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">
                  Open county areas →
                </div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-[var(--ep-navy-muted)]">L2 </span>
                <span className="font-semibold tabular-nums">{formatVotes(c.lane2)}</span>
              </div>
              <div>
                <span className="text-[var(--ep-navy-muted)]">L3 </span>
                <span className="font-semibold tabular-nums">{formatVotes(c.lane3)}</span>
              </div>
              <div>
                <span className="text-[var(--ep-navy-muted)]">L4 </span>
                <span className="font-semibold tabular-nums">{formatVotes(c.lane4)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
