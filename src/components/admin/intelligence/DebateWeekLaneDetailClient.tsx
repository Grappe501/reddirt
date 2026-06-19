"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { mapAdminHrefToElectionPlan } from "@/lib/election-plan/debate-prep-route-map";
import type { DrillDownLane } from "@/lib/intelligence/v4/debateWeekIntensive2026V3";

export function DebateWeekLaneDetailClient({
  lane,
  initialDone,
  progressApiBase = "/api/admin/intelligence/debate-week-intensive/progress",
  surface = "admin",
}: {
  lane: DrillDownLane;
  initialDone: boolean;
  progressApiBase?: string;
  surface?: "admin" | "election-plan";
}) {
  const resolveHref = surface === "election-plan" ? mapAdminHrefToElectionPlan : (href: string) => href;
  const [done, setDone] = useState(initialDone);

  const toggle = useCallback(async () => {
    const res = await fetch(progressApiBase, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle_lane", laneId: lane.id }),
    });
    const data = (await res.json()) as { ok: boolean };
    if (data.ok) setDone((d) => !d);
  }, [lane.id, progressApiBase]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void toggle()}
          className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wide ${
            done ? "bg-emerald-600 text-white" : "bg-kelly-text text-kelly-gold"
          }`}
        >
          {done ? "Lane complete ✓" : "Mark lane complete"}
        </button>
        {lane.href ? (
          <Link href={resolveHref(lane.href)} className="rounded-lg border border-indigo-400 px-4 py-2 text-xs font-bold text-indigo-950">
            Open linked tool →
          </Link>
        ) : null}
      </div>

      <article className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-5 text-sm">
        <h2 className="text-xs font-bold uppercase text-indigo-900">Theory — why this lane exists</h2>
        <p className="mt-3 leading-relaxed text-kelly-text">{lane.theory}</p>
      </article>

      <article className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-5 text-sm">
        <h2 className="text-xs font-bold uppercase text-emerald-900">Why Kelly should do this</h2>
        <p className="mt-3 leading-relaxed text-kelly-text">{lane.whyKelly}</p>
      </article>

      <article className="rounded-xl border border-amber-200 bg-amber-50/40 p-5 text-sm">
        <h2 className="text-xs font-bold uppercase text-amber-900">What to look for</h2>
        <ul className="mt-4 space-y-3">
          {lane.whatToLookFor.map((w) => (
            <li key={w.signal} className="rounded-lg border border-amber-200/80 bg-white p-3">
              <p className="font-bold text-kelly-navy">{w.signal}</p>
              <p className="mt-1 text-kelly-muted">{w.meaning}</p>
            </li>
          ))}
        </ul>
      </article>

      <article className="rounded-xl border border-kelly-text/10 bg-white p-5 text-sm">
        <h2 className="text-xs font-bold uppercase text-kelly-subtle">Steps — in order</h2>
        <ol className="mt-4 list-inside list-decimal space-y-2 text-kelly-muted">
          {lane.steps.map((step) => (
            <li key={step.slice(0, 48)}>{step}</li>
          ))}
        </ol>
      </article>
    </div>
  );
}
