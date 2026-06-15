import Link from "next/link";

import type { ElectionPlanCluster, ElectionPlanCounty } from "@/lib/election-plan/types";
import { battlefieldClusterHref } from "@/lib/election-plan/battlefield-links";
import { formatPct, formatVotes } from "@/lib/election-plan/electionPlanData";

type Props = {
  clusters: ElectionPlanCluster[];
  standalone?: boolean;
};

export function BattlefieldOverviewPanel({ clusters, standalone }: Props) {
  const totalVci = clusters.reduce((sum, c) => sum + c.vci, 0);

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">Arkansas Battlefield</h1>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
            Nine clusters · 75 counties · VCI-ranked missions
          </p>
        </div>
        {standalone ? (
          <Link
            href="/election-plan?tab=battlefield"
            className="rounded-md border border-[var(--ep-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--ep-navy)] hover:bg-[var(--ep-cream)]"
          >
            ← Election plan workbench
          </Link>
        ) : null}
      </div>

      <div className="mb-8 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{clusters.length}</div>
          <div className="ep-stat-label">Clusters</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">75</div>
          <div className="ep-stat-label">Counties</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(totalVci)}</div>
          <div className="ep-stat-label">Combined cluster VCI</div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {clusters.map((c) => (
          <Link
            key={c.id}
            href={battlefieldClusterHref(c.id)}
            className="ep-card block text-sm transition hover:ring-2 hover:ring-[var(--ep-gold-soft)]"
          >
            <h4 className="font-heading font-bold text-[var(--ep-navy)]">{c.name}</h4>
            <p className="mt-1 text-[var(--ep-navy-muted)]">{c.counties.length} counties</p>
            <p className="mt-2 line-clamp-2 text-xs text-[var(--ep-navy-muted)]">{c.counties.join(" · ")}</p>
            <p className="mt-3 font-semibold">
              VCI {formatVotes(c.vci)} · {formatPct(c.shareOfExpected)} of expected · {c.recommendedVisits}{" "}
              visits
            </p>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">
              Cluster drill-down →
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
