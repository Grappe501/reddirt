"use client";

import Link from "next/link";

import { ElectionPlanDay7PathwayProgressBar } from "@/components/election-plan/ElectionPlanDay7PathwayProgressBar";
import { KellyPageSummary } from "@/components/election-plan/KellyPageSummary";
import {
  buildDay7PathwaySteps,
  DAY7_DAY6_REVIEW,
  DAY7_DAY8_TEASER,
  DAY7_EVENING_REVIEW,
  DAY7_MINIMUM_BLOCK_IDS,
  getFirstDay7PathwayStep,
  type Day7PathwayStep,
} from "@/lib/election-plan/day7-learning-pathway";
import {
  DAY7_CLOSING_BEATS,
  DAY7_CUT_DONT_ADD,
  DAY7_DEBRIEF_IMPORT_LABEL,
  DAY7_HUB_TONIGHT_SUMMARY,
  DAY7_OPENING_BEATS,
  DAY7_PEAK_END_FRAME,
  DAY7_POLISH_CLAIMS_GATE,
  DAY7_QUOTABLE_RULE,
  DAY7_V3_KELLY_MINIMUM_SUMMARY,
} from "@/lib/election-plan/debate-prep-day7-polish-copy";
import {
  DEBATE_PREP_DAY7_RELEASE_LABEL,
  DEBATE_PREP_DAY7_RELEASE_VERSION,
} from "@/lib/election-plan/debate-prep-day7-release";
import { epDebatePrepDayHref } from "@/lib/election-plan/debate-prep-links";
import { DAY7_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import { getDebateWeekIntensiveDay } from "@/lib/intelligence/v4/debateWeekIntensive2026";
import { getDayDeepOverlay } from "@/lib/intelligence/v4/debateWeekIntensive2026Deep";

function stepIcon(kind: Day7PathwayStep["kind"]): string {
  if (kind === "block") return "Block";
  if (kind === "rehearsal") return "Say aloud";
  if (kind === "micro-lesson") return "Lesson";
  if (kind === "command-drill") return "Drill";
  if (kind === "example") return "Optional";
  return "Close";
}

export function ElectionPlanDay7StartCard() {
  const first = getFirstDay7PathwayStep();
  const plan = getDebateWeekIntensiveDay(DAY7_ID)!;
  const overlay = getDayDeepOverlay(DAY7_ID);

  return (
    <section className="ep-pathway-start mb-8">
      <p className="ep-pathway-start-eyebrow text-rose-800">Day 7 · refine &amp; steal the show · debate eve polish</p>
      <h2 className="mt-2 font-heading text-xl font-bold text-[var(--ep-navy)]">{plan.title}</h2>
      <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{plan.subtitle}</p>
      <KellyPageSummary summary={DAY7_V3_KELLY_MINIMUM_SUMMARY} />
      <p className="mt-3 rounded-lg border border-rose-300/60 bg-rose-50/40 px-3 py-2 text-xs text-rose-950">
        {DAY7_PEAK_END_FRAME}
      </p>
      <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 text-xs text-amber-950">
        {DAY7_POLISH_CLAIMS_GATE[0]}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="ep-pathway-chip ep-pathway-chip-strength">Strength · {overlay.kellyStrengthToday}</span>
        <span className="ep-pathway-chip ep-pathway-chip-watch">Watch out · {overlay.kellyWatchOut}</span>
      </div>
      <Link href={first.href} className="ep-btn ep-btn-primary ep-btn-block-sm-auto mt-5">
        Start bookends polish · {first.minutes} min →
      </Link>
      <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">
        Minimum tonight: {DAY7_MINIMUM_BLOCK_IDS.join(", ")} — three reps each bookend; optional show-steal example
        does not block completion.
      </p>
      <p className="mt-2 text-[10px] font-mono text-[var(--ep-navy-muted)]">
        {DEBATE_PREP_DAY7_RELEASE_VERSION} · {DEBATE_PREP_DAY7_RELEASE_LABEL}
      </p>
    </section>
  );
}

export function ElectionPlanDay7PathwayHubCard() {
  const first = getFirstDay7PathwayStep();

  return (
    <section className="ep-card mb-8 border-2 border-rose-300 bg-white p-6">
      <ElectionPlanDay7PathwayProgressBar compact />

      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href={first.href}
          className="inline-block w-full rounded-full bg-[var(--ep-navy)] px-6 py-3 text-center text-sm font-bold text-white sm:w-auto"
        >
          {first.label} →
        </Link>
        <Link
          href={epDebatePrepDayHref(DAY7_ID)}
          className="inline-block rounded-full border border-[var(--ep-navy)] px-6 py-3 text-sm font-bold text-[var(--ep-navy)]"
        >
          Day 7 overview
        </Link>
      </div>

      <p className="mt-4 text-xs text-[var(--ep-navy-muted)]">{DAY7_CUT_DONT_ADD}</p>
      <p className="mt-2 text-xs text-rose-900">{DAY7_HUB_TONIGHT_SUMMARY}</p>
    </section>
  );
}

export function ElectionPlanDay7PathwayPanel({
  activeStepId,
  showFullList = true,
  showDay6Review = true,
  showDay8Teaser = true,
}: {
  activeStepId?: string;
  showFullList?: boolean;
  showDay6Review?: boolean;
  showDay8Teaser?: boolean;
}) {
  const steps = buildDay7PathwaySteps();
  const activeIdx = activeStepId ? steps.findIndex((s) => s.id === activeStepId) : -1;
  const overlay = getDayDeepOverlay(DAY7_ID);

  return (
    <section className="mb-8">
      <ElectionPlanDay7PathwayProgressBar activeStepId={activeStepId} />

      <div className="mb-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-900">
          Strength · {overlay.kellyStrengthToday}
        </span>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
          Watch out · {overlay.kellyWatchOut}
        </span>
      </div>

      <p className="mb-4 rounded-lg border border-rose-300/60 bg-rose-50/40 px-3 py-2 text-xs text-rose-950">
        {DAY7_DEBRIEF_IMPORT_LABEL}
      </p>

      <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2 text-xs text-amber-950">
        {DAY7_QUOTABLE_RULE}
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
                    isActive ? "ring-2 ring-rose-500 ring-offset-2" : isPast ? "opacity-70" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase text-rose-900">
                      {stepIcon(step.kind)}
                      {optional ? " · skip if tired" : ""}
                    </p>
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

      <article className="ep-card mt-6 border-rose-200 bg-rose-50/30 p-5 text-sm">
        <p className="text-xs font-bold uppercase text-rose-900">Bookends beat spine</p>
        <p className="mt-2 text-[10px] font-bold uppercase text-[var(--ep-navy-muted)]">Opening · 90s</p>
        <ol className="mt-2 list-inside list-decimal space-y-1 text-xs text-[var(--ep-navy-muted)]">
          {DAY7_OPENING_BEATS.map((b) => (
            <li key={b.beat}>
              Beat {b.beat}: {b.objective} ({b.source})
            </li>
          ))}
        </ol>
        <p className="mt-4 text-[10px] font-bold uppercase text-[var(--ep-navy-muted)]">Closing · 60s</p>
        <ol className="mt-2 list-inside list-decimal space-y-1 text-xs text-[var(--ep-navy-muted)]">
          {DAY7_CLOSING_BEATS.map((b) => (
            <li key={b.beat}>
              Beat {b.beat}: {b.objective} ({b.source})
            </li>
          ))}
        </ol>
      </article>

      {showDay6Review ? (
        <details className="ep-card mt-6 p-5 text-sm">
          <summary className="cursor-pointer font-heading text-base font-bold text-[var(--ep-navy)]">
            {DAY7_DAY6_REVIEW.title}
          </summary>
          <p className="mt-3 text-[var(--ep-navy-muted)]">{DAY7_DAY6_REVIEW.body}</p>
          <Link href={DAY7_DAY6_REVIEW.href} className="mt-3 inline-block text-xs font-bold text-[var(--ep-navy)] underline">
            Review Day 6 simulation debrief →
          </Link>
        </details>
      ) : null}

      <article className="ep-card mt-6 border-rose-200 bg-rose-50/40 p-5 text-sm">
        <p className="text-xs font-bold uppercase text-rose-900">Evening check — before you stop</p>
        <ul className="mt-3 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
          {DAY7_EVENING_REVIEW.map((line) => (
            <li key={line.slice(0, 40)}>{line}</li>
          ))}
        </ul>
      </article>

      {showDay8Teaser ? (
        <Link
          href={DAY7_DAY8_TEASER.href}
          className="ep-card mt-4 block border-rose-200 bg-rose-50/40 p-5 text-sm transition hover:border-rose-400"
        >
          <p className="text-xs font-bold uppercase text-rose-900">Preview tomorrow</p>
          <p className="mt-2 font-heading text-lg font-bold text-[var(--ep-navy)]">{DAY7_DAY8_TEASER.title}</p>
          <p className="mt-2 text-[var(--ep-navy-muted)]">{DAY7_DAY8_TEASER.body}</p>
          <p className="mt-3 text-xs font-bold text-[var(--ep-navy)]">Preview Debate Day →</p>
        </Link>
      ) : null}
    </section>
  );
}
