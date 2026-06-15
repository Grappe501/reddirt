import Link from "next/link";

import type { ElectionPlanCluster, ElectionPlanCounty } from "@/lib/election-plan/types";
import {
  battlefieldOverviewHref,
  countyDashboardHref,
  countyDashboardLabel,
} from "@/lib/election-plan/battlefield-links";
import { formatVotes } from "@/lib/election-plan/electionPlanData";
import { VciExplainerCard } from "@/components/election-plan/VciExplainerCard";
import { cn } from "@/lib/utils";

type Props = {
  cluster: ElectionPlanCluster;
  counties: ElectionPlanCounty[];
};

function tierClass(tier: string) {
  if (tier === "A") return "ep-tier-a";
  if (tier === "B") return "ep-tier-b";
  if (tier === "C") return "ep-tier-c";
  return "ep-tier-d";
}

function countiesInCluster(cluster: ElectionPlanCluster, all: ElectionPlanCounty[]): ElectionPlanCounty[] {
  const names = new Set(cluster.counties.map((n) => n.toLowerCase()));
  return all
    .filter((c) => names.has(c.county.toLowerCase()))
    .sort((a, b) => a.vciRank - b.vciRank);
}

export function BattlefieldClusterPanel({ cluster, counties: allCounties }: Props) {
  const counties = countiesInCluster(cluster, allCounties);
  const clusterRegistration = counties.reduce((sum, c) => sum + c.registrationGoal, 0);
  const clusterLane2 = counties.reduce((sum, c) => sum + c.lane2Recovery50, 0);

  return (
    <section>
      <div className="mb-6">
        <Link
          href={battlefieldOverviewHref()}
          className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]"
        >
          ← All clusters
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold text-[var(--ep-navy)]">{cluster.name}</h1>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
          {cluster.counties.length} counties · {cluster.recommendedVisits} recommended visits
        </p>
      </div>

      <div className="mb-8 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(cluster.vci)}</div>
          <div className="ep-stat-label">Cluster VCI (Victory Contribution Index)</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{(cluster.shareOfExpected * 100).toFixed(1)}%</div>
          <div className="ep-stat-label">Share of expected votes</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(clusterRegistration)}</div>
          <div className="ep-stat-label">Registration goals (sum)</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(clusterLane2)}</div>
          <div className="ep-stat-label">Lane 2 @ 50% (sum)</div>
        </div>
      </div>

      <VciExplainerCard compact />

      <h2 className="mb-3 font-heading text-lg font-bold">Counties in this cluster</h2>
      <p className="mb-4 text-xs text-[var(--ep-navy-muted)]">
        Open the full county dashboard for field metrics, registration goals, and command tools.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {counties.map((c) => (
          <div key={c.slug} className="ep-card flex flex-col text-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-heading text-lg font-bold">{c.county}</h3>
                <p className="text-xs text-[var(--ep-navy-muted)]">{c.strategicRole}</p>
              </div>
              <div className="text-right">
                <span className={tierClass(c.tier)}>Tier {c.tier}</span>
                <div className="text-xs text-[var(--ep-navy-muted)]">VCI #{c.vciRank}</div>
              </div>
            </div>

            <dl className="mt-4 space-y-1.5 text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-[var(--ep-navy-muted)]">Victory Contribution Index</dt>
                <dd className="font-semibold tabular-nums">{formatVotes(c.vci)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[var(--ep-navy-muted)]">Primary mission</dt>
                <dd className="text-right font-medium">{c.primaryMission}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[var(--ep-navy-muted)]">Registration goal</dt>
                <dd className="font-semibold tabular-nums">{formatVotes(c.registrationGoal)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[var(--ep-navy-muted)]">Coverage</dt>
                <dd>
                  {c.coverageCompleted}/{c.coveragePlanned} ({c.coveragePct}%)
                </dd>
              </div>
            </dl>

            <p className="mt-3 flex-1 text-xs font-medium text-[var(--ep-navy)]">{c.recommendedAction}</p>

            <Link
              href={countyDashboardHref(c.slug)}
              className={cn(
                "mt-4 inline-block rounded-md border border-[var(--ep-navy)] bg-[var(--ep-navy)] px-3 py-2 text-center text-xs font-semibold text-white transition hover:bg-[var(--ep-navy-muted)]",
              )}
            >
              {countyDashboardLabel(c.slug)} →
            </Link>
          </div>
        ))}
      </div>

      {counties.length < cluster.counties.length ? (
        <p className="mt-6 text-xs text-[var(--ep-navy-muted)]">
          Some cluster county names did not match playbook rows — re-run{" "}
          <code>npm run election-plan:build</code>.
        </p>
      ) : null}
    </section>
  );
}

export { countiesInCluster };
