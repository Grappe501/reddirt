"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import type { ElectionPlanCounty } from "@/lib/election-plan/types";
import { formatVotes } from "@/lib/election-plan/electionPlanData";
import { cn } from "@/lib/utils";

type Props = {
  counties: ElectionPlanCounty[];
  statewideGoal: number;
  standalone?: boolean;
};

function tierClass(tier: string) {
  if (tier === "A") return "ep-tier-a";
  if (tier === "B") return "ep-tier-b";
  if (tier === "C") return "ep-tier-c";
  return "ep-tier-d";
}

export function RegistrationGoalsPanel({ counties, statewideGoal, standalone }: Props) {
  const [sort, setSort] = useState<"goal-desc" | "goal-asc" | "county">("goal-desc");
  const [tierFilter, setTierFilter] = useState<string>("all");

  const countyTotal = useMemo(
    () => counties.reduce((sum, c) => sum + c.registrationGoal, 0),
    [counties],
  );

  const rows = useMemo(() => {
    let list = tierFilter === "all" ? counties : counties.filter((c) => c.tier === tierFilter);
    list = [...list];
    if (sort === "goal-desc") {
      list.sort((a, b) => b.registrationGoal - a.registrationGoal || a.county.localeCompare(b.county));
    } else if (sort === "goal-asc") {
      list.sort((a, b) => a.registrationGoal - b.registrationGoal || a.county.localeCompare(b.county));
    } else {
      list.sort((a, b) => a.county.localeCompare(b.county));
    }
    return list;
  }, [counties, sort, tierFilter]);

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">County registration goals</h1>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
            Lane 3 · {formatVotes(statewideGoal)} statewide · allocated across all 75 counties
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

      <div className="mb-8 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(statewideGoal)}</div>
          <div className="ep-stat-label">Statewide goal</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{counties.length}</div>
          <div className="ep-stat-label">Counties</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(countyTotal)}</div>
          <div className="ep-stat-label">Allocated total</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(Math.round(statewideGoal / 20))}</div>
          <div className="ep-stat-label">Weekly pace (20 wks)</div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">
          Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="rounded border border-[var(--ep-border)] bg-white px-2 py-1 text-xs normal-case text-[var(--ep-navy)]"
          >
            <option value="goal-desc">Goal high → low</option>
            <option value="goal-asc">Goal low → high</option>
            <option value="county">County A → Z</option>
          </select>
        </label>
        <div className="flex flex-wrap gap-1">
          {["all", "A", "B", "C", "D"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTierFilter(t)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition",
                tierFilter === t
                  ? "bg-[var(--ep-navy)] text-white"
                  : "bg-[var(--ep-cream)] text-[var(--ep-navy-muted)] hover:bg-[var(--ep-gold-soft)]",
              )}
            >
              {t === "all" ? "All 75" : `Tier ${t}`}
            </button>
          ))}
        </div>
      </div>

      <div className="ep-card overflow-x-auto">
        <table className="w-full min-w-[36rem] text-sm">
          <thead>
            <tr className="border-b border-[var(--ep-border)] text-left text-xs uppercase tracking-wide text-[var(--ep-navy-muted)]">
              <th className="pb-3 pr-4">#</th>
              <th className="pb-3 pr-4">County</th>
              <th className="pb-3 pr-4">Tier</th>
              <th className="pb-3 pr-4 text-right">VCI rank</th>
              <th className="pb-3 pr-4 text-right">Registration goal</th>
              <th className="pb-3 pr-4 text-right">Share</th>
              <th className="pb-3">Primary mission</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c, i) => {
              const share = statewideGoal > 0 ? (c.registrationGoal / statewideGoal) * 100 : 0;
              return (
                <tr key={c.slug} className="border-b border-[var(--ep-border)] last:border-0">
                  <td className="py-2.5 pr-4 text-[var(--ep-navy-muted)]">{i + 1}</td>
                  <td className="py-2.5 pr-4 font-medium text-[var(--ep-navy)]">{c.county}</td>
                  <td className="py-2.5 pr-4">
                    <span className={tierClass(c.tier)}>Tier {c.tier}</span>
                  </td>
                  <td className="py-2.5 pr-4 text-right tabular-nums">{c.vciRank}</td>
                  <td className="py-2.5 pr-4 text-right font-semibold tabular-nums">
                    {formatVotes(c.registrationGoal)}
                  </td>
                  <td className="py-2.5 pr-4 text-right tabular-nums text-[var(--ep-navy-muted)]">
                    {share.toFixed(1)}%
                  </td>
                  <td className="py-2.5 text-xs text-[var(--ep-navy-muted)]">{c.primaryMission}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-[var(--ep-navy)] font-semibold">
              <td className="pt-3 pr-4" colSpan={4}>
                Total ({rows.length} {tierFilter === "all" ? "counties" : `tier ${tierFilter}`})
              </td>
              <td className="pt-3 pr-4 text-right tabular-nums">
                {formatVotes(rows.reduce((s, c) => s + c.registrationGoal, 0))}
              </td>
              <td className="pt-3 pr-4 text-right tabular-nums text-[var(--ep-navy-muted)]">
                {statewideGoal > 0
                  ? `${((rows.reduce((s, c) => s + c.registrationGoal, 0) / statewideGoal) * 100).toFixed(1)}%`
                  : "—"}
              </td>
              <td className="pt-3" />
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="mt-4 text-xs text-[var(--ep-navy-muted)]">
        County goals sum to the {formatVotes(statewideGoal)} Lane 3 registration target · ~2,500/week over 20 weeks
      </p>
    </section>
  );
}
