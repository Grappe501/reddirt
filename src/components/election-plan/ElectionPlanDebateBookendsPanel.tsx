"use client";

import Link from "next/link";

import { useCallback, useEffect, useState } from "react";

import { ElectionPlanPracticeCountdown } from "@/components/election-plan/ElectionPlanPracticeCountdown";
import {
  DAY6_APA_SIM_FRAME,
  DAY6_CLOSING_BEATS,
  DAY6_OPENING_BEATS,
  DAY6_SIM_AUDIENCE_LABEL,
} from "@/lib/election-plan/debate-prep-day6-simulation-copy";
import type { Day6SimBookend } from "@/lib/election-plan/debate-prep-day6-simulation-copy";

export function ElectionPlanDebateBookendsPanel({
  opening,
  closing,
  variant = "both",
}: {
  opening: Day6SimBookend;
  closing: Day6SimBookend;
  variant?: "both" | "opening" | "closing";
}) {
  const showOpening = variant === "both" || variant === "opening";
  const showClosing = variant === "both" || variant === "closing";

  return (
    <section className="mb-6 space-y-4">
      <p className="rounded-lg border border-violet-300/60 bg-violet-50/40 px-3 py-2 text-xs text-violet-950">
        {DAY6_APA_SIM_FRAME}
      </p>
      <p className="text-xs text-[var(--ep-navy-muted)]">{DAY6_SIM_AUDIENCE_LABEL}</p>

      {showOpening ? (
        <article className="ep-card border-violet-200 bg-violet-50/30 p-5 text-sm">
          <p className="text-xs font-bold uppercase text-violet-900">Opening · {opening.durationSeconds}s</p>
          <p className="mt-1 text-[10px] text-[var(--ep-navy-muted)]">{opening.sourceLabel}</p>
          <ul className="mt-4 space-y-2">
            {DAY6_OPENING_BEATS.map((beat) => (
              <li key={beat.beat} className="rounded-lg border border-[var(--ep-border)] bg-white p-3">
                <p className="text-[10px] font-bold uppercase text-violet-800">Beat {beat.beat}</p>
                <p className="mt-1 font-semibold text-[var(--ep-navy)]">{beat.objective}</p>
                <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{beat.source}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 leading-relaxed text-[var(--ep-navy)]">{opening.script}</p>
          <div className="mt-4">
            <ElectionPlanPracticeCountdown seconds={opening.durationSeconds} label="Opening timer" />
          </div>
          <Link href={opening.rehearsalHref} className="mt-3 inline-block text-xs font-bold text-violet-900 underline">
            Day 1 opening rehearsal →
          </Link>
        </article>
      ) : null}

      {showClosing ? (
        <article className="ep-card border-violet-200 bg-violet-50/30 p-5 text-sm">
          <p className="text-xs font-bold uppercase text-violet-900">Closing · {closing.durationSeconds}s</p>
          <p className="mt-1 text-[10px] text-[var(--ep-navy-muted)]">{closing.sourceLabel}</p>
          <ul className="mt-4 space-y-2">
            {DAY6_CLOSING_BEATS.map((beat) => (
              <li key={beat.beat} className="rounded-lg border border-[var(--ep-border)] bg-white p-3">
                <p className="text-[10px] font-bold uppercase text-violet-800">Beat {beat.beat}</p>
                <p className="mt-1 font-semibold text-[var(--ep-navy)]">{beat.objective}</p>
                <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{beat.source}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 leading-relaxed text-[var(--ep-navy)]">{closing.script}</p>
          <div className="mt-4">
            <ElectionPlanPracticeCountdown seconds={closing.durationSeconds} label="Closing timer · hold silence 2s after" />
          </div>
          <Link href={closing.rehearsalHref} className="mt-3 inline-block text-xs font-bold text-violet-900 underline">
            Open + close sim rehearsal →
          </Link>
        </article>
      ) : null}
    </section>
  );
}
