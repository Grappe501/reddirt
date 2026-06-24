"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { leaderWorkbenchHref } from "@/lib/volunteers/build-leader-workbench-v2";
import { getOperatorsDashboardLeaders } from "@/lib/volunteers/leader-roster";
import { resolveLeaderResidence } from "@/lib/volunteers/resolve-leader-residence";
import { getVolunteerLeaderBySlug } from "@/lib/volunteers/leader-roster";

export function OperatorsLeaderJumpSelect({ className }: { className?: string }) {
  const router = useRouter();
  const leaders = useMemo(() => getOperatorsDashboardLeaders(), []);

  return (
    <div className={className}>
      <label className="block">
        <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">
          Jump to leader dashboard ({leaders.length})
        </span>
        <select
          className="w-full rounded-lg border border-[var(--ep-navy)]/15 bg-white px-3 py-2 text-sm text-[var(--ep-navy)]"
          defaultValue=""
          onChange={(e) => {
            const slug = e.target.value;
            if (slug) router.push(leaderWorkbenchHref(slug));
          }}
        >
          <option value="">Select a volunteer…</option>
          {leaders.map((leader) => {
            const full = getVolunteerLeaderBySlug(leader.slug);
            const geo = full ? resolveLeaderResidence(full) : null;
            const place =
              geo && (geo.cityLabel || geo.countyName)
                ? ` · ${[geo.cityLabel, geo.countyName ? `${geo.countyName} Co.` : null].filter(Boolean).join(", ")}`
                : geo?.source === "missing"
                  ? " · location TBD"
                  : "";
            return (
              <option key={leader.slug} value={leader.slug}>
                {leader.displayName} ({leader.initials}){place}
              </option>
            );
          })}
        </select>
      </label>
      <p className="mt-1.5 text-[10px] text-[var(--ep-navy-muted)]">
        Choosing a name opens their workbench. Or browse{" "}
        <Link href="#leader-dashboards" className="font-semibold text-[var(--ep-blue)] hover:underline">
          the full list below
        </Link>
        .
      </p>
    </div>
  );
}
