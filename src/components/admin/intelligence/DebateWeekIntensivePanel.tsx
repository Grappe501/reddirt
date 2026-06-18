"use client";

import Link from "next/link";
import { useState } from "react";
import {
  DEBATE_DATE,
  DEBATE_WEEK_INTENSIVE_DAYS,
  DEBATE_WEEK_INTENSIVE_HUB_HREF,
  DEBATE_WEEK_INTENSIVE_PRIMER,
  debateWeekIntensiveDayHref,
  FORUM_TRANSCRIPT_LAB_HREF,
  totalIntensiveMinutes,
  type IntensiveDayId,
} from "@/lib/intelligence/v4/debateWeekIntensive2026";
import { DEBATE_INTENSIVE_V2_LABEL, getDayDeepOverlay } from "@/lib/intelligence/v4/debateWeekIntensive2026Deep";
import { DEBATE_INTENSIVE_V3_LABEL, DEBATE_WEEK_LANES_HUB_HREF } from "@/lib/intelligence/v4/debateWeekIntensive2026V3";

const dayTab =
  "rounded-lg border px-2 py-2 text-left text-[11px] font-semibold transition sm:px-3 sm:text-xs";
const dayTabActive = "border-kelly-gold bg-kelly-text text-kelly-gold shadow-md";
const dayTabIdle = "border-kelly-navy/20 bg-white text-kelly-navy hover:border-kelly-gold/60";
const dayTabDebate = "border-rose-500/50 bg-rose-950/5 text-rose-950";

export function DebateWeekIntensivePanel({
  compact,
  initialDay = 1,
  todayDate,
}: {
  compact?: boolean;
  initialDay?: number;
  todayDate?: string;
}) {
  const [activeDay, setActiveDay] = useState(initialDay);
  const plan = DEBATE_WEEK_INTENSIVE_DAYS.find((d) => d.day === activeDay)!;
  const deepOverlay = getDayDeepOverlay(plan.dayId as IntensiveDayId);
  const totalHours = Math.round((totalIntensiveMinutes() / 60) * 10) / 10;
  const todayPlan = todayDate
    ? DEBATE_WEEK_INTENSIVE_DAYS.find((d) => d.calendarDate === todayDate)
    : undefined;

  return (
    <section className="mb-8 overflow-hidden rounded-xl border-2 border-kelly-gold/40 bg-gradient-to-br from-kelly-text via-[#1a2744] to-kelly-text p-5 text-kelly-inverse shadow-lg">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-kelly-gold">
            Command Mode · {DEBATE_INTENSIVE_V2_LABEL} · {DEBATE_INTENSIVE_V3_LABEL}
          </p>
          <h2 className="mt-1 font-heading text-2xl font-bold text-white">{DEBATE_WEEK_INTENSIVE_PRIMER.headline}</h2>
          <p className="mt-2 max-w-3xl text-sm text-kelly-inverse-muted">
            {DEBATE_WEEK_INTENSIVE_PRIMER.whoThisIsFor} ~{totalHours} hours structured study + debate day execution.
            Debate: <span className="font-semibold text-kelly-gold">{DEBATE_DATE}</span> · Eureka Springs.
          </p>
        </div>
        {!compact ? (
          <div className="flex flex-col gap-2">
            <Link
              href={FORUM_TRANSCRIPT_LAB_HREF}
              className="rounded-lg bg-kelly-gold px-4 py-2 text-center text-xs font-bold uppercase tracking-wide text-kelly-text hover:bg-kelly-gold/90"
            >
              Forum transcript lab
            </Link>
            <Link
              href={DEBATE_WEEK_LANES_HUB_HREF}
              className="rounded-lg border border-indigo-300 bg-indigo-500/20 px-4 py-2 text-center text-xs font-bold uppercase tracking-wide text-indigo-100 hover:bg-indigo-500/30"
            >
              Drill-down lanes
            </Link>
            <Link
              href="/admin/intelligence/debate-prep-tutor"
              className="rounded-lg border border-kelly-gold/50 px-4 py-2 text-center text-xs font-bold uppercase tracking-wide text-kelly-gold hover:bg-white/5"
            >
              AI prep tutor
            </Link>
          </div>
        ) : null}
      </div>

      {todayPlan ? (
        <div className="mt-4 rounded-lg border border-kelly-gold/30 bg-kelly-gold/10 px-4 py-3 text-sm">
          <span className="font-bold text-kelly-gold">Today&apos;s focus:</span>{" "}
          <Link href={debateWeekIntensiveDayHref(todayPlan.dayId)} className="font-semibold underline text-white">
            {todayPlan.title}
          </Link>
          {" — "}
          {todayPlan.subtitle}
        </div>
      ) : null}

      <article className="mt-4 space-y-2 rounded-lg border border-white/10 bg-white/5 p-4 text-xs text-kelly-inverse-soft">
        <p>
          <span className="font-bold text-kelly-gold">Command Mode:</span> {DEBATE_WEEK_INTENSIVE_PRIMER.commandModeDefinition}
        </p>
        <p>
          <span className="font-bold text-white">Win condition:</span> {DEBATE_WEEK_INTENSIVE_PRIMER.winCondition}
        </p>
      </article>

      <div className="mt-4 grid gap-2 grid-cols-4 sm:grid-cols-8">
        {DEBATE_WEEK_INTENSIVE_DAYS.map((d) => (
          <button
            key={d.dayId}
            type="button"
            onClick={() => setActiveDay(d.day)}
            className={`${dayTab} ${activeDay === d.day ? dayTabActive : d.day === 8 ? dayTabDebate : dayTabIdle}`}
          >
            <span className="block truncate">{d.weekdayLabel.split(" · ")[0]}</span>
            <span className="mt-0.5 block font-normal opacity-90">D{d.day}</span>
          </button>
        ))}
      </div>

      <article className="mt-4 rounded-xl border border-white/10 bg-kelly-page p-5 text-kelly-text">
        <p className="text-[10px] font-bold uppercase text-kelly-subtle">{plan.weekdayLabel}</p>
        <h3 className="mt-1 font-heading text-xl font-bold text-kelly-navy">{plan.title}</h3>
        <p className="text-sm text-indigo-900">{plan.subtitle}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-kelly-gold/30 bg-kelly-gold/5 p-3 text-xs">
            <p className="font-bold text-kelly-navy">Command focus</p>
            <p className="mt-1 text-kelly-muted">{plan.commandModeFocus}</p>
          </div>
          <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-3 text-xs">
            <p className="font-bold text-indigo-950">Psychology</p>
            <p className="mt-1 text-kelly-muted">{plan.psychologyPrinciple}</p>
          </div>
        </div>

        <p className="mt-4 text-sm">
          <span className="font-bold">Goal:</span> {plan.goalForKelly}
        </p>
        <p className="mt-1 text-xs text-kelly-muted">
          Target: ~{plan.hoursTarget}h · {plan.blocks.reduce((s, b) => s + b.minutes, 0)} min scheduled
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <p className="rounded-lg border border-emerald-300/50 bg-emerald-950/10 px-3 py-2 text-[11px] text-emerald-100">
            <span className="font-bold">Strength:</span> {deepOverlay.kellyStrengthToday}
          </p>
          <p className="rounded-lg border border-rose-300/50 bg-rose-950/10 px-3 py-2 text-[11px] text-rose-100">
            <span className="font-bold">Watch:</span> {deepOverlay.kellyWatchOut}
          </p>
        </div>
        {deepOverlay.forumIntelHook ? (
          <p className="mt-2 text-[11px] text-kelly-gold">{deepOverlay.forumIntelHook}</p>
        ) : null}

        <h4 className="mt-5 text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">
          Study blocks (in order)
        </h4>
        <ol className="mt-2 space-y-3">
          {plan.blocks.map((block, idx) => (
            <li key={block.id} className="rounded-lg border border-kelly-text/10 p-3 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-kelly-navy">
                  {idx + 1}. {block.title}
                  {block.aiEnabled ? (
                    <span className="ml-2 rounded bg-violet-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-violet-900">
                      AI
                    </span>
                  ) : null}
                </span>
                <span className="font-mono text-[10px] text-kelly-subtle">{block.minutes} min</span>
              </div>
              <p className="mt-2 text-kelly-muted">{block.activity}</p>
              <p className="mt-1 text-[11px] italic text-indigo-800/80">
                <span className="font-semibold not-italic">Why:</span> {block.why}
              </p>
              {block.href ? (
                <Link href={block.href} className="mt-2 inline-block font-bold text-kelly-navy underline">
                  Open →
                </Link>
              ) : null}
            </li>
          ))}
        </ol>

        {plan.opponentExamples.length > 0 ? (
          <>
            <h4 className="mt-5 text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">
              Real opponent examples
            </h4>
            <div className="mt-2 space-y-3">
              {plan.opponentExamples.map((ex) => (
                <div key={ex.id} className="rounded-lg border border-rose-200/60 bg-rose-50/40 p-3 text-xs">
                  <p className="font-bold text-rose-950">{ex.opponent} — their move</p>
                  <p className="mt-1 text-kelly-muted">{ex.theirMove}</p>
                  <p className="mt-2 font-bold text-emerald-900">Kelly response</p>
                  <p className="text-kelly-text">{ex.kellyResponse}</p>
                  <p className="mt-2 text-[11px] text-kelly-subtle">{ex.whyItWorks}</p>
                </div>
              ))}
            </div>
          </>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={debateWeekIntensiveDayHref(plan.dayId as IntensiveDayId)}
            className="rounded-full border border-kelly-gold bg-kelly-gold/10 px-3 py-1 text-[10px] font-bold text-kelly-navy"
          >
            Full day page →
          </Link>
          {!compact ? (
            <Link
              href={DEBATE_WEEK_INTENSIVE_HUB_HREF}
              className="rounded-full border border-indigo-200 px-3 py-1 text-[10px] font-bold text-indigo-800"
            >
              Intensive hub
            </Link>
          ) : null}
        </div>
      </article>
    </section>
  );
}
