"use client";

import Link from "next/link";

import type { LanesOverview } from "@/lib/election-plan/types";
import { formatPct, formatVotes } from "@/lib/election-plan/electionPlanData";
import { cn } from "@/lib/utils";

type Props = {
  overview: LanesOverview;
  standalone?: boolean;
};

const LANE_COLORS: Record<string, string> = {
  lane1: "bg-[var(--ep-navy)]",
  lane2: "bg-[var(--ep-accent)]",
  lane3: "bg-emerald-600",
  lane4: "bg-amber-600",
};

export function LanesOverviewPanel({ overview, standalone }: Props) {
  const expected = overview.scenarios.find((s) => s.label === "Expected") ?? overview.scenarios[1];
  const inRange =
    overview.expectedProjection >= overview.pluralityRange.low &&
    overview.expectedProjection <= overview.pluralityRange.high;

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">Vote projection · four lanes</h1>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
            Expected scenario · where {formatVotes(overview.expectedProjection)} votes come from
          </p>
        </div>
        {standalone ? (
          <Link
            href="/election-plan?tab=warRoom"
            className="rounded-md border border-[var(--ep-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--ep-navy)] hover:bg-[var(--ep-cream)]"
          >
            ← Executive War Room
          </Link>
        ) : null}
      </div>

      <blockquote className="mb-8 border-l-4 border-[var(--ep-gold)] pl-4 text-sm italic leading-relaxed text-[var(--ep-navy-muted)]">
        {overview.explanation}
      </blockquote>

      <div className="mb-8 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(overview.expectedProjection)}</div>
          <div className="ep-stat-label">Current projection (Expected)</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">
            {formatVotes(overview.pluralityRange.low)}–{formatVotes(overview.pluralityRange.high)}
          </div>
          <div className="ep-stat-label">Plurality working range</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{inRange ? "In range" : "Outside"}</div>
          <div className="ep-stat-label">Expected vs plurality</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">
            {(overview.achievementRates.lane2 * 100).toFixed(0)}% · {(overview.achievementRates.lane3 * 100).toFixed(0)}% ·{" "}
            {(overview.achievementRates.lane4 * 100).toFixed(0)}%
          </div>
          <div className="ep-stat-label">Lane 2 · 3 · 4 achievement rates</div>
        </div>
      </div>

      <h2 className="mb-3 font-heading text-lg font-bold">Four lanes — expected contributions</h2>
      <p className="mb-4 text-xs text-[var(--ep-navy-muted)]">
        Lane 1 is the baseline floor. Lanes 2–4 add reactivation, registration, and conversion at the rates shown in the
        scenario engine.
      </p>

      <div className="mb-4 flex h-4 overflow-hidden rounded-full bg-[var(--ep-cream)]">
        {overview.lanes.map((lane) => (
          <div
            key={lane.id}
            className={cn(LANE_COLORS[lane.id] ?? "bg-slate-400")}
            style={{ width: `${lane.shareOfProjection * 100}%` }}
            title={`${lane.name}: ${formatVotes(lane.expectedContribution)}`}
          />
        ))}
      </div>

      <div className="mb-10 grid gap-4 lg:grid-cols-2">
        {overview.lanes.map((lane) => (
          <div key={lane.id} className="ep-card ep-lane-card">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-heading text-lg font-bold">{lane.name}</h3>
              <span className={cn("inline-block h-3 w-3 rounded-full", LANE_COLORS[lane.id])} aria-hidden />
            </div>
            <div className="mt-2 font-heading text-3xl font-bold text-[var(--ep-navy)]">
              {formatVotes(lane.expectedContribution)}
            </div>
            <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
              {formatPct(lane.shareOfProjection)} of expected projection
            </p>
            <dl className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--ep-navy-muted)]">Working goal</dt>
                <dd className="font-semibold tabular-nums">{formatVotes(lane.workingGoal)}</dd>
              </div>
              {lane.pool ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--ep-navy-muted)]">Available pool</dt>
                  <dd className="font-semibold tabular-nums">{formatVotes(lane.pool)}</dd>
                </div>
              ) : null}
              {lane.stretch ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--ep-navy-muted)]">Stretch @ 75%</dt>
                  <dd className="font-semibold tabular-nums">{formatVotes(lane.stretch)}</dd>
                </div>
              ) : null}
            </dl>
            <p className="mt-3 text-sm text-[var(--ep-navy-muted)]">{lane.note}</p>
            {lane.id !== "lane1" ? (
              <div className="ep-progress mt-3">
                <div
                  className="ep-progress-bar"
                  style={{
                    width: `${Math.min(100, lane.workingGoal > 0 ? (lane.expectedContribution / lane.workingGoal) * 100 : 0)}%`,
                  }}
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <h2 className="mb-3 font-heading text-lg font-bold">Scenario engine</h2>
      <div className="mb-10 grid gap-3 sm:grid-cols-3">
        {overview.scenarios.map((s) => (
          <div
            key={s.label}
            className={cn("ep-card", s.label === "Expected" && "ring-2 ring-[var(--ep-gold)]")}
          >
            <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">{s.label}</div>
            <div className="mt-1 font-heading text-2xl font-bold">{formatVotes(s.projectedVotes)}</div>
            <dl className="mt-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <dt className="text-[var(--ep-navy-muted)]">Retention</dt>
                <dd className="tabular-nums">{formatVotes(s.lanes.retention)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--ep-navy-muted)]">Reactivation</dt>
                <dd className="tabular-nums">{formatVotes(s.lanes.reactivation)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--ep-navy-muted)]">Registration</dt>
                <dd className="tabular-nums">{formatVotes(s.lanes.registration)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--ep-navy-muted)]">Conversion</dt>
                <dd className="tabular-nums">{formatVotes(s.lanes.conversion)}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>

      {overview.topCounties.length > 0 ? (
        <>
          <h2 className="mb-3 font-heading text-lg font-bold">Top counties · expected lane capture</h2>
          <div className="mb-10 ep-card overflow-x-auto">
            <table className="w-full min-w-[40rem] text-sm">
              <thead>
                <tr className="border-b border-[var(--ep-border)] text-left text-xs uppercase tracking-wide text-[var(--ep-navy-muted)]">
                  <th className="pb-3 pr-4">County</th>
                  <th className="pb-3 pr-4 text-right">Expected total</th>
                  <th className="pb-3 pr-4 text-right">Lane 2</th>
                  <th className="pb-3 pr-4 text-right">Lane 3</th>
                  <th className="pb-3 text-right">Lane 4</th>
                </tr>
              </thead>
              <tbody>
                {overview.topCounties.map((c) => (
                  <tr key={c.county} className="border-b border-[var(--ep-border)] last:border-0">
                    <td className="py-2.5 pr-4 font-medium">{c.county}</td>
                    <td className="py-2.5 pr-4 text-right font-semibold tabular-nums">
                      {formatVotes(c.expectedContribution)}
                    </td>
                    <td className="py-2.5 pr-4 text-right tabular-nums text-[var(--ep-navy-muted)]">
                      {formatVotes(c.lane2)}
                    </td>
                    <td className="py-2.5 pr-4 text-right tabular-nums text-[var(--ep-navy-muted)]">
                      {formatVotes(c.lane3)}
                    </td>
                    <td className="py-2.5 text-right tabular-nums text-[var(--ep-navy-muted)]">
                      {formatVotes(c.lane4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}

      {overview.clusterContribution.length > 0 ? (
        <>
          <h2 className="mb-3 font-heading text-lg font-bold">Cluster share of expected projection</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {overview.clusterContribution.map((c) => (
              <div key={c.name} className="ep-card text-sm">
                <h3 className="font-heading font-bold">{c.name}</h3>
                <p className="mt-2 font-semibold tabular-nums">
                  VCI {formatVotes(c.vci)} · {(c.shareOfExpected * 100).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {expected ? (
        <p className="mt-8 text-xs text-[var(--ep-navy-muted)]">
          Expected rates: Lane 2 {(expected.rates.lane2 * 100).toFixed(0)}% · Lane 3{" "}
          {(expected.rates.lane3 * 100).toFixed(0)}% · Lane 4 {(expected.rates.lane4 * 100).toFixed(0)}% of working
          goals
        </p>
      ) : null}
    </section>
  );
}
