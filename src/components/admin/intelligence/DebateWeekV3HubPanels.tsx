"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  DEBATE_WEEK_INTENSIVE_DAYS,
  debateWeekIntensiveDayHref,
} from "@/lib/intelligence/v4/debateWeekIntensive2026";
import {
  computeDebateIntensiveReadiness,
  DEBATE_INTENSIVE_V3_LABEL,
  DEBATE_WEEK_LANES_HUB_HREF,
  DEBATE_WEEK_THEORY_HUB_HREF,
  debateWeekIntensiveLaneHref,
  listAllDrillDownLanes,
  type DebateIntensiveReadiness,
  type DrillDownLaneTier,
} from "@/lib/intelligence/v4/debateWeekIntensive2026V3";
import type { KellyDebateIntensiveProgress } from "@/lib/intelligence/v4/kellyDebateIntensiveProgress";

const tierOrder: DrillDownLaneTier[] = ["essential", "deeper", "stretch"];

export function DebateWeekReadinessPanel({ initialProgress }: { initialProgress: KellyDebateIntensiveProgress }) {
  const [progress, setProgress] = useState(initialProgress);
  const readiness = computeDebateIntensiveReadiness(progress);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/admin/intelligence/debate-week-intensive/progress");
    const data = (await res.json()) as { ok: boolean; progress?: KellyDebateIntensiveProgress };
    if (data.ok && data.progress) setProgress(data.progress);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <section className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50/40 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase text-indigo-900">{DEBATE_INTENSIVE_V3_LABEL}</p>
          <p className="mt-1 font-heading text-2xl font-bold text-kelly-navy">
            {readiness.percent}% · {readiness.label}
          </p>
          <p className="mt-1 text-sm text-kelly-muted">
            Blocks {readiness.blocksDone}/{readiness.blocksTotal} · Drills {readiness.drillsDone}/{readiness.drillsTotal} ·
            Lanes {readiness.lanesDone}/{readiness.lanesTotal} · Days {readiness.daysDone}/{readiness.daysTotal}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Link
            href={DEBATE_WEEK_LANES_HUB_HREF}
            className="rounded-lg bg-indigo-700 px-4 py-2 text-center text-xs font-bold uppercase text-white"
          >
            Drill-down lanes
          </Link>
          <Link
            href={DEBATE_WEEK_THEORY_HUB_HREF}
            className="rounded-lg border border-indigo-400 px-4 py-2 text-center text-xs font-bold uppercase text-indigo-950"
          >
            Theory library
          </Link>
        </div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-indigo-200">
        <div
          className="h-full rounded-full bg-indigo-700 transition-all"
          style={{ width: `${Math.min(100, readiness.percent)}%` }}
        />
      </div>
    </section>
  );
}

export function DebateWeekLanesHubClient({ initialProgress }: { initialProgress: KellyDebateIntensiveProgress }) {
  const [progress, setProgress] = useState(initialProgress);
  const lanes = listAllDrillDownLanes();
  const completed = new Set(progress.completedLanes ?? []);

  const postProgress = useCallback(async (laneId: string) => {
    const res = await fetch("/api/admin/intelligence/debate-week-intensive/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle_lane", laneId }),
    });
    const data = (await res.json()) as { ok: boolean; progress?: KellyDebateIntensiveProgress };
    if (data.ok && data.progress) setProgress(data.progress);
  }, []);

  return (
    <div className="space-y-8">
      <ReadinessSummary progress={progress} />

      {DEBATE_WEEK_INTENSIVE_DAYS.map((day) => {
        const dayLanes = lanes.filter((l) => l.dayId === day.dayId);
        if (!dayLanes.length) return null;
        return (
          <section key={day.dayId}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-heading text-lg font-bold text-kelly-navy">
                Day {day.day} — {day.title}
              </h2>
              <Link href={debateWeekIntensiveDayHref(day.dayId)} className="text-xs font-bold text-indigo-800 underline">
                Day page →
              </Link>
            </div>
            <div className="space-y-3">
              {tierOrder.map((tier) => {
                const tierLanes = dayLanes.filter((l) => l.tier === tier);
                if (!tierLanes.length) return null;
                return (
                  <div key={tier}>
                    <p className="mb-2 text-[10px] font-bold uppercase text-kelly-subtle">{tier}</p>
                    <div className="grid gap-3 lg:grid-cols-2">
                      {tierLanes.map((lane) => (
                        <article
                          key={lane.id}
                          className={`rounded-xl border border-kelly-text/10 bg-white p-4 text-sm ${completed.has(lane.id) ? "ring-2 ring-emerald-400" : ""}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-bold text-kelly-navy">{lane.title}</p>
                              <p className="text-xs text-kelly-muted">{lane.subtitle} · ~{lane.minutes} min</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={completed.has(lane.id)}
                              onChange={() => void postProgress(lane.id)}
                              aria-label={`Mark ${lane.title} complete`}
                            />
                          </div>
                          <p className="mt-2 line-clamp-2 text-xs text-kelly-muted">{lane.whyKelly}</p>
                          <Link
                            href={debateWeekIntensiveLaneHref(lane.id)}
                            className="mt-2 inline-block text-xs font-bold text-indigo-800 underline"
                          >
                            Open lane →
                          </Link>
                        </article>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function ReadinessSummary({ progress }: { progress: KellyDebateIntensiveProgress }) {
  const r: DebateIntensiveReadiness = computeDebateIntensiveReadiness(progress);
  return (
    <div className="rounded-xl border border-kelly-gold/30 bg-kelly-gold/5 p-4 text-sm">
      <p className="font-bold text-kelly-navy">
        Overall readiness: {r.percent}% — {r.label}
      </p>
      <p className="mt-1 text-kelly-muted">
        Essential lanes first, then deeper, then stretch. Theory library explains why each technique exists.
      </p>
    </div>
  );
}
