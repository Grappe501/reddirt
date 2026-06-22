"use client";

import Link from "next/link";

import { ElectionPlanDay2PathwayProgressBar } from "@/components/election-plan/ElectionPlanDay2PathwayProgressBar";
import { KellyPageSummary } from "@/components/election-plan/KellyPageSummary";
import {
  buildDay2PathwaySteps,
  DAY2_DAY3_TEASER,
  DAY2_EVENING_REVIEW,
  DAY2_MINIMUM_BLOCK_IDS,
  getFirstDay2PathwayStep,
  type Day2PathwayStep,
} from "@/lib/election-plan/day2-learning-pathway";
import {
  DEBATE_PREP_DAY2_RELEASE_LABEL,
  DEBATE_PREP_DAY2_RELEASE_VERSION,
} from "@/lib/election-plan/debate-prep-day2-release";
import { epDebatePrepDayHref } from "@/lib/election-plan/debate-prep-links";
import { DAY2_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import { getDebateWeekIntensiveDay } from "@/lib/intelligence/v4/debateWeekIntensive2026";

function stepIcon(kind: Day2PathwayStep["kind"]): string {
  if (kind === "block") return "Block";
  if (kind === "rehearsal") return "Say aloud";
  if (kind === "drill") return "Drill";
  if (kind === "example") return "Optional";
  return "Close";
}

export function ElectionPlanDay2StartCard() {
  const first = getFirstDay2PathwayStep();
  const plan = getDebateWeekIntensiveDay(DAY2_ID)!;

  return (
    <section className="ep-card mb-8 border-2 border-indigo-300 bg-indigo-50/20 p-6">
      <p className="text-xs font-bold uppercase text-indigo-900">Day 2 · read the table</p>
      <h2 className="mt-2 font-heading text-xl font-bold text-[var(--ep-navy)]">{plan.title}</h2>
      <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{plan.subtitle}</p>
      <KellyPageSummary summary="Watch before you counter. Five ACCA study clips + tell worksheet — trap lanes 1–2 until boring. Minimum: film clips + trap lane 1." />
      <Link
        href={first.href}
        className="mt-4 inline-block w-full rounded-full bg-[var(--ep-navy)] px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-[var(--ep-navy)]/90 sm:w-auto"
      >
        Start block 1 · {first.minutes} min →
      </Link>
      <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">
        Minimum tonight: film tells + trap lane 1 ({DAY2_MINIMUM_BLOCK_IDS.length} blocks).
      </p>
      <p className="mt-2 text-[10px] font-mono text-[var(--ep-navy-muted)]">
        {DEBATE_PREP_DAY2_RELEASE_VERSION} · {DEBATE_PREP_DAY2_RELEASE_LABEL}
      </p>
    </section>
  );
}

export function ElectionPlanDay2PathwayHubCard() {
  const first = getFirstDay2PathwayStep();

  return (
    <section className="ep-card mb-8 border-2 border-indigo-300 bg-white p-6">
      <ElectionPlanDay2PathwayProgressBar compact />

      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href={first.href}
          className="inline-block w-full rounded-full bg-[var(--ep-navy)] px-6 py-3 text-center text-sm font-bold text-white sm:w-auto"
        >
          {first.label} →
        </Link>
        <Link
          href={epDebatePrepDayHref(DAY2_ID)}
          className="inline-block rounded-full border border-[var(--ep-navy)] px-6 py-3 text-sm font-bold text-[var(--ep-navy)]"
        >
          Day 2 overview
        </Link>
      </div>

      <p className="mt-4 text-xs text-[var(--ep-navy-muted)]">
        Optional opponent examples do not block completion. Bios can roll to tomorrow if you are tired after trap lanes.
      </p>
    </section>
  );
}

export function ElectionPlanDay2PathwayPanel({
  activeStepId,
  showFullList = true,
  showDay3Teaser = false,
}: {
  activeStepId?: string;
  showFullList?: boolean;
  showDay3Teaser?: boolean;
}) {
  const steps = buildDay2PathwaySteps();
  const activeIdx = activeStepId ? steps.findIndex((s) => s.id === activeStepId) : -1;

  return (
    <section className="mb-8">
      <ElectionPlanDay2PathwayProgressBar activeStepId={activeStepId} />

      {activeStepId && activeIdx >= 0 ? (
        <p className="mb-3 text-xs font-bold uppercase text-[var(--ep-navy-muted)]">
          Step {activeIdx + 1} of {steps.length}
        </p>
      ) : null}

      {showFullList ? (
        <ol className="space-y-2">
          {steps.map((step, idx) => {
            const isActive = step.id === activeStepId;
            const isPast = activeIdx >= 0 && idx < activeIdx;
            const optional = step.kind === "example";
            return (
              <li key={step.id}>
                <Link
                  href={step.href}
                  className={`ep-card flex items-center justify-between gap-3 p-4 text-sm transition ${
                    isActive ? "border-2 border-indigo-400" : isPast ? "opacity-70" : "hover:border-indigo-300/50"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase text-indigo-900">{stepIcon(step.kind)}</p>
                    {optional ? (
                      <p className="text-[10px] font-bold uppercase text-violet-700">Optional</p>
                    ) : null}
                    <p className="font-bold text-[var(--ep-navy)]">{step.label}</p>
                    {!isActive ? (
                      <p className="mt-1 truncate text-xs text-[var(--ep-navy-muted)]">{step.teaser}</p>
                    ) : null}
                  </div>
                  <span className="shrink-0 font-mono text-xs text-[var(--ep-navy-muted)]">{step.minutes}m →</span>
                </Link>
              </li>
            );
          })}
        </ol>
      ) : null}

      {showDay3Teaser ? (
        <>
          <article className="ep-card mt-6 border-emerald-200 bg-emerald-50/40 p-5 text-sm">
            <p className="text-xs font-bold uppercase text-emerald-900">Evening check — before you stop</p>
            <ul className="mt-3 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
              {DAY2_EVENING_REVIEW.map((line) => (
                <li key={line.slice(0, 40)}>{line}</li>
              ))}
            </ul>
          </article>

          <Link
            href={DAY2_DAY3_TEASER.href}
            className="ep-card mt-4 block border-violet-200 bg-violet-50/40 p-5 text-sm transition hover:border-violet-400"
          >
            <p className="text-xs font-bold uppercase text-violet-900">You are ready for Day 3</p>
            <p className="mt-2 font-heading text-lg font-bold text-[var(--ep-navy)]">{DAY2_DAY3_TEASER.title}</p>
            <p className="mt-2 text-[var(--ep-navy-muted)]">{DAY2_DAY3_TEASER.body}</p>
            <p className="mt-3 text-xs font-bold text-[var(--ep-navy)]">Preview Day 3 →</p>
          </Link>
        </>
      ) : null}
    </section>
  );
}
