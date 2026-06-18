"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import type { IntensiveDayId } from "@/lib/intelligence/v4/debateWeekIntensive2026";
import type { IntensiveBlock } from "@/lib/intelligence/v4/debateWeekIntensive2026";
import {
  DEBATE_INTENSIVE_V3_LABEL,
  debateWeekIntensiveLaneHref,
  getBlockTheoryExpansion,
  getDayV3Overlay,
  listDrillDownLanesForDay,
  type DrillDownLane,
  type DrillDownLaneTier,
} from "@/lib/intelligence/v4/debateWeekIntensive2026V3";
import type { KellyDebateIntensiveProgress } from "@/lib/intelligence/v4/kellyDebateIntensiveProgress";

const tierLabel: Record<DrillDownLaneTier, string> = {
  essential: "Essential — do if you can",
  deeper: "Deeper — extra time",
  stretch: "Stretch — optional",
};

const tierBorder: Record<DrillDownLaneTier, string> = {
  essential: "border-emerald-300 bg-emerald-50/50",
  deeper: "border-indigo-300 bg-indigo-50/40",
  stretch: "border-amber-300 bg-amber-50/40",
};

type Props = {
  dayId: IntensiveDayId;
  blocks: IntensiveBlock[];
  initialProgress: KellyDebateIntensiveProgress;
};

export function DebateWeekDayV3Panel({ dayId, blocks, initialProgress }: Props) {
  const [progress, setProgress] = useState(initialProgress);
  const overlay = getDayV3Overlay(dayId);
  const lanes = listDrillDownLanesForDay(dayId);
  const completedLanes = progress.completedLanes ?? [];

  const postProgress = useCallback(async (body: Record<string, string>) => {
    const res = await fetch("/api/admin/intelligence/debate-week-intensive/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as { ok: boolean; progress?: KellyDebateIntensiveProgress };
    if (data.ok && data.progress) setProgress(data.progress);
  }, []);

  return (
    <div className="space-y-8">
      <section className="rounded-xl border-2 border-indigo-400/50 bg-gradient-to-br from-indigo-950 via-[#1a2744] to-kelly-text p-5 text-kelly-inverse">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-indigo-300">{DEBATE_INTENSIVE_V3_LABEL}</p>
        <p className="mt-2 text-sm text-kelly-inverse-soft">{overlay.pacingNote}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/admin/intelligence/debate-week-intensive/lanes"
            className="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-bold uppercase text-white hover:bg-indigo-400"
          >
            All drill-down lanes
          </Link>
          <Link
            href="/admin/intelligence/debate-week-intensive/theory"
            className="rounded-lg border border-indigo-300/50 px-3 py-1.5 text-xs font-bold uppercase text-indigo-200 hover:bg-white/5"
          >
            Theory library
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Block theory — why each block exists</h2>
        <p className="text-sm text-kelly-muted">
          Expand any study block to see adult-education rationale, success criteria, and common mistakes.
        </p>
        {blocks.map((block) => {
          const expansion = getBlockTheoryExpansion(dayId, block.id);
          if (!expansion) return null;
          return (
            <details key={block.id} className="rounded-xl border border-kelly-text/10 bg-white text-sm">
              <summary className="cursor-pointer px-4 py-3 font-bold text-kelly-navy">
                {block.title}
                <span className="ml-2 font-normal text-kelly-subtle">· expand theory</span>
              </summary>
              <div className="space-y-3 border-t border-kelly-text/10 px-4 py-4">
                <div>
                  <p className="text-[10px] font-bold uppercase text-indigo-900">Why this block (theory)</p>
                  <p className="mt-1 text-kelly-muted">{expansion.adultEducationWhy}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-emerald-900">What success looks like</p>
                  <p className="mt-1 text-kelly-muted">{expansion.whatSuccessLooksLike}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-rose-900">Common mistakes</p>
                  <ul className="mt-1 list-inside list-disc text-kelly-muted">
                    {expansion.commonMistakes.map((m) => (
                      <li key={m.slice(0, 40)}>{m}</li>
                    ))}
                  </ul>
                </div>
                {expansion.stretchLaneId ? (
                  <Link
                    href={debateWeekIntensiveLaneHref(expansion.stretchLaneId)}
                    className="inline-block text-xs font-bold text-indigo-800 underline"
                  >
                    Open linked drill-down lane →
                  </Link>
                ) : null}
              </div>
            </details>
          );
        })}
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Drill-down lanes — if time permits</h2>
        {lanes.map((lane) => (
          <LaneCard
            key={lane.id}
            lane={lane}
            done={completedLanes.includes(lane.id)}
            onToggle={() => void postProgress({ action: "toggle_lane", laneId: lane.id })}
          />
        ))}
      </section>
    </div>
  );
}

function LaneCard({
  lane,
  done,
  onToggle,
}: {
  lane: DrillDownLane;
  done: boolean;
  onToggle: () => void;
}) {
  return (
    <article className={`rounded-xl border p-4 text-sm ${tierBorder[lane.tier]} ${done ? "ring-2 ring-emerald-400" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">{tierLabel[lane.tier]} · ~{lane.minutes} min</p>
          <h3 className="mt-1 font-heading text-base font-bold text-kelly-navy">{lane.title}</h3>
          <p className="text-kelly-muted">{lane.subtitle}</p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-xs font-bold">
          <input type="checkbox" checked={done} onChange={onToggle} />
          Done
        </label>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-indigo-200/60 bg-white/80 p-3">
          <p className="text-[10px] font-bold uppercase text-indigo-900">Theory</p>
          <p className="mt-1 text-kelly-muted">{lane.theory}</p>
        </div>
        <div className="rounded-lg border border-emerald-200/60 bg-white/80 p-3">
          <p className="text-[10px] font-bold uppercase text-emerald-900">Why Kelly</p>
          <p className="mt-1 text-kelly-muted">{lane.whyKelly}</p>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-amber-200/60 bg-white/80 p-3">
        <p className="text-[10px] font-bold uppercase text-amber-900">What to look for</p>
        <ul className="mt-2 space-y-2">
          {lane.whatToLookFor.map((w) => (
            <li key={w.signal.slice(0, 40)} className="text-kelly-muted">
              <span className="font-bold text-kelly-navy">{w.signal}</span> — {w.meaning}
            </li>
          ))}
        </ul>
      </div>

      <ol className="mt-3 list-inside list-decimal space-y-1 text-kelly-muted">
        {lane.steps.map((step) => (
          <li key={step.slice(0, 48)}>{step}</li>
        ))}
      </ol>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={debateWeekIntensiveLaneHref(lane.id)}
          className="rounded-full border border-kelly-navy/20 px-3 py-1 text-[10px] font-bold text-kelly-navy hover:bg-white"
        >
          Full lane page →
        </Link>
        {lane.href ? (
          <Link href={lane.href} className="rounded-full border border-indigo-300 px-3 py-1 text-[10px] font-bold text-indigo-900 hover:bg-white">
            Open linked tool →
          </Link>
        ) : null}
      </div>
    </article>
  );
}
