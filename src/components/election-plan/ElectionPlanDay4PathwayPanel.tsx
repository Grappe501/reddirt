"use client";

import Link from "next/link";

import { ElectionPlanDay4PathwayProgressBar } from "@/components/election-plan/ElectionPlanDay4PathwayProgressBar";
import { KellyPageSummary } from "@/components/election-plan/KellyPageSummary";
import {
  buildDay4PathwaySteps,
  DAY4_DAY5_TEASER,
  DAY4_EVENING_REVIEW,
  DAY4_MINIMUM_BLOCK_IDS,
  getFirstDay4PathwayStep,
  type Day4PathwayStep,
} from "@/lib/election-plan/day4-learning-pathway";
import {
  DAY4_FORUM_INTERNAL_INTEL_LABEL,
  DAY4_V3_KELLY_MINIMUM_SUMMARY,
} from "@/lib/election-plan/debate-prep-day4-forum-intelligence-copy";
import {
  DEBATE_PREP_DAY4_RELEASE_LABEL,
  DEBATE_PREP_DAY4_RELEASE_VERSION,
} from "@/lib/election-plan/debate-prep-day4-release";
import { epDebatePrepDayHref } from "@/lib/election-plan/debate-prep-links";
import { DAY4_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import { getDebateWeekIntensiveDay } from "@/lib/intelligence/v4/debateWeekIntensive2026";
import { getDayDeepOverlay } from "@/lib/intelligence/v4/debateWeekIntensive2026Deep";

function stepIcon(kind: Day4PathwayStep["kind"]): string {
  if (kind === "block") return "Block";
  if (kind === "rehearsal") return "Say aloud";
  if (kind === "micro-lesson") return "Lesson";
  if (kind === "example") return "Optional";
  return "Close";
}

export function ElectionPlanDay4StartCard() {
  const first = getFirstDay4PathwayStep();
  const plan = getDebateWeekIntensiveDay(DAY4_ID)!;
  const overlay = getDayDeepOverlay(DAY4_ID);

  return (
    <section className="ep-pathway-start mb-8">
      <p className="ep-pathway-start-eyebrow text-violet-700">Day 4 · forum intelligence lab</p>
      <h2 className="mt-2 font-heading text-xl font-bold text-[var(--ep-navy)]">{plan.title}</h2>
      <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{plan.subtitle}</p>
      <KellyPageSummary summary={DAY4_V3_KELLY_MINIMUM_SUMMARY} />
      <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 text-xs text-amber-950">
        {DAY4_FORUM_INTERNAL_INTEL_LABEL}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="ep-pathway-chip ep-pathway-chip-strength">Strength · {overlay.kellyStrengthToday}</span>
        <span className="ep-pathway-chip ep-pathway-chip-watch">Watch out · {overlay.kellyWatchOut}</span>
      </div>
      <Link href={first.href} className="ep-btn ep-btn-primary ep-btn-block-sm-auto mt-5">
        Start forum lab · {first.minutes} min →
      </Link>
      <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">
        Minimum tonight: forum lab ingest only ({DAY4_MINIMUM_BLOCK_IDS.length} block). SOS map and bios re-read roll to
        Monday if tired.
      </p>
      <p className="mt-2 text-[10px] font-mono text-[var(--ep-navy-muted)]">
        {DEBATE_PREP_DAY4_RELEASE_VERSION} · {DEBATE_PREP_DAY4_RELEASE_LABEL}
      </p>
    </section>
  );
}

export function ElectionPlanDay4PathwayHubCard() {
  const first = getFirstDay4PathwayStep();

  return (
    <section className="ep-card mb-8 border-2 border-violet-300 bg-white p-6">
      <ElectionPlanDay4PathwayProgressBar compact />

      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href={first.href}
          className="inline-block w-full rounded-full bg-[var(--ep-navy)] px-6 py-3 text-center text-sm font-bold text-white sm:w-auto"
        >
          {first.label} →
        </Link>
        <Link
          href={epDebatePrepDayHref(DAY4_ID)}
          className="inline-block rounded-full border border-[var(--ep-navy)] px-6 py-3 text-sm font-bold text-[var(--ep-navy)]"
        >
          Day 4 overview
        </Link>
      </div>

      <p className="mt-4 text-xs text-[var(--ep-navy-muted)]">
        Optional forum integrity example does not block completion. Kelly&apos;s notecard gets claims-gated lines only
        — raw analysis stays richer behind the scenes until verified.
      </p>
    </section>
  );
}

export function ElectionPlanDay4PathwayPanel({
  activeStepId,
  showFullList = true,
  showDay5Teaser = true,
}: {
  activeStepId?: string;
  showFullList?: boolean;
  showDay5Teaser?: boolean;
}) {
  const steps = buildDay4PathwaySteps();
  const activeIdx = activeStepId ? steps.findIndex((s) => s.id === activeStepId) : -1;
  const overlay = getDayDeepOverlay(DAY4_ID);

  return (
    <section className="mb-8">
      <ElectionPlanDay4PathwayProgressBar activeStepId={activeStepId} />

      <div className="mb-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-900">
          Strength · {overlay.kellyStrengthToday}
        </span>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
          Watch out · {overlay.kellyWatchOut}
        </span>
      </div>

      <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2 text-xs text-amber-950">
        {DAY4_FORUM_INTERNAL_INTEL_LABEL}
      </p>

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
                  className={`ep-card ep-card-interactive flex items-center justify-between gap-3 p-4 text-sm ${
                    isActive ? "ring-2 ring-violet-500 ring-offset-2" : isPast ? "opacity-70" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase text-violet-900">{stepIcon(step.kind)}</p>
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

      {showDay5Teaser ? (
        <>
          <article className="ep-card mt-6 border-violet-200 bg-violet-50/40 p-5 text-sm">
            <p className="text-xs font-bold uppercase text-violet-900">Evening check — before you stop</p>
            <ul className="mt-3 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
              {DAY4_EVENING_REVIEW.map((line) => (
                <li key={line.slice(0, 40)}>{line}</li>
              ))}
            </ul>
          </article>

          <Link
            href={DAY4_DAY5_TEASER.href}
            className="ep-card mt-4 block border-emerald-200 bg-emerald-50/40 p-5 text-sm transition hover:border-emerald-400"
          >
            <p className="text-xs font-bold uppercase text-emerald-900">You are ready for Day 5</p>
            <p className="mt-2 font-heading text-lg font-bold text-[var(--ep-navy)]">{DAY4_DAY5_TEASER.title}</p>
            <p className="mt-2 text-[var(--ep-navy-muted)]">{DAY4_DAY5_TEASER.body}</p>
            <p className="mt-3 text-xs font-bold text-[var(--ep-navy)]">Preview Day 5 →</p>
          </Link>
        </>
      ) : null}
    </section>
  );
}
