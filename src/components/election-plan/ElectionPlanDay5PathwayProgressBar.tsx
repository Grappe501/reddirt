"use client";

import { useSyncExternalStore } from "react";

import { buildDay5PathwaySteps, type Day5PathwayStep } from "@/lib/election-plan/day5-learning-pathway";
import {
  getDay5PathwayProgress,
  isDay5PathwayStepComplete,
  type Day5PathwayProgressSnapshot,
} from "@/lib/election-plan/day5-pathway-progress";
import { pathwayStepChipLabel } from "@/lib/election-plan/pathway-step-chip";

const EMPTY_PROGRESS: Day5PathwayProgressSnapshot = {
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
  window.addEventListener("kelly-day5-pathway-progress", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("kelly-day5-pathway-progress", onStoreChange);
  };
}

let cachedProgress: Day5PathwayProgressSnapshot = EMPTY_PROGRESS;
let cachedProgressKey = "";

function progressSnapshotKey(snapshot: Day5PathwayProgressSnapshot): string {
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

function getSnapshot(): Day5PathwayProgressSnapshot {
  const next = getDay5PathwayProgress();
  const key = progressSnapshotKey(next);
  if (key === cachedProgressKey) return cachedProgress;
  cachedProgressKey = key;
  cachedProgress = next;
  return next;
}

function getServerSnapshot(): Day5PathwayProgressSnapshot {
  return EMPTY_PROGRESS;
}

function stepStatus(step: Day5PathwayStep, activeStepId?: string): "done" | "active" | "upcoming" {
  if (isDay5PathwayStepComplete(step.id)) return "done";
  if (step.id === activeStepId) return "active";
  return "upcoming";
}

export function ElectionPlanDay5PathwayProgressBar({
  activeStepId,
  compact = false,
}: {
  activeStepId?: string;
  compact?: boolean;
}) {
  const progress = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const steps = buildDay5PathwaySteps();

  return (
    <section className="mb-6 rounded-xl border border-emerald-300/50 bg-emerald-50/30 p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-900">Day 5 pathway</p>
          <p className="mt-1 font-heading text-2xl font-bold text-[var(--ep-navy)]">{progress.requiredPct}%</p>
          <p className="text-xs text-[var(--ep-navy-muted)]">
            {progress.requiredDone} of {progress.requiredTotal} required steps signed off
            {progress.isFullyComplete ? " · Day 5 complete" : progress.isMinimumComplete ? " · minimum done" : ""}
          </p>
        </div>
        {!compact ? (
          <p className="max-w-xs text-xs text-[var(--ep-navy-muted)]">
            Tap <strong className="text-[var(--ep-navy)]">Continue</strong> at the bottom of each page when you finish —
            optional pile-on example does not block completion.
          </p>
        ) : null}
      </div>

      <div className="ep-progress mt-3 h-2">
        <div
          className="ep-progress-bar bg-emerald-700 transition-all duration-300"
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
                      ? "bg-emerald-900 text-white"
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

export function notifyDay5PathwayProgressChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kelly-day5-pathway-progress"));
  }
}
