"use client";

import Link from "next/link";
import { useState } from "react";
import {
  COUNTY_CLERK_AUDIENCE_PRIMER,
  COUNTY_CLERK_SEVEN_DAY_PATH,
  HAMMER_VS_KELLY_CLERK_MATRIX,
  totalCountyClerkReadMinutes,
} from "@/lib/intelligence/v4/countyClerkSevenDayPrepPath";
import { isCountyClerkPrimaryAudience } from "@/lib/intelligence/v4/debateAudienceMode";
import { KellyMirrorHiddenPathway } from "@/components/admin/intelligence/kelly-mirror/KellyMirrorHiddenPathway";

const dayTab =
  "rounded-lg border px-3 py-2 text-left text-xs font-semibold transition";
const dayTabActive = "border-kelly-navy bg-kelly-navy text-white";
const dayTabIdle = "border-kelly-text/15 bg-white text-kelly-navy hover:border-kelly-navy/40";

export function V7CountyClerkPrepPath({ compact }: { compact?: boolean }) {
  const [activeDay, setActiveDay] = useState(1);
  const plan = COUNTY_CLERK_SEVEN_DAY_PATH.find((d) => d.day === activeDay)!;
  const clerkPrimary = isCountyClerkPrimaryAudience();

  return (
    <section className="mb-8 rounded-xl border-2 border-violet-200 bg-gradient-to-br from-violet-50/80 to-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-900">
            {clerkPrimary ? "Primary audience · county clerks week" : "County clerks · 7-day prep path"}
          </p>
          <h2 className="mt-1 font-heading text-2xl font-bold text-kelly-navy">
            Kelly&apos;s reading path — {COUNTY_CLERK_SEVEN_DAY_PATH.length} days
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-kelly-muted">
            {COUNTY_CLERK_AUDIENCE_PRIMER.headline}. ~{totalCountyClerkReadMinutes()} minutes total reading
            time across the week — work one day at a time; staff handles retrieval and claims. County budgets and{" "}
            <KellyMirrorHiddenPathway>quorum</KellyMirrorHiddenPathway> court pressure still land on clerks when mandates
            arrive unfunded.
          </p>
        </div>
        {!compact ? (
          <Link
            href="/admin/intelligence/county-clerk-week"
            className="rounded-lg bg-kelly-navy px-4 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-kelly-navy/90"
          >
            Full week view
          </Link>
        ) : null}
      </div>

      <article className="mt-4 rounded-lg border border-violet-100 bg-white/80 p-4 text-xs text-kelly-text">
        <p className="font-bold text-violet-950">{COUNTY_CLERK_AUDIENCE_PRIMER.whoIsInTheRoom}</p>
        <p className="mt-2 text-kelly-muted">{COUNTY_CLERK_AUDIENCE_PRIMER.whatTheyReward}</p>
        <p className="mt-2 text-rose-900/90">
          <span className="font-bold">Hammer will offer:</span> {COUNTY_CLERK_AUDIENCE_PRIMER.whatHammerWillOffer}
        </p>
        <p className="mt-2 text-emerald-900">
          <span className="font-bold">Kelly win:</span> {COUNTY_CLERK_AUDIENCE_PRIMER.kellyWinCondition}
        </p>
      </article>

      <div className="mt-4 grid gap-2 sm:grid-cols-7">
        {COUNTY_CLERK_SEVEN_DAY_PATH.map((d) => (
          <button
            key={d.day}
            type="button"
            onClick={() => setActiveDay(d.day)}
            className={`${dayTab} ${activeDay === d.day ? dayTabActive : dayTabIdle}`}
          >
            Day {d.day}
            <span className="mt-0.5 block font-normal opacity-90">{d.title.split("—")[0]?.trim()}</span>
          </button>
        ))}
      </div>

      <article className="mt-4 rounded-xl border border-kelly-navy/15 bg-white p-5">
        <p className="text-[10px] font-bold uppercase text-kelly-subtle">Day {plan.day}</p>
        <h3 className="mt-1 font-heading text-xl font-bold text-kelly-navy">{plan.title}</h3>
        <p className="text-sm text-violet-900">{plan.subtitle}</p>
        <p className="mt-3 text-sm text-kelly-text">
          <span className="font-bold">Goal:</span> {plan.goalForKelly}
        </p>
        <p className="mt-2 text-sm text-rose-900/90">
          <span className="font-bold">Trap we want:</span> {plan.hammerTrapWeWant}
        </p>

        <h4 className="mt-5 text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Kelly reads (in order)</h4>
        <ol className="mt-2 space-y-3">
          {plan.kellyReads.map((item, idx) => (
            <li key={item.id} className="rounded-lg border border-kelly-text/10 p-3 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-violet-900">
                  {idx + 1}. {item.label}
                </span>
                <span className="rounded bg-kelly-navy/10 px-2 py-0.5 font-mono text-[10px] text-kelly-navy">
                  ~{item.minutes} min
                </span>
              </div>
              <p className="mt-2 text-kelly-muted">
                <span className="font-semibold text-kelly-text">Extract:</span> {item.whatToExtract}
              </p>
              <p className="mt-1 text-kelly-muted">
                <span className="font-semibold text-kelly-text">For clerks:</span> {item.positioningForClerks}
              </p>
              <p className="mt-1 text-emerald-900">
                <span className="font-semibold">Kelly edge:</span> {item.kellySuperiorityAngle}
              </p>
              <Link href={item.href} className="mt-2 inline-block font-bold text-kelly-navy underline">
                Open →
              </Link>
            </li>
          ))}
        </ol>

        {plan.staffOnly?.length ? (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-xs">
            <p className="font-bold uppercase text-amber-900">Staff only</p>
            <ul className="mt-2 list-inside list-disc text-amber-950">
              {plan.staffOnly.map((s) => (
                <li key={s.slice(0, 40)}>{s}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-4 grid gap-3 lg:grid-cols-2 text-xs">
          <div className="rounded-lg border border-kelly-text/10 p-3">
            <p className="font-bold uppercase text-kelly-navy">Rehearse out loud</p>
            <ul className="mt-2 list-inside list-disc text-kelly-muted">
              {plan.rehearsalOutLoud.map((r) => (
                <li key={r.slice(0, 48)}>{r}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-kelly-text/10 p-3">
            <p className="font-bold uppercase text-kelly-navy">After the day</p>
            <p className="mt-2 text-kelly-muted">{plan.afterTheDay}</p>
            <p className="mt-3 font-bold text-emerald-900">Success: {plan.successCheck}</p>
          </div>
        </div>
      </article>

      {!compact ? (
        <details className="mt-6 rounded-lg border border-kelly-navy/15 bg-white p-4">
          <summary className="cursor-pointer text-sm font-bold text-kelly-navy">
            Hammer vs Kelly — clerk positioning matrix
          </summary>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead>
                <tr className="border-b border-kelly-text/10 text-[10px] uppercase text-kelly-subtle">
                  <th className="py-2 pr-3">Topic</th>
                  <th className="py-2 pr-3">Hammer</th>
                  <th className="py-2 pr-3">Kelly</th>
                  <th className="py-2">Clerk question</th>
                </tr>
              </thead>
              <tbody>
                {HAMMER_VS_KELLY_CLERK_MATRIX.map((row) => (
                  <tr key={row.topic} className="border-b border-kelly-text/5 align-top">
                    <td className="py-2 pr-3 font-bold text-kelly-navy">{row.topic}</td>
                    <td className="py-2 pr-3 text-rose-950">{row.hammerPosition}</td>
                    <td className="py-2 pr-3 text-emerald-950">{row.kellyPosition}</td>
                    <td className="py-2 text-kelly-muted italic">{row.clerkQuestionToAsk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      ) : null}
    </section>
  );
}
