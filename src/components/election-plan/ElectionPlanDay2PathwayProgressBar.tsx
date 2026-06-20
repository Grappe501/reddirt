"use client";

import { useSyncExternalStore } from "react";

import { buildDay2PathwaySteps, type Day2PathwayStep } from "@/lib/election-plan/day2-learning-pathway";
import { pathwayStepChipLabel } from "@/lib/election-plan/pathway-step-chip";
import {
  getDay2PathwayProgress,
  isDay2PathwayStepComplete,
  type Day2PathwayProgressSnapshot,
} from "@/lib/election-plan/day2-pathway-progress";

const EMPTY_PROGRESS: Day2PathwayProgressSnapshot = {
  completedStepIds: [],
  requiredTotal: 0,
  requiredDone: 0,
  requiredPct: 0,
  allTotal: 0,
  allDone: 0,
  allPct: 0,
  isMinimumComplete: false,
  isFullyComplete: false,
};

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("kelly-day2-pathway-progress", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("kelly-day2-pathway-progress", onStoreChange);
  };
}

let cachedProgress: Day2PathwayProgressSnapshot = EMPTY_PROGRESS;
let cachedProgressKey = "";

function progressSnapshotKey(snapshot: Day2PathwayProgressSnapshot): string {
  return [
    snapshot.completedStepIds.join("\u0001"),
    snapshot.requiredDone,
    snapshot.requiredTotal,
    snapshot.allDone,
    snapshot.allTotal,
    snapshot.isMinimumComplete,
    snapshot.isFullyComplete,
  ].join("\u0000");
}

function getSnapshot(): Day2PathwayProgressSnapshot {
  const next = getDay2PathwayProgress();
  const key = progressSnapshotKey(next);
  if (key === cachedProgressKey) return cachedProgress;
  cachedProgressKey = key;
  cachedProgress = next;
  return next;
}

function getServerSnapshot(): Day2PathwayProgressSnapshot {
  return EMPTY_PROGRESS;
}

function stepStatus(step: Day2PathwayStep, activeStepId?: string): "done" | "active" | "upcoming" {
  if (isDay2PathwayStepComplete(step.id)) return "done";
  if (step.id === activeStepId) return "active";
  return "upcoming";
}

export function ElectionPlanDay2PathwayProgressBar({
  activeStepId,
  compact = false,
}: {
  activeStepId?: string;
  compact?: boolean;
}) {
  const progress = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const steps = buildDay2PathwaySteps();

  return (
    <section className="mb-6 rounded-xl border border-indigo-300/50 bg-indigo-50/30 p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-indigo-900">Day 2 pathway</p>
          <p className="mt-1 font-heading text-2xl font-bold text-[var(--ep-navy)]">{progress.requiredPct}%</p>
          <p className="text-xs text-[var(--ep-navy-muted)]">
            {progress.requiredDone} of {progress.requiredTotal} required steps signed off
            {progress.isFullyComplete ? " · Day 2 complete" : progress.isMinimumComplete ? " · minimum done" : ""}
          </p>
        </div>
        {!compact ? (
          <p className="max-w-xs text-xs text-[var(--ep-navy-muted)]">
            Tap <strong className="text-[var(--ep-navy)]">Continue</strong> at the bottom of each page when you finish —
            optional Hammer/Pakko examples do not block completion.
          </p>
        ) : null}
      </div>

      <div className="ep-progress mt-3 h-2">
        <div
          className="ep-progress-bar bg-indigo-700 transition-all duration-300"
          style={{ width: `${Math.min(100, progress.requiredPct)}%` }}
        />
      </div>

      {!compact ? (
        <ol className="mt-4 flex flex-wrap gap-2">
          {steps.map((step, idx) => {
            const status = stepStatus(step, activeStepId);
            return (
              <li
                key={step.id}
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                  status === "done"
                    ? "bg-emerald-100 text-emerald-900"
                    : status === "active"
                      ? "bg-indigo-900 text-white"
                      : "bg-white text-[var(--ep-navy-muted)] ring-1 ring-[var(--ep-border)]"
                }`}
                title={step.label}
              >
                {status === "done" ? "✓ " : ""}
                {pathwayStepChipLabel(step.kind, idx)}
              </li>
            );
          })}
        </ol>
      ) : null}
    </section>
  );
}

export function notifyDay2PathwayProgressChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kelly-day2-pathway-progress"));
  }
}
