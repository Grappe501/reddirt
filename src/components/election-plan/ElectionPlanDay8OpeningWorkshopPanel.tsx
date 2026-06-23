"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { ElectionPlanPracticeCountdown } from "@/components/election-plan/ElectionPlanPracticeCountdown";
import type { Day8OpeningBeat } from "@/lib/election-plan/load-day8-crash-course-surface";

const STORAGE_KEY = "kelly-day8-opening-workshop-v1";

type WorkshopLog = {
  repCount: number;
  weakestDomain: string | null;
};

function loadLog(): WorkshopLog {
  if (typeof window === "undefined") return { repCount: 0, weakestDomain: null };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WorkshopLog) : { repCount: 0, weakestDomain: null };
  } catch {
    return { repCount: 0, weakestDomain: null };
  }
}

function saveLog(log: WorkshopLog) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
  } catch {
    /* ignore */
  }
}

export function ElectionPlanDay8OpeningWorkshopPanel({
  openingBeats,
  openingScript,
  rehearsalHref,
}: {
  openingBeats: readonly Day8OpeningBeat[];
  openingScript: string;
  rehearsalHref: string;
}) {
  const [log, setLog] = useState<WorkshopLog>({ repCount: 0, weakestDomain: null });

  useEffect(() => {
    setLog(loadLog());
  }, []);

  const recordRep = useCallback(() => {
    setLog((prev) => {
      const next = { ...prev, repCount: Math.min(3, prev.repCount + 1) };
      saveLog(next);
      return next;
    });
  }, []);

  const setWeakest = useCallback((domain: string) => {
    setLog((prev) => {
      const next = { ...prev, weakestDomain: domain };
      saveLog(next);
      return next;
    });
  }, []);

  return (
    <section className="mb-6 space-y-4">
      <article className="ep-card border-emerald-200 bg-emerald-50/30 p-5 text-sm">
        <p className="text-xs font-bold uppercase text-emerald-900">Opening workshop · 90s · beats A / B / C</p>
        <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
          Reps logged: {log.repCount} of 3 minimum
          {log.weakestDomain ? ` · fix beat: ${log.weakestDomain}` : ""}
        </p>

        <ol className="mt-4 space-y-2">
          {openingBeats.map((beat) => (
            <li key={beat.beat} className="rounded-lg border border-[var(--ep-border)] bg-white p-3">
              <p className="text-[10px] font-bold uppercase text-emerald-800">{beat.label}</p>
              <p className="mt-1 font-semibold text-[var(--ep-navy)]">{beat.objective}</p>
              <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{beat.templateHint}</p>
              {beat.href ? (
                <Link href={beat.href} className="mt-2 inline-block text-[10px] font-bold text-emerald-800 underline">
                  {beat.deepStudyLabel ?? "Deep study →"}
                </Link>
              ) : null}
            </li>
          ))}
        </ol>

        <p className="mt-4 leading-relaxed text-[var(--ep-navy)]">{openingScript}</p>

        <div className="mt-4">
          <ElectionPlanPracticeCountdown
            seconds={90}
            label="Opening timer · 90s hard stop · 3 reps"
            onComplete={recordRep}
          />
        </div>

        <p className="mt-4 text-[10px] font-bold uppercase text-[var(--ep-navy-muted)]">Weakest domain this rep?</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {["elections", "business services", "Capitol"].map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setWeakest(label)}
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                log.weakestDomain === label
                  ? "bg-emerald-800 text-white"
                  : "border border-[var(--ep-border)] bg-white text-[var(--ep-navy-muted)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <Link href={rehearsalHref} className="mt-4 inline-block text-xs font-bold text-emerald-900 underline">
          Module 1 · opening rehearsal →
        </Link>
      </article>
    </section>
  );
}
