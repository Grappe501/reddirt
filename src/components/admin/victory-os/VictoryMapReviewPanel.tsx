"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CountyVictoryContext, VictoryMapDimensionCounts } from "@/lib/victory-os/types";

type Props = {
  counties: CountyVictoryContext[];
  dimensionCounts: VictoryMapDimensionCounts;
  mapClassificationStatus: string;
  updatedAt: string;
  statewideVoteGap: number;
  workingTargetWithCushion: number;
  currentSeasonLabel: string | null;
  currentSeasonQuestion: string | null;
};

const OPS_BADGE: Record<string, string> = {
  red: "bg-red-100 text-red-800",
  yellow: "bg-amber-100 text-amber-900",
  green: "bg-emerald-100 text-emerald-800",
};

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl border border-kelly-text/10 bg-white/70 p-4 shadow-sm">
      <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-kelly-muted">{label}</p>
      <p className="mt-1 font-heading text-2xl font-bold text-kelly-navy">{value}</p>
      {sub ? <p className="mt-1 font-body text-xs text-kelly-muted">{sub}</p> : null}
    </div>
  );
}

export function VictoryMapReviewPanel({
  counties,
  dimensionCounts,
  mapClassificationStatus,
  updatedAt,
  statewideVoteGap,
  workingTargetWithCushion,
  currentSeasonLabel,
  currentSeasonQuestion,
}: Props) {
  const [search, setSearch] = useState("");
  const [importance, setImportance] = useState<string>("all");
  const [ops, setOps] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return counties.filter((c) => {
      if (importance !== "all" && c.electoralImportance !== importance) return false;
      if (ops !== "all" && c.opsStatus !== ops) return false;
      if (!q) return true;
      return (
        c.county.toLowerCase().includes(q) ||
        c.displayName.toLowerCase().includes(q) ||
        c.regionSlug.toLowerCase().includes(q)
      );
    });
  }, [counties, search, importance, ops]);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-amber-500/30 bg-amber-50/60 p-5">
        <p className="font-body text-sm font-semibold text-amber-900">Sprint 0 — Victory Map review</p>
        <p className="mt-2 font-body text-sm leading-relaxed text-amber-950/85">
          All {dimensionCounts.total} counties are seeded with three dimensions. Classification status:{" "}
          <strong>{mapClassificationStatus}</strong>. CM must lock the map before Sprint 1 Decision Engine generates Top
          10 decisions. This page shows real map data — not generated weekly decisions.
        </p>
        {currentSeasonLabel ? (
          <p className="mt-2 font-body text-xs text-amber-900/80">
            Current season: {currentSeasonLabel}
            {currentSeasonQuestion ? ` — ${currentSeasonQuestion}` : ""}
          </p>
        ) : null}
        <p className="mt-2 font-body text-[11px] text-kelly-muted">Map updated {new Date(updatedAt).toLocaleString()}</p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Vote gap (planning)" value={statewideVoteGap.toLocaleString()} sub="Statewide scenario" />
        <StatCard
          label="Cushion target"
          value={workingTargetWithCushion.toLocaleString()}
          sub="50% + 1 + cushion"
        />
        <StatCard
          label="Critical counties"
          value={dimensionCounts.electoral.critical}
          sub={`${dimensionCounts.readiness.weak} weak readiness statewide`}
        />
        <StatCard
          label="Awaiting CM lock"
          value={dimensionCounts.needsLeadershipReview}
          sub={`${dimensionCounts.leadershipOverrides} leadership exemplars`}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-kelly-text/10 bg-white/60 p-4">
          <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-muted">Electoral importance</p>
          <ul className="mt-2 space-y-1 font-body text-sm text-kelly-text">
            <li>Critical: {dimensionCounts.electoral.critical}</li>
            <li>Important: {dimensionCounts.electoral.important}</li>
            <li>Helpful: {dimensionCounts.electoral.helpful}</li>
            <li>Maintenance: {dimensionCounts.electoral.maintenance}</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-kelly-text/10 bg-white/60 p-4">
          <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-muted">Opportunity</p>
          <ul className="mt-2 space-y-1 font-body text-sm text-kelly-text">
            <li>High: {dimensionCounts.opportunity.high}</li>
            <li>Medium: {dimensionCounts.opportunity.medium}</li>
            <li>Low: {dimensionCounts.opportunity.low}</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-kelly-text/10 bg-white/60 p-4">
          <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-muted">Organizational readiness</p>
          <ul className="mt-2 space-y-1 font-body text-sm text-kelly-text">
            <li>Strong: {dimensionCounts.readiness.strong}</li>
            <li>Moderate: {dimensionCounts.readiness.moderate}</li>
            <li>Weak: {dimensionCounts.readiness.weak}</li>
          </ul>
        </div>
      </div>

      <section>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1">
            <span className="font-body text-[10px] font-bold uppercase tracking-wider text-kelly-muted">Search</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="County or region…"
              className="rounded-lg border border-kelly-text/15 bg-white px-3 py-2 font-body text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-body text-[10px] font-bold uppercase tracking-wider text-kelly-muted">Importance</span>
            <select
              value={importance}
              onChange={(e) => setImportance(e.target.value)}
              className="rounded-lg border border-kelly-text/15 bg-white px-3 py-2 font-body text-sm"
            >
              <option value="all">All</option>
              <option value="critical">Critical</option>
              <option value="important">Important</option>
              <option value="helpful">Helpful</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-body text-[10px] font-bold uppercase tracking-wider text-kelly-muted">Ops status</span>
            <select
              value={ops}
              onChange={(e) => setOps(e.target.value)}
              className="rounded-lg border border-kelly-text/15 bg-white px-3 py-2 font-body text-sm"
            >
              <option value="all">All</option>
              <option value="red">Red</option>
              <option value="yellow">Yellow</option>
              <option value="green">Green</option>
            </select>
          </label>
          <p className="pb-2 font-body text-sm text-kelly-muted">{filtered.length} counties</p>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-kelly-text/10 bg-white/80">
          <table className="min-w-full text-left font-body text-sm">
            <thead className="border-b border-kelly-text/10 bg-kelly-page/50 text-[10px] font-bold uppercase tracking-wider text-kelly-muted">
              <tr>
                <th className="px-3 py-3">County</th>
                <th className="px-3 py-3">Region</th>
                <th className="px-3 py-3">Importance</th>
                <th className="px-3 py-3">Opportunity</th>
                <th className="px-3 py-3">Readiness</th>
                <th className="px-3 py-3">Ops</th>
                <th className="px-3 py-3">Priority</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-kelly-text/5">
              {filtered.map((c) => (
                <tr key={c.countySlug} className="hover:bg-kelly-page/40">
                  <td className="px-3 py-2.5">
                    <Link
                      href={`/admin/counties/${c.countySlug}`}
                      className="font-semibold text-kelly-navy underline-offset-2 hover:underline"
                    >
                      {c.county}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-kelly-muted">{c.regionSlug.replace(/-/g, " ")}</td>
                  <td className="px-3 py-2.5 capitalize">{c.electoralImportance}</td>
                  <td className="px-3 py-2.5 capitalize">{c.opportunityLevel}</td>
                  <td className="px-3 py-2.5 capitalize">{c.organizationalReadiness}</td>
                  <td className="px-3 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${OPS_BADGE[c.opsStatus]}`}>
                      {c.opsStatus}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs">{c.deploymentPriority.deploymentPriority}</td>
                  <td className="px-3 py-2.5 text-xs text-kelly-muted">{c.classificationStatus.replace(/_/g, " ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-kelly-navy/20 bg-kelly-navy/[0.04] p-5">
        <p className="font-body text-sm font-semibold text-kelly-navy">Leadership review checklist</p>
        <ul className="mt-3 list-inside list-disc space-y-1 font-body text-sm text-kelly-text/85">
          <li>Confirm Critical county list (Pulaski, Washington, Benton, Faulkner, Saline, Craighead)</li>
          <li>Validate growth counties (White, Lonoke, Garland, Sebastian) importance + opportunity</li>
          <li>Sign off readiness scores against county workbench KPIs</li>
          <li>Set map classificationStatus to leadership_locked in victory-map-v1.json</li>
          <li>Only then enable Sprint 1 Decision Engine (Top 10 Monday brief)</li>
        </ul>
      </section>
    </div>
  );
}
