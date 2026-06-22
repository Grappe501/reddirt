"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { ElectionPlanPracticeCountdown } from "@/components/election-plan/ElectionPlanPracticeCountdown";
import type { Day5TrapLaneSprintCard } from "@/lib/election-plan/load-day5-capitalize-surface";
import { epDebatePrepDayBlockHref } from "@/lib/election-plan/debate-prep-links";
import { DAY5_ID } from "@/lib/election-plan/debatePrepDayDrillDown";

const STORAGE_KEY = "kelly-day5-trap-sprint-v1";

type SprintLog = {
  completedLaneIds: string[];
  weakestLaneId: string | null;
};

function loadLog(): SprintLog {
  if (typeof window === "undefined") return { completedLaneIds: [], weakestLaneId: null };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SprintLog) : { completedLaneIds: [], weakestLaneId: null };
  } catch {
    return { completedLaneIds: [], weakestLaneId: null };
  }
}

function saveLog(log: SprintLog) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
  } catch {
    /* ignore */
  }
}

export function ElectionPlanTrapLaneSprintPanel({ lanes }: { lanes: Day5TrapLaneSprintCard[] }) {
  const [log, setLog] = useState<SprintLog>({ completedLaneIds: [], weakestLaneId: null });

  useEffect(() => {
    setLog(loadLog());
  }, []);

  const markDone = useCallback((laneId: string) => {
    setLog((prev) => {
      const completedLaneIds = prev.completedLaneIds.includes(laneId)
        ? prev.completedLaneIds
        : [...prev.completedLaneIds, laneId];
      const next = { ...prev, completedLaneIds };
      saveLog(next);
      return next;
    });
  }, []);

  const setWeakest = useCallback((laneId: string) => {
    setLog((prev) => {
      const next = { ...prev, weakestLaneId: laneId };
      saveLog(next);
      return next;
    });
  }, []);

  return (
    <section className="space-y-4">
      <article className="ep-card border-2 border-indigo-200/80 bg-indigo-50/20 p-5 text-sm">
        <p className="text-xs font-bold uppercase text-indigo-900">Trap lanes 3–6 · 60s sprint</p>
        <p className="mt-2 text-[var(--ep-navy-muted)]">
          Day 2 covered lanes 1–2. Run each lane below cold at moderator pace — speak the pivot aloud for the APA
          statewide broadcast audience, not just a clerk-room rehearsal.
        </p>
        <p className="mt-2 text-xs font-bold text-[var(--ep-navy)]">
          {log.completedLaneIds.length} of {lanes.length} lanes signed off
          {log.weakestLaneId ? ` · weakest: ${log.weakestLaneId.replace(/-/g, " ")}` : ""}
        </p>
      </article>

      <ol className="space-y-3">
        {lanes.map((lane) => {
          const done = log.completedLaneIds.includes(lane.laneId);
          const isWeakest = log.weakestLaneId === lane.laneId;

          return (
            <li
              key={lane.laneId}
              className={`ep-card p-4 text-sm ${
                done ? "border-emerald-300 bg-emerald-50/30" : "border-[var(--ep-border)]"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold uppercase text-indigo-900">Lane {lane.laneNumber}</p>
                  <p className="font-heading text-base font-bold text-[var(--ep-navy)]">{lane.title}</p>
                </div>
                <Link
                  href={lane.href}
                  className="shrink-0 rounded-full border border-indigo-700 px-3 py-1 text-[10px] font-bold text-indigo-900"
                >
                  Open lane →
                </Link>
              </div>
              <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">{lane.summary}</p>
              {lane.setupHint ? (
                <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
                  <span className="font-bold text-[var(--ep-navy)]">Setup:</span> {lane.setupHint}
                </p>
              ) : null}
              <p className="mt-2 text-sm font-semibold text-[var(--ep-navy)]">{lane.pivotHint}</p>

              <div className="mt-4">
                <ElectionPlanPracticeCountdown
                  seconds={60}
                  label="Cold rep · 60s"
                  onComplete={() => markDone(lane.laneId)}
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => markDone(lane.laneId)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                    done ? "bg-emerald-800 text-white" : "border border-[var(--ep-navy)] text-[var(--ep-navy)]"
                  }`}
                >
                  {done ? "✓ Signed off" : "Mark lane done"}
                </button>
                <button
                  type="button"
                  onClick={() => setWeakest(lane.laneId)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                    isWeakest ? "bg-amber-700 text-white" : "border border-amber-400 text-amber-950"
                  }`}
                >
                  {isWeakest ? "Weakest lane" : "Log as weakest"}
                </button>
              </div>
            </li>
          );
        })}
      </ol>

      <Link
        href={epDebatePrepDayBlockHref(DAY5_ID, "b5-trap-all")}
        className="inline-block text-xs font-bold text-[var(--ep-navy)] underline"
      >
        ← Return to trap sprint block study
      </Link>
    </section>
  );
}
