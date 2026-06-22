"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { ElectionPlanPracticeCountdown } from "@/components/election-plan/ElectionPlanPracticeCountdown";
import type { Day5SosSprintQuestion } from "@/lib/election-plan/load-day5-capitalize-surface";
import { EP_DEBATE_QUESTIONS_HREF, epDebatePrepDayBlockHref } from "@/lib/election-plan/debate-prep-links";
import { DAY5_ID } from "@/lib/election-plan/debatePrepDayDrillDown";

const STORAGE_KEY = "kelly-day5-sos-sprint-v1";
const SPEAK_ORDER = "Beat 1 — who you served · Beat 2 — what broke · Beat 3 — how you fix it for clerks";

type SprintState = {
  completedIndexes: number[];
  activeIndex: number;
};

function loadState(): SprintState {
  if (typeof window === "undefined") return { completedIndexes: [], activeIndex: 1 };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SprintState) : { completedIndexes: [], activeIndex: 1 };
  } catch {
    return { completedIndexes: [], activeIndex: 1 };
  }
}

function saveState(state: SprintState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function ElectionPlanSosSprintTimer({ questions }: { questions: Day5SosSprintQuestion[] }) {
  const [state, setState] = useState<SprintState>({ completedIndexes: [], activeIndex: 1 });

  useEffect(() => {
    setState(loadState());
  }, []);

  const markDone = useCallback((sprintIndex: number) => {
    setState((prev) => {
      const completedIndexes = prev.completedIndexes.includes(sprintIndex)
        ? prev.completedIndexes
        : [...prev.completedIndexes, sprintIndex];
      const nextActive = Math.min(5, sprintIndex + 1);
      const next = {
        completedIndexes,
        activeIndex: completedIndexes.length >= 5 ? 5 : nextActive,
      };
      saveState(next);
      return next;
    });
  }, []);

  if (questions.length === 0) {
    return (
      <section className="ep-card border-2 border-amber-200 bg-amber-50/40 p-5 text-sm">
        <p className="text-xs font-bold uppercase text-amber-900">SOS sprint · five × 90s</p>
        <p className="mt-2 text-[var(--ep-navy-muted)]">
          No Day 4 SOS mapping rows yet — complete Day 4 forum lab + SOS mapping block first, or pick five questions
          manually from the bank.
        </p>
        <Link href={EP_DEBATE_QUESTIONS_HREF} className="ep-btn ep-btn-primary ep-btn-block-sm-auto mt-4 inline-block">
          Open 40 questions bank →
        </Link>
      </section>
    );
  }

  const active =
    questions.find((q) => q.sprintIndex === state.activeIndex) ?? questions[0]!;

  return (
    <section className="space-y-4">
      <article className="ep-card border-2 border-violet-200/80 bg-violet-50/20 p-5 text-sm">
        <p className="text-xs font-bold uppercase text-violet-900">SOS question sprint · five × 90s</p>
        <p className="mt-2 text-[var(--ep-navy-muted)]">
          Pre-filled from Day 4 forum → SOS mapping. Staff reads question — Kelly answers with speak order aloud.
        </p>
        <p className="mt-3 rounded-lg border border-violet-200 bg-white/60 px-3 py-2 text-xs font-bold text-violet-950">
          {SPEAK_ORDER}
        </p>
        <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
          {state.completedIndexes.length} of {Math.min(5, questions.length)} complete
        </p>
      </article>

      <article className="ep-card border-2 border-violet-400/50 p-5 text-sm">
        <p className="text-[10px] font-bold uppercase text-violet-900">Question {active.sprintIndex} of 5</p>
        {active.forumTopic ? (
          <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
            Forum theme: <span className="font-semibold text-[var(--ep-navy)]">{active.forumTopic}</span>
          </p>
        ) : null}
        <p className="mt-3 font-heading text-lg font-bold text-[var(--ep-navy)]">{active.questionTitle}</p>
        {active.hammerLineSuggestion ? (
          <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50/40 px-3 py-2 text-xs text-rose-950">
            <span className="font-bold">Verified Hammer line:</span> {active.hammerLineSuggestion}
          </p>
        ) : null}
        <Link href={active.questionHref} className="mt-3 inline-block text-xs font-bold text-violet-800 underline">
          Full question drill →
        </Link>

        <div className="mt-4">
          <ElectionPlanPracticeCountdown
            seconds={90}
            label="Answer aloud · 90s hard stop"
            onComplete={() => markDone(active.sprintIndex)}
          />
        </div>
      </article>

      <ol className="space-y-2">
        {questions.slice(0, 5).map((q) => {
          const done = state.completedIndexes.includes(q.sprintIndex);
          return (
            <li
              key={q.sprintIndex}
              className={`rounded-lg border px-3 py-2 text-xs ${
                q.sprintIndex === state.activeIndex
                  ? "border-violet-400 bg-violet-50/50 font-bold"
                  : done
                    ? "border-emerald-200 bg-emerald-50/40 opacity-80"
                    : "border-[var(--ep-border)]"
              }`}
            >
              {done ? "✓ " : ""}
              Q{q.sprintIndex}: {q.questionTitle.slice(0, 72)}
              {q.questionTitle.length > 72 ? "…" : ""}
            </li>
          );
        })}
      </ol>

      <Link
        href={epDebatePrepDayBlockHref(DAY5_ID, "b5-sos-sprint")}
        className="inline-block text-xs font-bold text-[var(--ep-navy)] underline"
      >
        ← Return to SOS sprint block study
      </Link>
    </section>
  );
}
