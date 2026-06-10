"use client";

import Link from "next/link";
import type { DailyBriefViewModel } from "@/lib/victory-os/daily-decisions/types";
import { VictoryOsHero, VictoryOsMetric } from "./victory-os-ui/VictoryOsShell";
import { vos } from "./victory-os-ui/victory-os-tokens";

const OPS_BADGE: Record<string, string> = {
  red: "bg-red-100 text-red-800 border-red-200",
  yellow: "bg-amber-100 text-amber-900 border-amber-200",
  green: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

export function DailyBriefDashboard({ vm }: { vm: DailyBriefViewModel }) {
  const { brief } = vm;

  return (
    <div className="space-y-6">
      <VictoryOsHero
        eyebrow={vm.isSeason5 ? "Season 5 · Daily cadence" : "Daily preview · Pre-Season 5"}
        title={brief.headline}
        summary={vm.intelligenceNarrative}
        footer={
          <>
            <VictoryOsMetric label="Day" value={vm.dayKey} />
            <VictoryOsMetric label="Week" value={vm.weekKey} />
            <VictoryOsMetric label="Election" value={`${vm.electionDaysRemaining}d`} />
            {!vm.isSeason5 ? (
              <span className={vos.draftBadgeOnDark}>Weekly brief primary until Oct 21</span>
            ) : null}
          </>
        }
      />

      <section className="space-y-4">
        <h3 className="font-heading text-xl font-bold text-kelly-navy">Kelly deployments today</h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {brief.kellyToday.map((d) => (
            <article key={d.id} className={vos.card}>
              <div className="flex items-start justify-between gap-2">
                <p className="font-body text-[10px] font-bold uppercase tracking-wider text-kelly-copper">#{d.rank}</p>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold capitalize ${OPS_BADGE[d.opsStatus] ?? ""}`}>{d.opsStatus}</span>
              </div>
              <h4 className="mt-2 font-heading text-lg font-bold text-kelly-navy">
                <Link href={`/admin/counties/${d.countySlug}`} className="hover:underline">{d.displayName}</Link>
              </h4>
              <p className="mt-2 font-body text-sm text-kelly-text/90">{d.recommendation}</p>
              <p className="mt-2 font-body text-[10px] text-kelly-muted capitalize">Tier {d.kellyTier} · {d.status}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={vos.glass}>
        <h3 className="font-heading text-lg font-bold text-kelly-navy">County turnout gaps</h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {brief.countyGaps.map((g) => (
            <li key={g.countySlug} className="rounded-xl border border-kelly-text/8 bg-white/80 p-3">
              <Link href={`/admin/counties/${g.countySlug}`} className="font-body text-sm font-bold text-kelly-navy underline">{g.county}</Link>
              <p className="mt-1 font-body text-xs text-kelly-muted">Gap score {g.gapScore} · {g.opsStatus} ops</p>
            </li>
          ))}
        </ul>
      </section>

      <p className="font-body text-xs text-kelly-muted">
        <Link href={`/admin/mission-brief?week=${vm.weekKey}`} className="underline">← Monday brief for full Top 10</Link>
        {" · "}
        <Link href="/admin/victory-board" className="underline">Victory Board</Link>
      </p>
    </div>
  );
}
