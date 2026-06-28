"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { getOperatorsDashboardLeaders, getVolunteerLeaderBySlug } from "@/lib/volunteers/leader-roster";
import { leaderWorkbenchHref } from "@/lib/volunteers/build-leader-workbench-v2";
import { resolveLeaderResidence } from "@/lib/volunteers/resolve-leader-residence";

const TIER_LABELS: Record<string, string> = {
  volunteer: "Volunteer",
  city: "City",
  county: "County",
  cluster: "Cluster",
  assistant_campaign_manager: "Assistant CM",
  campaign_manager: "Campaign manager",
};

export function ElectionPlanOperatorsLeaderDirectory({ id = "leader-dashboards" }: { id?: string }) {
  const leaders = useMemo(() => getOperatorsDashboardLeaders(), []);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leaders;
    return leaders.filter(
      (l) =>
        l.displayName.toLowerCase().includes(q) ||
        l.initials.toLowerCase().includes(q) ||
        l.slug.replace(/-/g, " ").includes(q) ||
        (l.workbenchTier && TIER_LABELS[l.workbenchTier]?.toLowerCase().includes(q)),
    );
  }, [leaders, query]);

  return (
    <section id={id} className="rounded-xl border border-[var(--ep-gold)]/40 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">Leader dashboards</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-[var(--ep-navy)]">
            {leaders.length} operator workbenches
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-[var(--ep-navy-muted)]">
            Click any name to open their personal v4.0 workbench — work pages, lanes, My Five, field log, and geography drill-downs.
          </p>
        </div>
        <label className="block min-w-[12rem] flex-1 sm:max-w-xs">
          <span className="sr-only">Filter leaders</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or initials…"
            className="w-full rounded-lg border border-[var(--ep-navy)]/15 bg-[var(--ep-cream)]/50 px-3 py-2 text-sm text-[var(--ep-navy)]"
            autoComplete="off"
          />
        </label>
      </div>

      <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">
        Showing {filtered.length} of {leaders.length}
        {query ? ` matching “${query.trim()}”` : ""}
        {" · "}
        <Link href="/election-plan/operators/leaders/sign-in" className="font-semibold text-[var(--ep-blue)] hover:underline">
          Sign in with initials
        </Link>
      </p>

      <ul className="mt-4 grid max-h-[28rem] gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((leader) => {
            const full = getVolunteerLeaderBySlug(leader.slug);
            const geo = full ? resolveLeaderResidence(full) : null;
            const placeLabel =
              geo && (geo.cityLabel || geo.countyName)
                ? [geo.cityLabel, geo.countyName ? `${geo.countyName} Co.` : null].filter(Boolean).join(" · ")
                : geo?.source === "missing"
                  ? "Location TBD"
                  : null;
            return (
          <li key={leader.slug}>
            <Link
              href={leaderWorkbenchHref(leader.slug)}
              className="flex h-full items-center justify-between gap-2 rounded-lg border border-[var(--ep-navy)]/10 bg-[var(--ep-cream)]/30 px-3 py-2.5 transition hover:border-[var(--ep-gold)] hover:bg-white hover:shadow-sm"
            >
              <span className="min-w-0">
                <span className="block truncate font-semibold text-[var(--ep-navy)]">{leader.displayName}</span>
                {placeLabel ? (
                  <span className="mt-0.5 block truncate text-[10px] text-[var(--ep-navy-muted)]">{placeLabel}</span>
                ) : leader.workbenchTier ? (
                  <span className="mt-0.5 block truncate text-[10px] uppercase tracking-wide text-[var(--ep-navy-muted)]">
                    {TIER_LABELS[leader.workbenchTier] ?? leader.workbenchTier}
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 rounded-md bg-white px-2 py-1 font-mono text-xs font-bold tracking-wide text-[var(--ep-blue)] shadow-sm">
                {leader.initials}
              </span>
            </Link>
          </li>
            );
        })}
      </ul>

      {filtered.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--ep-navy-muted)]">No leaders match that filter.</p>
      ) : null}
    </section>
  );
}
