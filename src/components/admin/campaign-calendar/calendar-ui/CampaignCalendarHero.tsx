"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import type { CalendarSurfaceStats } from "./compute-calendar-surface-stats";
import { CALENDAR_QUICK_LINKS, cal } from "./calendar-design-tokens";

export function CampaignCalendarHero({
  stats,
  seedLabel,
}: {
  stats: CalendarSurfaceStats;
  seedLabel?: string;
}) {
  const electionFormatted = format(parseISO(stats.electionDayYmd), "MMMM d, yyyy");

  return (
    <section className={cal.hero} aria-labelledby="campaign-calendar-heading">
      <div className={cal.heroGlowGold} />
      <div className={cal.heroGlowSky} />
      <div className="relative">
        <p className={cal.eyebrowDark}>Kelly SOS · Statewide command center</p>
        <h1 id="campaign-calendar-heading" className="mt-3 font-heading text-3xl font-bold leading-[1.1] tracking-tight md:text-4xl lg:text-[2.75rem]">
          Campaign Calendar
        </h1>
        <p className="mt-4 max-w-2xl font-body text-sm leading-relaxed text-white/85 md:text-base">
          The operational heart of the campaign — every event is travel, approval, county touch, and path-to-victory
          intelligence. From today through Election Day.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 backdrop-blur-md">
            <p className="font-body text-[10px] font-bold uppercase tracking-wider text-white/60">Election Day</p>
            <p className="font-heading text-2xl font-bold tabular-nums">{stats.daysToElection}</p>
            <p className="font-body text-xs text-white/75">days · {electionFormatted}</p>
          </div>
          <div className="rounded-2xl border border-kelly-gold/30 bg-kelly-gold/10 px-5 py-3 backdrop-blur-md">
            <p className="font-body text-[10px] font-bold uppercase tracking-wider text-kelly-gold-soft">Loaded</p>
            <p className="font-heading text-2xl font-bold tabular-nums">{stats.totalEvents}</p>
            <p className="font-body text-xs text-white/75">events statewide</p>
          </div>
          {stats.needsApproval > 0 ? (
            <div className="rounded-2xl border border-amber-400/40 bg-amber-500/15 px-5 py-3 backdrop-blur-md">
              <p className="font-body text-[10px] font-bold uppercase tracking-wider text-amber-200">Needs CM</p>
              <p className="font-heading text-2xl font-bold tabular-nums text-amber-50">{stats.needsApproval}</p>
              <p className="font-body text-xs text-amber-100/90">awaiting approval</p>
            </div>
          ) : null}
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {CALENDAR_QUICK_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={cal.btnSecondary}>
              {link.label}
            </Link>
          ))}
        </div>

        {seedLabel ? <p className="mt-4 font-body text-[11px] text-white/50">{seedLabel}</p> : null}
      </div>
    </section>
  );
}
