"use client";

import { useCallback, useState } from "react";
import type { IntensiveBlock, IntensiveDayId } from "@/lib/intelligence/v4/debateWeekIntensive2026";
import {
  DEBATE_INTENSIVE_V2_LABEL,
  getDayDeepOverlay,
  mergeForumDrillsIntoDay5,
  type CommandDrill,
} from "@/lib/intelligence/v4/debateWeekIntensive2026Deep";
import type { KellyDebateIntensiveProgress } from "@/lib/intelligence/v4/kellyDebateIntensiveProgress";
import type { ForumDeepAnalysis } from "@/lib/intelligence/v4/forumTranscriptLab";

type Props = {
  dayId: IntensiveDayId;
  blocks: IntensiveBlock[];
  forumCapitalizeMoves?: Array<{ trigger: string; kellyLine: string; why: string }>;
  forumDeepAnalysis?: ForumDeepAnalysis | null;
  initialProgress: KellyDebateIntensiveProgress;
  progressApiBase?: string;
};

export function DebateWeekDayDeepPanel({
  dayId,
  blocks,
  forumCapitalizeMoves = [],
  forumDeepAnalysis,
  initialProgress,
  progressApiBase = "/api/admin/intelligence/debate-week-intensive/progress",
}: Props) {
  const [progress, setProgress] = useState(initialProgress);
  const overlay = getDayDeepOverlay(dayId);

  const forumDrills =
    dayId === "day-5-anticipate-and-capitalize" && forumCapitalizeMoves.length
      ? mergeForumDrillsIntoDay5(forumCapitalizeMoves)
      : [];

  const deepCommandDrills: CommandDrill[] =
    dayId === "day-5-anticipate-and-capitalize" && forumDeepAnalysis?.commandDrills?.length
      ? forumDeepAnalysis.commandDrills.slice(0, 10).map((d, i) => ({
          id: `deep-${i}`,
          ifTheySay: d.ifTheySay,
          youSay: d.youSay,
          thenScan: d.thenScan,
          claimsNote: "Verify in claims gate before stage.",
        }))
      : [];

  const allDrills = [...overlay.commandDrills, ...forumDrills, ...deepCommandDrills];
  const completedBlocks = progress.completedBlocks[dayId] ?? [];
  const dayComplete = progress.completedDays.includes(dayId);

  const postProgress = useCallback(
    async (body: Record<string, string>) => {
      const res = await fetch(progressApiBase, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { ok: boolean; progress?: KellyDebateIntensiveProgress };
      if (data.ok && data.progress) setProgress(data.progress);
    },
    [progressApiBase],
  );

  const dayIntegration = forumDeepAnalysis?.sevenDayIntegration?.find((d) => {
    const n = dayId.match(/day-(\d+)/)?.[1];
    return n && d.dayNumber === Number(n);
  });

  return (
    <div className="space-y-8">
      <section className="rounded-xl border-2 border-kelly-gold/40 bg-gradient-to-br from-kelly-text to-[#1a2744] p-5 text-kelly-inverse">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-kelly-gold">{DEBATE_INTENSIVE_V2_LABEL}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-emerald-400/30 bg-emerald-950/20 p-3 text-sm">
            <p className="text-[10px] font-bold uppercase text-emerald-300">Kelly strength today</p>
            <p className="mt-1 text-kelly-inverse-soft">{overlay.kellyStrengthToday}</p>
          </div>
          <div className="rounded-lg border border-rose-400/30 bg-rose-950/20 p-3 text-sm">
            <p className="text-[10px] font-bold uppercase text-rose-300">Watch out</p>
            <p className="mt-1 text-kelly-inverse-soft">{overlay.kellyWatchOut}</p>
          </div>
        </div>
        {overlay.forumIntelHook ? (
          <p className="mt-3 text-xs text-kelly-gold">{overlay.forumIntelHook}</p>
        ) : null}
        {dayIntegration ? (
          <div className="mt-3 rounded-lg border border-violet-400/30 bg-violet-950/20 p-3 text-xs">
            <p className="font-bold text-violet-200">Forum intel for today</p>
            <p className="mt-1 text-kelly-inverse-soft">{dayIntegration.useThisIntel}</p>
            <p className="mt-2 font-bold text-violet-200">Drill tonight</p>
            <p className="text-kelly-inverse-soft">{dayIntegration.drillTonight}</p>
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => void postProgress({ action: "complete_day", dayId })}
          className={`mt-4 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wide ${
            dayComplete ? "bg-emerald-600 text-white" : "bg-kelly-gold text-kelly-text"
          }`}
        >
          {dayComplete ? "Day marked complete ✓" : "Mark day complete"}
        </button>
      </section>

      <section className="rounded-xl border border-kelly-text/10 bg-white p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Study blocks — track progress</h2>
        <ol className="mt-4 space-y-3">
          {blocks.map((block, idx) => {
            const done = completedBlocks.includes(block.id);
            return (
              <li
                key={block.id}
                className={`rounded-lg border p-4 text-sm ${done ? "border-emerald-300 bg-emerald-50/40" : "border-kelly-text/10"}`}
              >
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={() =>
                      void postProgress({ action: "toggle_block", dayId, blockId: block.id })
                    }
                    className="mt-1"
                  />
                  <span>
                    <span className="font-bold text-kelly-navy">
                      {idx + 1}. {block.title}
                    </span>
                    <span className="ml-2 font-mono text-xs text-kelly-subtle">{block.minutes} min</span>
                    <p className="mt-1 text-kelly-muted">{block.activity}</p>
                  </span>
                </label>
              </li>
            );
          })}
        </ol>
      </section>

      {overlay.microLessons.length > 0 ? (
        <section className="space-y-4">
          <h2 className="font-heading text-lg font-bold text-kelly-navy">Micro-lessons</h2>
          {overlay.microLessons.map((lesson) => (
            <article key={lesson.id} className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 text-sm">
              <p className="font-bold text-indigo-950">
                {lesson.title}{" "}
                <span className="font-normal text-kelly-subtle">· {lesson.readMinutes} min read</span>
              </p>
              <p className="mt-2 whitespace-pre-wrap text-kelly-muted">{lesson.body}</p>
            </article>
          ))}
        </section>
      ) : null}

      {allDrills.length > 0 ? (
        <section className="space-y-4">
          <h2 className="font-heading text-lg font-bold text-kelly-navy">Command drills — if / then / scan</h2>
          {allDrills.map((drill) => {
            const done = progress.completedDrills.includes(drill.id);
            return (
              <article
                key={drill.id}
                className={`rounded-xl border p-4 text-sm ${done ? "border-emerald-300 bg-emerald-50/30" : "border-emerald-200 bg-emerald-50/40"}`}
              >
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={() => void postProgress({ action: "toggle_drill", drillId: drill.id })}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-bold text-rose-950">If they say: {drill.ifTheySay}</p>
                    <p className="mt-2 font-bold text-kelly-navy">You say: {drill.youSay}</p>
                    <p className="mt-1 text-xs text-kelly-muted">Then scan: {drill.thenScan}</p>
                    {drill.claimsNote ? (
                      <p className="mt-1 text-xs font-bold text-amber-900">{drill.claimsNote}</p>
                    ) : null}
                  </div>
                </label>
              </article>
            );
          })}
        </section>
      ) : null}

      {dayId === "day-5-anticipate-and-capitalize" && forumDeepAnalysis?.mockModeratorBlock ? (
        <section className="rounded-xl border border-violet-300 bg-violet-50/40 p-5 text-sm">
          <h2 className="font-heading text-lg font-bold text-violet-950">Mock moderator block (from forum deep analysis)</h2>
          <p className="mt-3 font-bold text-kelly-navy">Opening: {forumDeepAnalysis.mockModeratorBlock.openingQuestion}</p>
          <ul className="mt-3 list-inside list-disc space-y-1 text-kelly-muted">
            {forumDeepAnalysis.mockModeratorBlock.followUps.map((q) => (
              <li key={q.slice(0, 48)}>{q}</li>
            ))}
          </ul>
          <p className="mt-3 font-bold text-kelly-navy">
            Closing: {forumDeepAnalysis.mockModeratorBlock.closingQuestion}
          </p>
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 text-sm">
          <h3 className="text-xs font-bold uppercase text-amber-900">Reflection prompts</h3>
          <ul className="mt-2 list-inside list-disc space-y-1 text-kelly-muted">
            {overlay.reflectionPrompts.map((p) => (
              <li key={p.slice(0, 48)}>{p}</li>
            ))}
          </ul>
        </article>
        <article className="rounded-xl border border-sky-200 bg-sky-50/40 p-4 text-sm">
          <h3 className="text-xs font-bold uppercase text-sky-900">Evening review checklist</h3>
          <ul className="mt-2 list-inside list-disc space-y-1 text-kelly-muted">
            {overlay.eveningReview.map((p) => (
              <li key={p.slice(0, 48)}>{p}</li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
