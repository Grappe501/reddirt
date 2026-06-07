"use client";

import Link from "next/link";
import { useState } from "react";
import {
  KELLY_PREP_WEEK_DAYS,
  KELLY_PREP_WEEK_HUB_HREF,
  KELLY_PREP_WEEK_PRIMER,
  kellyPrepWeekDayHref,
  totalKellyPrepWeekReadMinutes,
  type KellyPrepWeekDayId,
} from "@/lib/intelligence/v4/kellyPrepWeekPath";

const dayTab =
  "rounded-lg border px-3 py-2 text-left text-xs font-semibold transition";
const dayTabActive = "border-indigo-600 bg-indigo-600 text-white";
const dayTabIdle = "border-kelly-text/15 bg-white text-kelly-navy hover:border-indigo-400/50";

export function KellyPrepWeekPathPanel({
  compact,
  initialDay = 1,
}: {
  compact?: boolean;
  initialDay?: number;
}) {
  const [activeDay, setActiveDay] = useState(initialDay);
  const plan = KELLY_PREP_WEEK_DAYS.find((d) => d.day === activeDay)!;

  return (
    <section className="mb-8 rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/80 to-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-900">
            Phase 15 P2 · Kelly prep week
          </p>
          <h2 className="mt-1 font-heading text-2xl font-bold text-kelly-navy">
            Seven-day orchestrated prep path
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-kelly-muted">
            {KELLY_PREP_WEEK_PRIMER.headline}. ~{totalKellyPrepWeekReadMinutes()} minutes total — work one day at
            a time; staff handles claims verification overnight.
          </p>
        </div>
        {!compact ? (
          <Link
            href={KELLY_PREP_WEEK_HUB_HREF}
            className="rounded-lg bg-indigo-700 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-indigo-800"
          >
            Full week hub
          </Link>
        ) : null}
      </div>

      <article className="mt-4 rounded-lg border border-indigo-100 bg-white/80 p-4 text-xs text-kelly-text">
        <p className="font-bold text-indigo-950">{KELLY_PREP_WEEK_PRIMER.dailyHabit}</p>
        <p className="mt-2 text-kelly-muted">{KELLY_PREP_WEEK_PRIMER.hammerPattern}</p>
        <p className="mt-2 text-emerald-900">
          <span className="font-bold">Win:</span> {KELLY_PREP_WEEK_PRIMER.winCondition}
        </p>
      </article>

      <div className="mt-4 grid gap-2 sm:grid-cols-7">
        {KELLY_PREP_WEEK_DAYS.map((d) => (
          <button
            key={d.dayId}
            type="button"
            onClick={() => setActiveDay(d.day)}
            className={`${dayTab} ${activeDay === d.day ? dayTabActive : dayTabIdle}`}
          >
            {d.weekdayLabel}
            <span className="mt-0.5 block font-normal opacity-90">Day {d.day}</span>
          </button>
        ))}
      </div>

      <article className="mt-4 rounded-xl border border-kelly-navy/15 bg-white p-5">
        <p className="text-[10px] font-bold uppercase text-kelly-subtle">
          {plan.weekdayLabel} · Day {plan.day}
        </p>
        <h3 className="mt-1 font-heading text-xl font-bold text-kelly-navy">{plan.title}</h3>
        <p className="text-sm text-indigo-900">{plan.subtitle}</p>
        <p className="mt-3 text-sm text-kelly-text">
          <span className="font-bold">Goal:</span> {plan.goalForKelly}
        </p>

        <h4 className="mt-5 text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Kelly reads (in order)</h4>
        <ol className="mt-2 space-y-3">
          {plan.kellyReads.map((item, idx) => (
            <li key={item.id} className="rounded-lg border border-kelly-text/10 p-3 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-indigo-900">
                  {idx + 1}. {item.label}
                </span>
                <span className="rounded bg-indigo-100 px-2 py-0.5 font-mono text-[10px] text-indigo-900">
                  ~{item.minutes} min
                </span>
              </div>
              <p className="mt-2 text-kelly-muted">
                <span className="font-semibold text-kelly-text">Extract:</span> {item.whatToExtract}
              </p>
              <Link href={item.href} className="mt-2 inline-block font-bold text-kelly-navy underline">
                Open →
              </Link>
            </li>
          ))}
        </ol>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={kellyPrepWeekDayHref(plan.dayId as KellyPrepWeekDayId)}
            className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-[10px] font-bold text-indigo-950"
          >
            Full day page
          </Link>
          <Link
            href="/admin/intelligence/phase-15-p2-upgrade"
            className="rounded-full border border-indigo-200 px-3 py-1 text-[10px] font-bold text-indigo-800"
          >
            P2 upgrade pass
          </Link>
        </div>
      </article>
    </section>
  );
}
