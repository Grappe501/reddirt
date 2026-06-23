"use client";

import Link from "next/link";

import { ElectionPlanPracticeCountdown } from "@/components/election-plan/ElectionPlanPracticeCountdown";
import {
  DAY7_CLOSING_BEATS,
  DAY7_OPENING_BEATS,
  DAY7_PEAK_END_FRAME,
  type Day7PolishBookendClient,
} from "@/lib/election-plan/debate-prep-day7-polish-copy";

export function ElectionPlanDay7BookendsPolishPanel({
  opening,
  closing,
  variant = "both",
}: {
  opening: Day7PolishBookendClient;
  closing: Day7PolishBookendClient;
  variant?: "both" | "opening" | "closing";
}) {
  const showOpening = variant === "both" || variant === "opening";
  const showClosing = variant === "both" || variant === "closing";

  return (
    <section className="mb-6 space-y-4">
      <p className="rounded-lg border border-rose-300/60 bg-rose-50/40 px-3 py-2 text-xs text-rose-950">
        {DAY7_PEAK_END_FRAME}
      </p>

      {showOpening ? (
        <article className="ep-card border-rose-200 bg-rose-50/30 p-5 text-sm">
          <p className="text-xs font-bold uppercase text-rose-900">Opening polish · {opening.durationSeconds}s</p>
          <p className="mt-1 text-[10px] text-[var(--ep-navy-muted)]">{opening.sourceLabel}</p>
          <ul className="mt-4 space-y-2">
            {DAY7_OPENING_BEATS.map((beat) => (
              <li key={beat.beat} className="rounded-lg border border-[var(--ep-border)] bg-white p-3">
                <p className="text-[10px] font-bold uppercase text-rose-800">Beat {beat.beat}</p>
                <p className="mt-1 font-semibold text-[var(--ep-navy)]">{beat.objective}</p>
                <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{beat.source}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 leading-relaxed text-[var(--ep-navy)]">{opening.script}</p>
          <div className="mt-4">
            <ElectionPlanPracticeCountdown seconds={opening.durationSeconds} label="Opening timer · 3 reps" />
          </div>
          <Link href={opening.rehearsalHref} className="mt-3 inline-block text-xs font-bold text-rose-900 underline">
            Day 1 opening rehearsal →
          </Link>
        </article>
      ) : null}

      {showClosing ? (
        <article className="ep-card border-rose-200 bg-rose-50/30 p-5 text-sm">
          <p className="text-xs font-bold uppercase text-rose-900">Closing polish · {closing.durationSeconds}s</p>
          <p className="mt-1 text-[10px] text-[var(--ep-navy-muted)]">{closing.sourceLabel}</p>
          <ul className="mt-4 space-y-2">
            {DAY7_CLOSING_BEATS.map((beat) => (
              <li key={beat.beat} className="rounded-lg border border-[var(--ep-border)] bg-white p-3">
                <p className="text-[10px] font-bold uppercase text-rose-800">Beat {beat.beat}</p>
                <p className="mt-1 font-semibold text-[var(--ep-navy)]">{beat.objective}</p>
                <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{beat.source}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 leading-relaxed text-[var(--ep-navy)]">{closing.script}</p>
          <div className="mt-4">
            <ElectionPlanPracticeCountdown seconds={closing.durationSeconds} label="Closing timer · hold silence 2s after" />
          </div>
          <Link href={closing.rehearsalHref} className="mt-3 inline-block text-xs font-bold text-rose-900 underline">
            Closing clerk invoke drill →
          </Link>
        </article>
      ) : null}
    </section>
  );
}
