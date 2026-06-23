"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { ElectionPlanPracticeCountdown } from "@/components/election-plan/ElectionPlanPracticeCountdown";
import { DAY8_PM_HANDOFF } from "@/lib/election-plan/day8-learning-pathway";
import type { Day8RunSegment } from "@/lib/election-plan/debate-prep-day8-run-segments";

const STORAGE_KEY = "kelly-day8-crash-run-v1";

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

function segmentSeconds(seg: Day8RunSegment): number {
  if (seg.kind === "opening") return 90;
  if (seg.kind === "closing") return 60;
  if (seg.kind === "sos") return 90;
  if (seg.kind === "walk-on") return 60;
  return seg.timedMinutes * 60;
}

function staffBadge(role: Day8RunSegment["staffRole"]): string {
  if (role === "hammer") return "Staff · Hammer";
  if (role === "pakko") return "Staff · Pakko";
  return "Staff · Moderator";
}

export function ElectionPlanDay8CrashRunPanel({ segments }: { segments: readonly Day8RunSegment[] }) {
  const [state, setState] = useState<RunnerState>({ completedSegmentIndexes: [], activeIndex: 1 });

  useEffect(() => {
    setState(loadState());
  }, []);

  const active = segments.find((s) => s.segmentIndex === state.activeIndex) ?? segments[0];

  const markDone = useCallback(
    (segmentIndex: number) => {
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
    },
    [segments.length],
  );

  if (!active) return null;

  return (
    <section className="mb-6 space-y-4">
      <article className="ep-card border-violet-200 bg-violet-50/30 p-5 text-sm">
        <p className="text-xs font-bold uppercase text-violet-900">Crash run-through · {segments.length} segments</p>
        <p className="mt-2 text-[var(--ep-navy-muted)]">{DAY8_PM_HANDOFF.body}</p>
        <p className="mt-2 text-xs font-bold text-[var(--ep-navy)]">
          {state.completedSegmentIndexes.length} of {segments.length} complete
        </p>
      </article>

      <article className="ep-card border-2 border-violet-400/50 p-5 text-sm">
        <p className="text-[10px] font-bold uppercase text-violet-900">
          Segment {active.segmentIndex} · {active.kind} · {staffBadge(active.staffRole)}
        </p>
        <p className="mt-2 font-heading text-lg font-bold text-[var(--ep-navy)]">{active.label}</p>
        <p className="mt-2 text-[var(--ep-navy-muted)]">{active.kellyObjective}</p>
        {active.sosDomainId ? (
          <p className="mt-2 text-xs font-bold text-emerald-900">SOS domain · {active.sosDomainId}</p>
        ) : null}

        <div className="mt-4">
          <ElectionPlanPracticeCountdown
            seconds={segmentSeconds(active)}
            label={`Segment timer · ${segmentSeconds(active)}s`}
            onComplete={() => markDone(active.segmentIndex)}
          />
        </div>

        {active.href ? (
          <Link href={active.href} className="mt-3 inline-block text-xs font-bold text-violet-900 underline">
            {active.deepStudyLabel ?? "Deep study →"}
          </Link>
        ) : null}

        <button
          type="button"
          onClick={() => markDone(active.segmentIndex)}
          className="mt-4 block rounded-full bg-[var(--ep-navy)] px-4 py-2 text-xs font-bold text-white"
        >
          Sign off segment {active.segmentIndex} →
        </button>
      </article>

      <ol className="space-y-2">
        {segments.map((seg) => {
          const done = state.completedSegmentIndexes.includes(seg.segmentIndex);
          const isActive = seg.segmentIndex === state.activeIndex;
          return (
            <li
              key={seg.segmentIndex}
              className={`rounded-lg border px-3 py-2 text-xs ${
                isActive
                  ? "border-violet-400 bg-violet-50/50 font-bold"
                  : done
                    ? "border-emerald-200 bg-emerald-50/40 opacity-80"
                    : "border-[var(--ep-border)]"
              }`}
            >
              {done ? "✓ " : ""}
              {seg.segmentIndex}. {seg.label}
              {seg.sosDomainId ? ` · ${seg.sosDomainId}` : ""}
              {seg.href ? (
                <Link href={seg.href} className="ml-2 font-bold text-violet-900 underline">
                  {seg.deepStudyLabel ?? "deep study"}
                </Link>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
