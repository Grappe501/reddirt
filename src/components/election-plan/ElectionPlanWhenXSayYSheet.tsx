"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { ElectionPlanPracticeCountdown } from "@/components/election-plan/ElectionPlanPracticeCountdown";
import {
  DAY5_APA_STATEWIDE_BROADCAST_FRAME,
  DAY5_INTERNAL_INTEL_HANDOFF,
  DAY5_WHEN_X_SAY_Y_CLAIMS_GATE,
} from "@/lib/election-plan/debate-prep-day5-anticipate-copy";
import type { Day5WhenXSayYRow } from "@/lib/election-plan/load-day5-capitalize-surface";
import {
  epDebatePrepDayBlockHref,
  epDebatePrepDayHref,
  EP_FORUM_TRANSCRIPT_LAB_HREF,
} from "@/lib/election-plan/debate-prep-links";
import { DAY4_ID, DAY5_ID } from "@/lib/election-plan/debatePrepDayDrillDown";

const STORAGE_KEY = "kelly-day5-when-x-say-y-v1";

type CompletionMap = Record<number, string>;

function loadCompletion(): CompletionMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CompletionMap) : {};
  } catch {
    return {};
  }
}

function saveCompletion(map: CompletionMap) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

function formatTs(iso: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso.slice(0, 10);
  }
}

export function ElectionPlanWhenXSayYSheet({
  pairs,
  hasDay4Minimum,
  day4NotecardCount,
  compact = false,
}: {
  pairs: Day5WhenXSayYRow[];
  hasDay4Minimum: boolean;
  day4NotecardCount: number;
  compact?: boolean;
}) {
  const [completed, setCompleted] = useState<CompletionMap>({});

  useEffect(() => {
    setCompleted(loadCompletion());
  }, []);

  const toggleComplete = useCallback((pairIndex: number) => {
    setCompleted((prev) => {
      const next = { ...prev };
      if (next[pairIndex]) {
        delete next[pairIndex];
      } else {
        next[pairIndex] = new Date().toISOString();
      }
      saveCompletion(next);
      return next;
    });
  }, []);

  const rehearseable = pairs.filter((p) => !p.isPlaceholder && p.kellyLine.trim());
  const doneCount = rehearseable.filter((p) => completed[p.pairIndex]).length;

  function handleCopy() {
    const text = rehearseable
      .map((p) => `When: ${p.triggerLabel}\nKelly: ${p.kellyLine}`)
      .join("\n\n");
    if (text && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(text);
    }
  }

  function handlePrint() {
    window.print();
  }

  if (!hasDay4Minimum) {
    return (
      <section className="ep-card border-2 border-amber-200 bg-amber-50/40 p-5 text-sm">
        <p className="text-xs font-bold uppercase text-amber-900">When-X-say-Y sheet · claims-green only</p>
        <p className="mt-2 text-[var(--ep-navy-muted)]">{DAY5_INTERNAL_INTEL_HANDOFF}</p>
        <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
          Day 4 notecard: {day4NotecardCount} green line(s) — need forum lab artifact + v1 analysis before timed pairs.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={EP_FORUM_TRANSCRIPT_LAB_HREF} className="ep-btn ep-btn-primary ep-btn-block-sm-auto inline-block">
            Open forum lab →
          </Link>
          <Link
            href={epDebatePrepDayHref(DAY4_ID)}
            className="inline-block rounded-full border border-[var(--ep-navy)] px-4 py-2 text-xs font-bold text-[var(--ep-navy)]"
          >
            Day 4 pathway →
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="ep-card border-2 border-emerald-300/60 p-5 text-sm print:border-0 print:shadow-none">
      <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
        <div>
          <p className="text-xs font-bold uppercase text-emerald-900">When-X-say-Y sheet · eight timed pairs</p>
          <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
            {day4NotecardCount} Day 4 green line(s) imported · {doneCount} of {rehearseable.length} timed once
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={rehearseable.length === 0}
            className="rounded-full border border-[var(--ep-navy)] px-4 py-2 text-xs font-bold text-[var(--ep-navy)] disabled:opacity-40"
          >
            Copy sheet
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="rounded-full bg-[var(--ep-navy)] px-4 py-2 text-xs font-bold text-white"
          >
            Print
          </button>
        </div>
      </div>

      {!compact ? (
        <>
          <p className="mt-3 rounded-lg border border-violet-300/60 bg-violet-50/40 px-3 py-2 text-xs text-violet-950">
            {DAY5_APA_STATEWIDE_BROADCAST_FRAME}
          </p>
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2 text-xs text-amber-950">
            {DAY5_WHEN_X_SAY_Y_CLAIMS_GATE[0]}
          </p>
        </>
      ) : null}

      <ol className="mt-4 space-y-4">
        {pairs.map((row) => {
          const isDone = Boolean(completed[row.pairIndex]);
          const canRehearse = !row.isPlaceholder && row.kellyLine.trim().length > 0;

          return (
            <li
              key={row.pairIndex}
              className={`rounded-xl border p-4 ${
                row.isPlaceholder
                  ? "border-dashed border-amber-300 bg-amber-50/30"
                  : isDone
                    ? "border-emerald-300 bg-emerald-50/40"
                    : "border-[var(--ep-border)] bg-white"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-[var(--ep-navy-muted)]">Pair {row.pairIndex}</span>
                {row.isPlaceholder ? (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-900">
                    Needs Day 4 line
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-900">
                    Green · claims cleared
                  </span>
                )}
              </div>

              {canRehearse ? (
                <>
                  <p className="mt-3 text-xs font-bold uppercase text-[var(--ep-navy-muted)]">When (trigger)</p>
                  <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{row.triggerLabel}</p>
                  <p className="mt-3 text-xs font-bold uppercase text-emerald-900">Kelly says</p>
                  <p className="mt-1 text-base font-semibold leading-relaxed text-[var(--ep-navy)]">{row.kellyLine}</p>
                  <p className="mt-2 text-[10px] text-[var(--ep-navy-muted)]">
                    {row.sourceLabel} · {formatTs(row.timestamp)} · {row.timedSeconds}s target
                  </p>

                  <div className="mt-4 print:hidden">
                    <ElectionPlanPracticeCountdown
                      seconds={row.timedSeconds}
                      label={`Timed rep · ${row.timedSeconds}s`}
                      onComplete={() => toggleComplete(row.pairIndex)}
                    />
                  </div>

                  <label className="mt-3 flex cursor-pointer items-center gap-2 print:hidden">
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => toggleComplete(row.pairIndex)}
                    />
                    <span className="text-xs font-bold text-[var(--ep-navy)]">Signed off · timed once</span>
                  </label>
                </>
              ) : (
                <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">
                  Import another claims-green line from{" "}
                  <Link href={epDebatePrepDayBlockHref(DAY4_ID, "b4-lab")} className="font-bold underline">
                    Day 4 forum lab block
                  </Link>{" "}
                  before rehearsing this slot.
                </p>
              )}
            </li>
          );
        })}
      </ol>

      <p className="mt-4 text-xs text-[var(--ep-navy-muted)] print:hidden">
        Success check: eight pairs rehearsed once at 45–60s · all Kelly lines claims-green · no new stats under the timer.
      </p>
    </section>
  );
}
