"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { DEBATE_COURSE_PROGRESS_EVENT } from "@/lib/election-plan/debate-prep-course-progress-events";
import {
  DEBATE_COURSE_PROGRESS_SERVER_SNAPSHOT,
  getDebateCourseProgress,
  type DebateCourseModuleProgress,
  type DebateCourseProgressSnapshot,
} from "@/lib/election-plan/debate-prep-course-progress";

function subscribe(onStoreChange: () => void): () => void {
  const handler = () => onStoreChange();
  window.addEventListener(DEBATE_COURSE_PROGRESS_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(DEBATE_COURSE_PROGRESS_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

/** useSyncExternalStore requires referential stability when data is unchanged. */
let cachedProgress: DebateCourseProgressSnapshot = DEBATE_COURSE_PROGRESS_SERVER_SNAPSHOT;
let cachedProgressKey = "";

function progressSnapshotKey(snapshot: DebateCourseProgressSnapshot): string {
  return [
    snapshot.coursePct,
    snapshot.modulesComplete,
    snapshot.modulesStarted,
    snapshot.totalRequiredDone,
    snapshot.totalRequiredSteps,
    snapshot.recommendedModuleNumber,
    ...snapshot.modules.map(
      (m) =>
        `${m.module.dayId}:${m.requiredPct}:${m.requiredDone}:${m.requiredTotal}:${m.status}:${m.isMinimumComplete}:${m.isFullyComplete}`,
    ),
  ].join("\u0000");
}

function getSnapshot(): DebateCourseProgressSnapshot {
  const next = getDebateCourseProgress();
  const key = progressSnapshotKey(next);
  if (key === cachedProgressKey) return cachedProgress;
  cachedProgressKey = key;
  cachedProgress = next;
  return next;
}

function getServerSnapshot(): DebateCourseProgressSnapshot {
  return DEBATE_COURSE_PROGRESS_SERVER_SNAPSHOT;
}

function statusLabel(status: DebateCourseModuleProgress["status"]): string {
  if (status === "complete") return "Complete";
  if (status === "in_progress") return "In progress";
  return "Not started";
}

function statusClass(status: DebateCourseModuleProgress["status"]): string {
  if (status === "complete") return "bg-emerald-100 text-emerald-900 border-emerald-200";
  if (status === "in_progress") return "bg-sky-50 text-sky-900 border-sky-200";
  return "bg-slate-50 text-slate-600 border-slate-200";
}

function ModuleRow({ row }: { row: DebateCourseModuleProgress }) {
  const { module, requiredPct, status } = row;
  return (
    <Link
      href={module.href}
      className="group block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-slate-400 hover:shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {module.label}
            {module.isCommandReplay ? " · 3-hour command replay" : ""}
          </p>
          <p className="mt-1 font-heading text-base font-bold text-slate-900 group-hover:text-slate-950">
            {module.title}
          </p>
          <p className="mt-1 text-sm text-slate-600">{module.subtitle}</p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${statusClass(status)}`}
        >
          {statusLabel(status)}
        </span>
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
          <span>Progress</span>
          <span>{requiredPct}%</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-slate-800 transition-all"
            style={{ width: `${requiredPct}%` }}
          />
        </div>
      </div>
    </Link>
  );
}

export function ElectionPlanCourseProgressDashboard() {
  const progress = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Course progress</p>
            <p className="mt-1 font-heading text-4xl font-bold text-slate-900">{progress.coursePct}%</p>
            <p className="mt-1 text-sm text-slate-600">
              {progress.modulesComplete} of {progress.modules.length} modules complete ·{" "}
              {progress.totalRequiredDone} of {progress.totalRequiredSteps} required steps
            </p>
          </div>
          <Link
            href={progress.recommendedModule.href}
            className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
          >
            Continue · Module {progress.recommendedModuleNumber} →
          </Link>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-slate-800 transition-all"
            style={{ width: `${progress.coursePct}%` }}
          />
        </div>
      </div>

      <div className="grid gap-3">
        {progress.modules.map((row) => (
          <ModuleRow key={row.module.dayId} row={row} />
        ))}
      </div>
    </section>
  );
}
