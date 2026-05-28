"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { filterNarrativeUsageAnalytics } from "@/lib/opposition/kimHammerClientFilters";
import type {
  KimHammerNarrativeUsageAnalyticsIndex,
  KimHammerNarrativeUsageAnalyticsRecord,
  KimHammerNarrativeUsageSignal,
} from "@/lib/opposition/types/kimHammerNarrativeUsageAnalytics";
import { KIM_HAMMER_NARRATIVE_USAGE_SIGNALS } from "@/lib/opposition/types/kimHammerNarrativeUsageAnalytics";

type KimHammerNarrativeUsageAnalyticsDashboardProps = {
  index: KimHammerNarrativeUsageAnalyticsIndex;
};

const signalBadge: Record<KimHammerNarrativeUsageSignal, string> = {
  USAGE_HEALTHY: "bg-emerald-100 text-emerald-900",
  USAGE_RISING: "bg-sky-100 text-sky-900",
  USAGE_OVEREXPOSED: "bg-orange-100 text-orange-900",
  USAGE_STALE: "bg-amber-100 text-amber-900",
  USAGE_UNDERUTILIZED: "bg-violet-100 text-violet-900",
  USAGE_FRAGILE: "bg-rose-100 text-rose-900",
  USAGE_RECOVERING: "bg-teal-100 text-teal-900",
};

function NarrativeUsageCard({ record }: { record: KimHammerNarrativeUsageAnalyticsRecord }) {
  return (
    <article className="rounded-lg border border-kelly-text/10 bg-white p-3 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-semibold text-kelly-navy">{record.narrativeTitle}</h3>
        <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${signalBadge[record.usageSignal]}`}>
          {record.usageSignal.replaceAll("_", " ")}
        </span>
        <span className="text-[10px] text-kelly-subtle">
          {record.readinessBand} · {(record.readinessScore * 100).toFixed(0)}% ready
        </span>
      </div>

      <p className="mt-2 rounded border border-kelly-text/10 bg-kelly-page/50 p-2 font-medium text-kelly-navy">
        {record.signal}
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-[10px] text-kelly-muted">
        <div className="rounded border border-kelly-text/10 p-2">
          <p className="font-semibold text-kelly-navy">Deployments</p>
          <p>
            {record.deploymentCount} event(s) · trend {record.deploymentTrend}
            {record.deploymentHistory.lastScope ? ` · last ${record.deploymentHistory.lastScope}` : ""}
          </p>
        </div>
        <div className="rounded border border-kelly-text/10 p-2">
          <p className="font-semibold text-kelly-navy">Freshness</p>
          <p>
            {(record.freshnessScore * 100).toFixed(0)}% · {record.freshness.staleCitationCount} stale ·{" "}
            {record.freshness.needsAttentionCitationCount} need review
          </p>
        </div>
        <div className="rounded border border-kelly-text/10 p-2">
          <p className="font-semibold text-kelly-navy">Geographic heat</p>
          <p>{record.countyHeatSummary || "—"}</p>
        </div>
        <div className="rounded border border-kelly-text/10 p-2">
          <p className="font-semibold text-kelly-navy">AI pressure</p>
          <p>{record.aiSuggestionPressure} pending suggestion(s)</p>
        </div>
      </div>

      {record.exportLineageRefs.length > 0 ? (
        <ul className="mt-2 list-inside list-disc text-[10px] text-kelly-muted">
          {record.exportLineageRefs.map((ref) => (
            <li key={ref}>{ref}</li>
          ))}
        </ul>
      ) : null}

      {record.blockers.length > 0 ? (
        <ul className="mt-2 list-inside list-disc text-[10px] text-rose-800">
          {record.blockers.slice(0, 3).map((blocker) => (
            <li key={blocker}>{blocker}</li>
          ))}
        </ul>
      ) : null}

      <p className="mt-2">
        <Link href="/admin/intelligence/kim-hammer/narrative-state" className="font-semibold text-kelly-navy underline">
          NSI-1 state
        </Link>
        {" · "}
        <Link
          href="/admin/intelligence/kim-hammer/geographic-narrative-intelligence"
          className="font-semibold text-kelly-navy underline"
        >
          NSI-2 geographic
        </Link>
        {" · "}
        <Link href="/admin/intelligence/kim-hammer/export-control-center" className="font-semibold text-kelly-navy underline">
          Export lineage
        </Link>
      </p>
    </article>
  );
}

export function KimHammerNarrativeUsageAnalyticsDashboard({
  index,
}: KimHammerNarrativeUsageAnalyticsDashboardProps) {
  const [signalFilter, setSignalFilter] = useState<KimHammerNarrativeUsageSignal | "ALL">("ALL");
  const [narrativeQuery, setNarrativeQuery] = useState("");

  const filtered = useMemo(
    () => filterNarrativeUsageAnalytics(index, { signal: signalFilter, narrativeQuery }),
    [index, signalFilter, narrativeQuery],
  );

  return (
    <div>
      <section className="mb-4 rounded-xl border border-indigo-200/50 bg-indigo-50/40 p-4 text-xs text-indigo-950">
        <p className="font-bold uppercase tracking-wider">NSI-3 · Usage analytics & export fatigue (read-only)</p>
        <p className="mt-1">
          Deployment frequency, citation freshness, geographic saturation, and cross-system synchronization readiness.
          Composes export history, NSI-1/NSI-2 layers, and governed citation health — no mutations on this surface.
        </p>
      </section>

      <section className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Narratives tracked</p>
          <p className="mt-1 text-xl font-bold">{index.narrativeCount}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Export events</p>
          <p className="mt-1 text-xl font-bold">{index.totalDeployments}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Fragile / stale</p>
          <p className="mt-1 text-xl font-bold">
            {index.signalCounts.USAGE_FRAGILE + index.signalCounts.USAGE_STALE + index.signalCounts.USAGE_OVEREXPOSED}
          </p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Underutilized</p>
          <p className="mt-1 text-xl font-bold">{index.signalCounts.USAGE_UNDERUTILIZED}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Sync sources mapped</p>
          <p className="mt-1 text-xl font-bold">{index.synchronizationReadinessSummary.mappedSourceCount}</p>
        </div>
      </section>

      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Synchronization readiness</h2>
        <p className="mt-1 text-kelly-muted">{index.synchronizationReadinessSummary.readinessLabel}</p>
        <p className="mt-1 text-[10px] text-kelly-subtle">
          {index.synchronizationReadinessSummary.integratedSourceCount} LIVE ·{" "}
          {index.synchronizationReadinessSummary.plannedSourceCount} PLANNED ·{" "}
          {index.synchronizationReadinessSummary.mappedSourceCount} total mapped
        </p>
      </section>

      {index.topFatigueWarnings.length > 0 ? (
        <section className="mb-4 rounded-xl border border-rose-200/60 bg-rose-50/50 p-4 text-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-rose-950">Top fatigue warnings</h2>
          <ul className="mt-2 space-y-2">
            {index.topFatigueWarnings.map((row) => (
              <li key={row.narrativeId} className="rounded border border-rose-900/10 bg-white p-2">
                <strong>{row.narrativeTitle}:</strong> {row.signal}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {index.underutilizedAlerts.length > 0 ? (
        <section className="mb-4 rounded-xl border border-violet-200/60 bg-violet-50/50 p-4 text-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-violet-950">Underutilized narratives</h2>
          <ul className="mt-2 space-y-2">
            {index.underutilizedAlerts.map((row) => (
              <li key={row.narrativeId} className="rounded border border-violet-900/10 bg-white p-2">
                <strong>{row.narrativeTitle}:</strong> {row.signal}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {index.deploymentTimeline.length > 0 ? (
        <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Deployment trend timeline</h2>
          <ul className="mt-2 space-y-1 text-kelly-muted">
            {index.deploymentTimeline.map((row) => (
              <li key={row.exportId} className="flex flex-wrap justify-between gap-2 border-t border-kelly-text/10 py-1">
                <span>{row.exportedAt.slice(0, 10)} · {row.exportId}</span>
                <span>{row.scope} · {row.narrativeIds.join(", ") || "claim lineage"}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Filters</h2>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Usage signal</span>
            <select
              value={signalFilter}
              onChange={(event) =>
                setSignalFilter(event.target.value as KimHammerNarrativeUsageSignal | "ALL")
              }
              className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
            >
              <option value="ALL">All</option>
              {KIM_HAMMER_NARRATIVE_USAGE_SIGNALS.map((signal) => (
                <option key={signal} value={signal}>
                  {signal.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Narrative</span>
            <input
              type="search"
              value={narrativeQuery}
              onChange={(event) => setNarrativeQuery(event.target.value)}
              placeholder="county burden, debate…"
              className="mt-1 w-full rounded border border-kelly-text/20 bg-kelly-page px-2 py-2 text-xs"
            />
          </label>
        </div>
      </section>

      <section className="space-y-4">
        {filtered.map((record) => (
          <NarrativeUsageCard key={record.narrativeId} record={record} />
        ))}
      </section>
    </div>
  );
}
