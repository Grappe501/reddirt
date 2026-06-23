"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { ElectionPlanPracticeCountdown } from "@/components/election-plan/ElectionPlanPracticeCountdown";
import { DAY8_CLOSING_BEATS } from "@/lib/election-plan/debate-prep-day8-crash-copy";

const STORAGE_KEY = "kelly-day8-closing-workshop-v1";

type ClosingLog = { repCount: number };

function loadLog(): ClosingLog {
  if (typeof window === "undefined") return { repCount: 0 };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ClosingLog) : { repCount: 0 };
  } catch {
    return { repCount: 0 };
  }
}

function saveLog(log: ClosingLog) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
  } catch {
    /* ignore */
  }
}

export function ElectionPlanDay8ClosingWorkshopPanel({
  closingScript,
  rehearsalHref,
}: {
  closingScript: string;
  rehearsalHref: string;
}) {
  const [log, setLog] = useState<ClosingLog>({ repCount: 0 });

  useEffect(() => {
    setLog(loadLog());
  }, []);

  const recordRep = useCallback(() => {
    setLog((prev) => {
      const next = { repCount: Math.min(3, prev.repCount + 1) };
      saveLog(next);
      return next;
    });
  }, []);

  return (
    <section className="mb-6 space-y-4">
      <article className="ep-card border-emerald-200 bg-emerald-50/30 p-5 text-sm">
        <p className="text-xs font-bold uppercase text-emerald-900">Closing workshop · 60s · service desk invoke</p>
        <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">Reps logged: {log.repCount} of 3 · hold silence 2s after last word</p>

        <ul className="mt-4 space-y-2">
          {DAY8_CLOSING_BEATS.map((beat) => (
            <li key={beat.beat} className="rounded-lg border border-[var(--ep-border)] bg-white p-3">
              <p className="text-[10px] font-bold uppercase text-emerald-800">Beat {beat.beat}</p>
              <p className="mt-1 font-semibold text-[var(--ep-navy)]">{beat.objective}</p>
              <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{beat.source}</p>
              {beat.href ? (
                <Link href={beat.href} className="mt-2 inline-block text-[10px] font-bold text-emerald-800 underline">
                  {beat.source} →
                </Link>
              ) : null}
            </li>
          ))}
        </ul>

        <p className="mt-4 leading-relaxed text-[var(--ep-navy)]">{closingScript}</p>

        <div className="mt-4">
          <ElectionPlanPracticeCountdown
            seconds={60}
            label="Closing timer · 60s · peak-end pause after"
            onComplete={recordRep}
          />
        </div>

        <Link href={rehearsalHref} className="mt-4 inline-block text-xs font-bold text-emerald-900 underline">
          Module 7 · closing rehearsal →
        </Link>
      </article>
    </section>
  );
}
