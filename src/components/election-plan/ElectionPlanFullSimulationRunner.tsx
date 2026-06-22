"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { ElectionPlanPracticeCountdown } from "@/components/election-plan/ElectionPlanPracticeCountdown";
import { DAY6_APA_SIM_FRAME, DAY6_SIM_NO_NEW_MATERIAL_WATCHOUT } from "@/lib/election-plan/debate-prep-day6-simulation-copy";
import type { Day6SimSegment } from "@/lib/election-plan/debate-prep-day6-simulation-copy";
import type { Day5WhenXSayYRow } from "@/lib/election-plan/load-day5-capitalize-surface";
import { epDebatePrepDayBlockHref } from "@/lib/election-plan/debate-prep-links";
import { DAY5_ID } from "@/lib/election-plan/debatePrepDayDrillDown";

const STORAGE_KEY = "kelly-day6-sim-runner-v1";

type RunnerState = {
  completedSegmentIndexes: number[];
  activeIndex: number;
};

function loadState(): RunnerState {
  if (typeof window === "undefined") return { completedSegmentIndexes: [], activeIndex: 1 };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RunnerState) : { completedSegmentIndexes: [], activeIndex: 1 };
  } catch {
    return { completedSegmentIndexes: [], activeIndex: 1 };
  }
}

function saveState(state: RunnerState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function staffRoleBadge(role: Day6SimSegment["staffRole"]): string {
  if (role === "hammer") return "Staff · Hammer";
  if (role === "pakko") return "Staff · Pakko";
  return "Staff · Moderator";
}

function segmentSeconds(seg: Day6SimSegment): number {
  if (seg.kind === "opening") return 90;
  if (seg.kind === "closing") return 60;
  if (seg.kind === "sos") return 90;
  return seg.timedMinutes * 60;
}

export function ElectionPlanFullSimulationRunner({
  segments,
  pairs,
  hasDay5Minimum,
}: {
  segments: Day6SimSegment[];
  pairs: Day5WhenXSayYRow[];
  hasDay5Minimum: boolean;
}) {
  const [state, setState] = useState<RunnerState>({ completedSegmentIndexes: [], activeIndex: 1 });

  useEffect(() => {
    setState(loadState());
  }, []);

  const active = segments.find((s) => s.segmentIndex === state.activeIndex) ?? segments[0];
  const verifiedPairs = pairs.filter((p) => !p.isPlaceholder && p.kellyLine.trim());
  const pairHint = verifiedPairs[state.activeIndex % verifiedPairs.length];

  const markDone = useCallback((segmentIndex: number) => {
    setState((prev) => {
      const completedSegmentIndexes = prev.completedSegmentIndexes.includes(segmentIndex)
        ? prev.completedSegmentIndexes
        : [...prev.completedSegmentIndexes, segmentIndex];
      const nextIndex = Math.min(segments.length, segmentIndex + 1);
      const next = {
        completedSegmentIndexes,
        activeIndex: completedSegmentIndexes.length >= segments.length ? segments.length : nextIndex,
      };
      saveState(next);
      return next;
    });
  }, [segments.length]);

  if (!hasDay5Minimum) {
    return (
      <section className="ep-card border-amber-300 bg-amber-50/50 p-5 text-sm">
        <p className="font-bold text-amber-950">Finish Day 5 minimum first</p>
        <p className="mt-2 text-[var(--ep-navy-muted)]">
          Build five+ claims-green when-X-say-Y pairs before running the full simulation.
        </p>
        <Link
          href={epDebatePrepDayBlockHref(DAY5_ID, "b5-lab-review")}
          className="mt-3 inline-block text-xs font-bold text-[var(--ep-navy)] underline"
        >
          Day 5 capitalize sheet →
        </Link>
      </section>
    );
  }

  return (
    <section className="mb-6 space-y-4">
      <p className="rounded-lg border border-violet-300/60 bg-violet-50/40 px-3 py-2 text-xs text-violet-950">
        {DAY6_APA_SIM_FRAME}
      </p>
      <p className="text-xs text-[var(--ep-navy-muted)]">{DAY6_SIM_NO_NEW_MATERIAL_WATCHOUT}</p>

      <div className="flex flex-wrap gap-2">
        {segments.map((seg) => {
          const done = state.completedSegmentIndexes.includes(seg.segmentIndex);
          const isActive = seg.segmentIndex === state.activeIndex;
          return (
            <span
              key={seg.segmentIndex}
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                done
                  ? "bg-violet-100 text-violet-900"
                  : isActive
                    ? "bg-violet-900 text-white"
                    : "bg-white text-[var(--ep-navy-muted)] ring-1 ring-[var(--ep-border)]"
              }`}
            >
              {done ? "✓ " : ""}
              {seg.segmentIndex}
            </span>
          );
        })}
      </div>

      {active ? (
        <article className="ep-card border-2 border-violet-400 bg-white p-5 text-sm">
          <p className="text-[10px] font-bold uppercase text-violet-900">
            Segment {active.segmentIndex} of {segments.length} · {staffRoleBadge(active.staffRole)}
          </p>
          <p className="mt-2 font-heading text-lg font-bold text-[var(--ep-navy)]">{active.label}</p>
          <p className="mt-2 text-[var(--ep-navy-muted)]">{active.kellyObjective}</p>
          {active.staffSetupHint ? (
            <p className="mt-3 rounded-lg bg-violet-50/50 p-3 text-xs text-violet-950">
              <span className="font-bold">Staff setup:</span> {active.staffSetupHint}
            </p>
          ) : null}
          {pairHint && (active.kind === "trap" || active.kind === "pile-on") ? (
            <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/40 p-3 text-xs">
              <span className="font-bold text-emerald-900">Day 5 pair hint:</span> {pairHint.triggerLabel} →{" "}
              {pairHint.kellyLine.slice(0, 120)}
              {pairHint.kellyLine.length > 120 ? "…" : ""}
            </p>
          ) : null}
          {active.href ? (
            <Link href={active.href} className="mt-3 inline-block text-xs font-bold text-violet-900 underline">
              Drill-down resource →
            </Link>
          ) : null}
          <div className="mt-4">
            <ElectionPlanPracticeCountdown
              seconds={segmentSeconds(active)}
              label={`${active.kind} timer`}
              onComplete={() => markDone(active.segmentIndex)}
            />
          </div>
          <button
            type="button"
            onClick={() => markDone(active.segmentIndex)}
            className="mt-4 rounded-full bg-[var(--ep-navy)] px-4 py-2 text-xs font-bold text-white"
          >
            Mark segment complete →
          </button>
        </article>
      ) : null}

      <p className="text-xs font-bold text-emerald-900">
        {state.completedSegmentIndexes.length}/{segments.length} segments complete
      </p>
    </section>
  );
}
