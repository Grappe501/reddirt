"use client";

import Link from "next/link";
import type { TacticLinkageViewModel } from "@/lib/victory-os/tactic-linkage/types";
import { vos } from "../victory-os-ui/victory-os-tokens";

const STATUS_STYLE: Record<string, string> = {
  linked: "bg-emerald-100 text-emerald-800",
  unlinked: "bg-amber-100 text-amber-900",
  orphan: "bg-zinc-100 text-zinc-700",
  needs_mission: "bg-sky-100 text-sky-900",
};

export function TacticLinkagePanel({ vm }: { vm: TacticLinkageViewModel }) {
  const { registry, byCounty } = vm;
  const { summary } = registry;

  return (
    <div className="space-y-6">
      <section className={vos.hero}>
        <div className={vos.heroGlow} />
        <div className="relative">
          <p className={vos.eyebrowOnDark}>Sprint 5 · Calendar as byproduct</p>
          <h2 className="mt-2 font-heading text-2xl font-bold md:text-3xl">Tactic linkage</h2>
          <p className="mt-3 max-w-3xl font-body text-sm text-white/85">{vm.intelligenceNarrative}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className={vos.metricOnDark}><span className="text-white/55">Linked: </span><strong>{summary.linkedCount}</strong></span>
            <span className={vos.metricOnDark}><span className="text-white/55">Unlinked: </span><strong>{summary.unlinkedCount}</strong></span>
            <span className={vos.metricOnDark}><span className="text-white/55">Needs mission: </span><strong>{summary.needsMissionCount}</strong></span>
            <span className={vos.metricOnDark}><span className="text-white/55">Orphan: </span><strong>{summary.orphanCount}</strong></span>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={vos.glass}>
          <h3 className="font-heading text-sm font-bold text-kelly-navy">By county</h3>
          <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto">
            {byCounty.slice(0, 15).map((r) => (
              <li key={r.countySlug} className="flex justify-between font-body text-xs">
                <Link href={`/admin/counties/${r.countySlug}`} className="font-semibold text-kelly-navy underline">{r.county}</Link>
                <span className="text-kelly-muted">{r.linked} linked · {r.unlinked} open</span>
              </li>
            ))}
            {byCounty.length === 0 ? <li className="text-kelly-muted">No county-tagged tactics this week.</li> : null}
          </ul>
        </div>

        <div className={vos.glass}>
          <h3 className="font-heading text-sm font-bold text-kelly-navy">This week&apos;s calendar rows</h3>
          <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto">
            {registry.tactics.slice(0, 20).map((t) => (
              <li key={t.tacticId} className="rounded-xl border border-kelly-text/8 bg-white/60 p-2.5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-body text-xs font-semibold text-kelly-navy">{t.title}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${STATUS_STYLE[t.linkageStatus]}`}>{t.linkageStatus.replace(/_/g, " ")}</span>
                </div>
                <p className="mt-1 font-body text-[10px] text-kelly-muted">{t.startYmd} · {t.county ?? "No county"} · {t.matchReason}</p>
              </li>
            ))}
            {registry.tactics.length === 0 ? <li className="text-kelly-muted">No calendar items in this week window.</li> : null}
          </ul>
        </div>
      </div>
    </div>
  );
}
