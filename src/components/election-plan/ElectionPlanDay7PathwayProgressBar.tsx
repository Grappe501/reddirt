"use client";

import { useSyncExternalStore } from "react";

import { buildDay7PathwaySteps, type Day7PathwayStep } from "@/lib/election-plan/day7-learning-pathway";
import {
  getDay7PathwayProgress,
  isDay7PathwayStepComplete,
  type Day7PathwayProgressSnapshot,
} from "@/lib/election-plan/day7-pathway-progress";
import { pathwayStepChipLabel } from "@/lib/election-plan/pathway-step-chip";

const EMPTY_PROGRESS: Day7PathwayProgressSnapshot = {
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
  window.addEventListener("kelly-day7-pathway-progress", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("kelly-day7-pathway-progress", onStoreChange);
  };
}

let cachedProgress: Day7PathwayProgressSnapshot = EMPTY_PROGRESS;
let cachedProgressKey = "";

function progressSnapshotKey(snapshot: Day7PathwayProgressSnapshot): string {
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

function getSnapshot(): Day7PathwayProgressSnapshot {
  const next = getDay7PathwayProgress();
  const key = progressSnapshotKey(next);
  if (key === cachedProgressKey) return cachedProgress;
  cachedProgressKey = key;
  cachedProgress = next;
  return next;
}

function getServerSnapshot(): Day7PathwayProgressSnapshot {
  return EMPTY_PROGRESS;
}

function stepStatus(step: Day7PathwayStep, activeStepId?: string): "done" | "active" | "upcoming" {
  if (isDay7PathwayStepComplete(step.id)) return "done";
  if (step.id === activeStepId) return "active";
  return "upcoming";
}

export function ElectionPlanDay7PathwayProgressBar({
  activeStepId,
  compact = false,
}: {
  activeStepId?: string;
  compact?: boolean;
}) {
  const progress = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const steps = buildDay7PathwaySteps();

  return (
    <section className="mb-6 rounded-xl border border-rose-300/50 bg-rose-50/30 p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-rose-900">Day 7 pathway</p>
          <p className="mt-1 font-heading text-2xl font-bold text-[var(--ep-navy)]">{progress.requiredPct}%</p>
          <p className="text-xs text-[var(--ep-navy-muted)]">
            {progress.requiredDone} of {progress.requiredTotal} steps signed off
            {progress.isFullyComplete ? " · Day 7 complete" : progress.isMinimumComplete ? " · minimum done" : ""}
          </p>
        </div>
        {!compact ? (
          <p className="max-w-xs text-xs text-[var(--ep-navy-muted)]">
            Tap <strong className="text-[var(--ep-navy)]">Continue</strong> at the bottom of each page when you finish
            — claims scan and psych refresh roll to debate-eve AM if tired.
          </p>
        ) : null}
      </div>

      <div className="ep-progress mt-3 h-2">
        <div
          className="ep-progress-bar bg-rose-700 transition-all duration-300"
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
                    ? "bg-rose-100 text-rose-900"
                    : status === "active"
                      ? "bg-rose-900 text-white"
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

export function notifyDay7PathwayProgressChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kelly-day7-pathway-progress"));
  }
}
