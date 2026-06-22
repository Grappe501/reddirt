"use client";

import Link from "next/link";

import { ElectionPlanDay5PathwayProgressBar } from "@/components/election-plan/ElectionPlanDay5PathwayProgressBar";
import { KellyPageSummary } from "@/components/election-plan/KellyPageSummary";
import {
  buildDay5PathwaySteps,
  DAY5_DAY4_REVIEW,
  DAY5_DAY6_TEASER,
  DAY5_EVENING_REVIEW,
  DAY5_MINIMUM_BLOCK_IDS,
  getFirstDay5PathwayStep,
  type Day5PathwayStep,
} from "@/lib/election-plan/day5-learning-pathway";
import {
  DAY5_APA_STATEWIDE_BROADCAST_FRAME,
  DAY5_HUB_TONIGHT_SUMMARY,
  DAY5_NO_NEW_STATS_WATCHOUT,
  DAY5_V3_KELLY_MINIMUM_SUMMARY,
  DAY5_WHEN_X_SAY_Y_CLAIMS_GATE,
} from "@/lib/election-plan/debate-prep-day5-anticipate-copy";
import {
  DEBATE_PREP_DAY5_RELEASE_LABEL,
  DEBATE_PREP_DAY5_RELEASE_VERSION,
} from "@/lib/election-plan/debate-prep-day5-release";
import { epDebatePrepDayHref } from "@/lib/election-plan/debate-prep-links";
import { DAY5_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import { getDebateWeekIntensiveDay } from "@/lib/intelligence/v4/debateWeekIntensive2026";
import { getDayDeepOverlay } from "@/lib/intelligence/v4/debateWeekIntensive2026Deep";

function stepIcon(kind: Day5PathwayStep["kind"]): string {
  if (kind === "block") return "Block";
  if (kind === "rehearsal") return "Say aloud";
  if (kind === "micro-lesson") return "Lesson";
  if (kind === "command-drill") return "Drill";
  if (kind === "example") return "Optional";
  return "Close";
}

export function ElectionPlanDay5StartCard() {
  const first = getFirstDay5PathwayStep();
  const plan = getDebateWeekIntensiveDay(DAY5_ID)!;
  const overlay = getDayDeepOverlay(DAY5_ID);

  return (
    <section className="ep-pathway-start mb-8">
      <p className="ep-pathway-start-eyebrow text-emerald-800">Day 5 · anticipate & capitalize · APA statewide broadcast</p>
      <h2 className="mt-2 font-heading text-xl font-bold text-[var(--ep-navy)]">{plan.title}</h2>
      <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{plan.subtitle}</p>
      <KellyPageSummary summary={DAY5_V3_KELLY_MINIMUM_SUMMARY} />
      <p className="mt-3 rounded-lg border border-violet-300/60 bg-violet-50/40 px-3 py-2 text-xs text-violet-950">
        {DAY5_APA_STATEWIDE_BROADCAST_FRAME}
      </p>
      <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 text-xs text-amber-950">
        {DAY5_WHEN_X_SAY_Y_CLAIMS_GATE[0]}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="ep-pathway-chip ep-pathway-chip-strength">Strength · {overlay.kellyStrengthToday}</span>
        <span className="ep-pathway-chip ep-pathway-chip-watch">Watch out · {overlay.kellyWatchOut}</span>
      </div>
      <Link href={first.href} className="ep-btn ep-btn-primary ep-btn-block-sm-auto mt-5">
        Start capitalize sheet · {first.minutes} min →
      </Link>
      <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">
        Minimum tonight: {DAY5_MINIMUM_BLOCK_IDS.join(", ")} — eight when-X-say-Y pairs from Day 4 green lines only.
      </p>
      <p className="mt-2 text-[10px] font-mono text-[var(--ep-navy-muted)]">
        {DEBATE_PREP_DAY5_RELEASE_VERSION} · {DEBATE_PREP_DAY5_RELEASE_LABEL}
      </p>
    </section>
  );
}

export function ElectionPlanDay5PathwayHubCard() {
  const first = getFirstDay5PathwayStep();

  return (
    <section className="ep-card mb-8 border-2 border-emerald-300 bg-white p-6">
      <ElectionPlanDay5PathwayProgressBar compact />

      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href={first.href}
          className="inline-block w-full rounded-full bg-[var(--ep-navy)] px-6 py-3 text-center text-sm font-bold text-white sm:w-auto"
        >
          {first.label} →
        </Link>
        <Link
          href={epDebatePrepDayHref(DAY5_ID)}
          className="inline-block rounded-full border border-[var(--ep-navy)] px-6 py-3 text-sm font-bold text-[var(--ep-navy)]"
        >
          Day 5 overview
        </Link>
      </div>

      <p className="mt-4 text-xs text-[var(--ep-navy-muted)]">
        {DAY5_NO_NEW_STATS_WATCHOUT} Optional pile-on example does not block completion.
      </p>
      <p className="mt-2 text-xs text-violet-900">{DAY5_HUB_TONIGHT_SUMMARY}</p>
    </section>
  );
}

export function ElectionPlanDay5PathwayPanel({
  activeStepId,
  showFullList = true,
  showDay4Review = true,
  showDay6Teaser = true,
}: {
  activeStepId?: string;
  showFullList?: boolean;
  showDay4Review?: boolean;
  showDay6Teaser?: boolean;
}) {
  const steps = buildDay5PathwaySteps();
  const activeIdx = activeStepId ? steps.findIndex((s) => s.id === activeStepId) : -1;
  const overlay = getDayDeepOverlay(DAY5_ID);

  return (
    <section className="mb-8">
      <ElectionPlanDay5PathwayProgressBar activeStepId={activeStepId} />

      <div className="mb-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900">
          Strength · {overlay.kellyStrengthToday}
        </span>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
          Watch out · {overlay.kellyWatchOut}
        </span>
      </div>

      <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2 text-xs text-amber-950">
        {DAY5_WHEN_X_SAY_Y_CLAIMS_GATE[1]}
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
                    isActive ? "ring-2 ring-emerald-500 ring-offset-2" : isPast ? "opacity-70" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase text-emerald-900">{stepIcon(step.kind)}</p>
                    {optional ? (
                      <p className="text-[10px] font-bold uppercase text-emerald-700">Optional</p>
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

      {showDay4Review ? (
        <details className="ep-card mt-6 p-5 text-sm">
          <summary className="cursor-pointer font-heading text-base font-bold text-[var(--ep-navy)]">
            {DAY5_DAY4_REVIEW.title}
          </summary>
          <p className="mt-3 text-[var(--ep-navy-muted)]">{DAY5_DAY4_REVIEW.body}</p>
          <Link href={DAY5_DAY4_REVIEW.href} className="mt-3 inline-block text-xs font-bold text-[var(--ep-navy)] underline">
            Review Day 4 forum intel →
          </Link>
        </details>
      ) : null}

      <article className="ep-card mt-6 border-emerald-200 bg-emerald-50/40 p-5 text-sm">
        <p className="text-xs font-bold uppercase text-emerald-900">Evening check — before you stop</p>
        <ul className="mt-3 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
          {DAY5_EVENING_REVIEW.map((line) => (
            <li key={line.slice(0, 40)}>{line}</li>
          ))}
        </ul>
      </article>

      {showDay6Teaser ? (
        <Link
          href={DAY5_DAY6_TEASER.href}
          className="ep-card mt-4 block border-emerald-200 bg-emerald-50/40 p-5 text-sm transition hover:border-emerald-400"
        >
          <p className="text-xs font-bold uppercase text-emerald-900">You are ready for Day 6</p>
          <p className="mt-2 font-heading text-lg font-bold text-[var(--ep-navy)]">{DAY5_DAY6_TEASER.title}</p>
          <p className="mt-2 text-[var(--ep-navy-muted)]">{DAY5_DAY6_TEASER.body}</p>
          <p className="mt-3 text-xs font-bold text-[var(--ep-navy)]">Preview Day 6 →</p>
        </Link>
      ) : null}
    </section>
  );
}
