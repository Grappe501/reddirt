"use client";

import Link from "next/link";

import { ElectionPlanDay6PathwayProgressBar } from "@/components/election-plan/ElectionPlanDay6PathwayProgressBar";
import { KellyPageSummary } from "@/components/election-plan/KellyPageSummary";
import {
  buildDay6PathwaySteps,
  DAY6_DAY5_REVIEW,
  DAY6_DAY7_TEASER,
  DAY6_EVENING_REVIEW,
  DAY6_MINIMUM_BLOCK_IDS,
  getFirstDay6PathwayStep,
  type Day6PathwayStep,
} from "@/lib/election-plan/day6-learning-pathway";
import {
  DAY6_APA_SIM_FRAME,
  DAY6_HUB_TONIGHT_SUMMARY,
  DAY6_SIM_AUDIENCE_LABEL,
  DAY6_SIM_CLAIMS_GATE,
  DAY6_SIM_NO_NEW_MATERIAL_WATCHOUT,
  DAY6_SIM_SEGMENT_COUNT,
  DAY6_SIM_SEGMENT_OUTLINE,
  DAY6_V3_KELLY_MINIMUM_SUMMARY,
} from "@/lib/election-plan/debate-prep-day6-simulation-copy";
import {
  DEBATE_PREP_DAY6_RELEASE_LABEL,
  DEBATE_PREP_DAY6_RELEASE_VERSION,
} from "@/lib/election-plan/debate-prep-day6-release";
import { epDebatePrepDayHref } from "@/lib/election-plan/debate-prep-links";
import { DAY6_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import { getDebateWeekIntensiveDay } from "@/lib/intelligence/v4/debateWeekIntensive2026";
import { getDayDeepOverlay } from "@/lib/intelligence/v4/debateWeekIntensive2026Deep";

function stepIcon(kind: Day6PathwayStep["kind"]): string {
  if (kind === "block") return "Block";
  if (kind === "rehearsal") return "Say aloud";
  if (kind === "micro-lesson") return "Lesson";
  if (kind === "command-drill") return "Drill";
  return "Close";
}

export function ElectionPlanDay6StartCard() {
  const first = getFirstDay6PathwayStep();
  const plan = getDebateWeekIntensiveDay(DAY6_ID)!;
  const overlay = getDayDeepOverlay(DAY6_ID);

  return (
    <section className="ep-pathway-start mb-8">
      <p className="ep-pathway-start-eyebrow text-violet-800">Day 6 · full simulation · APA statewide broadcast</p>
      <h2 className="mt-2 font-heading text-xl font-bold text-[var(--ep-navy)]">{plan.title}</h2>
      <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{plan.subtitle}</p>
      <KellyPageSummary summary={DAY6_V3_KELLY_MINIMUM_SUMMARY} />
      <p className="mt-3 rounded-lg border border-violet-300/60 bg-violet-50/40 px-3 py-2 text-xs text-violet-950">
        {DAY6_APA_SIM_FRAME}
      </p>
      <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 text-xs text-amber-950">
        {DAY6_SIM_CLAIMS_GATE[0]}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="ep-pathway-chip ep-pathway-chip-strength">Strength · {overlay.kellyStrengthToday}</span>
        <span className="ep-pathway-chip ep-pathway-chip-watch">Watch out · {overlay.kellyWatchOut}</span>
      </div>
      <Link href={first.href} className="ep-btn ep-btn-primary ep-btn-block-sm-auto mt-5">
        Start bios lock-in · {first.minutes} min →
      </Link>
      <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">
        Minimum tonight: {DAY6_MINIMUM_BLOCK_IDS.join(", ")} — {DAY6_SIM_SEGMENT_COUNT} timed sim segments with staff as
        Hammer + Pakko.
      </p>
      <p className="mt-2 text-[10px] font-mono text-[var(--ep-navy-muted)]">
        {DEBATE_PREP_DAY6_RELEASE_VERSION} · {DEBATE_PREP_DAY6_RELEASE_LABEL}
      </p>
    </section>
  );
}

export function ElectionPlanDay6PathwayHubCard() {
  const first = getFirstDay6PathwayStep();

  return (
    <section className="ep-card mb-8 border-2 border-violet-300 bg-white p-6">
      <ElectionPlanDay6PathwayProgressBar compact />

      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href={first.href}
          className="inline-block w-full rounded-full bg-[var(--ep-navy)] px-6 py-3 text-center text-sm font-bold text-white sm:w-auto"
        >
          {first.label} →
        </Link>
        <Link
          href={epDebatePrepDayHref(DAY6_ID)}
          className="inline-block rounded-full border border-[var(--ep-navy)] px-6 py-3 text-sm font-bold text-[var(--ep-navy)]"
        >
          Day 6 overview
        </Link>
      </div>

      <p className="mt-4 text-xs text-[var(--ep-navy-muted)]">{DAY6_SIM_NO_NEW_MATERIAL_WATCHOUT}</p>
      <p className="mt-2 text-xs text-violet-900">{DAY6_HUB_TONIGHT_SUMMARY}</p>
    </section>
  );
}

export function ElectionPlanDay6PathwayPanel({
  activeStepId,
  showFullList = true,
  showDay5Review = true,
  showDay7Teaser = true,
}: {
  activeStepId?: string;
  showFullList?: boolean;
  showDay5Review?: boolean;
  showDay7Teaser?: boolean;
}) {
  const steps = buildDay6PathwaySteps();
  const activeIdx = activeStepId ? steps.findIndex((s) => s.id === activeStepId) : -1;
  const overlay = getDayDeepOverlay(DAY6_ID);

  return (
    <section className="mb-8">
      <ElectionPlanDay6PathwayProgressBar activeStepId={activeStepId} />

      <div className="mb-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-900">
          Strength · {overlay.kellyStrengthToday}
        </span>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
          Watch out · {overlay.kellyWatchOut}
        </span>
      </div>

      <p className="mb-4 rounded-lg border border-violet-300/60 bg-violet-50/40 px-3 py-2 text-xs text-violet-950">
        {DAY6_SIM_AUDIENCE_LABEL}
      </p>

      <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2 text-xs text-amber-950">
        {DAY6_SIM_CLAIMS_GATE[1]}
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

      <article className="ep-card mt-6 border-violet-200 bg-violet-50/30 p-5 text-sm">
        <p className="text-xs font-bold uppercase text-violet-900">Sim script spine · {DAY6_SIM_SEGMENT_COUNT} segments</p>
        <ol className="mt-3 list-inside list-decimal space-y-1 text-xs text-[var(--ep-navy-muted)]">
          {DAY6_SIM_SEGMENT_OUTLINE.map((seg, i) => (
            <li key={`${seg.label}-${i}`}>
              {seg.label} · {seg.timedMinutes}m · {seg.staffRole}
            </li>
          ))}
        </ol>
      </article>

      {showDay5Review ? (
        <details className="ep-card mt-6 p-5 text-sm">
          <summary className="cursor-pointer font-heading text-base font-bold text-[var(--ep-navy)]">
            {DAY6_DAY5_REVIEW.title}
          </summary>
          <p className="mt-3 text-[var(--ep-navy-muted)]">{DAY6_DAY5_REVIEW.body}</p>
          <Link href={DAY6_DAY5_REVIEW.href} className="mt-3 inline-block text-xs font-bold text-[var(--ep-navy)] underline">
            Review Day 5 capitalize sheet →
          </Link>
        </details>
      ) : null}

      <article className="ep-card mt-6 border-violet-200 bg-violet-50/40 p-5 text-sm">
        <p className="text-xs font-bold uppercase text-violet-900">Evening check — before you stop</p>
        <ul className="mt-3 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
          {DAY6_EVENING_REVIEW.map((line) => (
            <li key={line.slice(0, 40)}>{line}</li>
          ))}
        </ul>
      </article>

      {showDay7Teaser ? (
        <Link
          href={DAY6_DAY7_TEASER.href}
          className="ep-card mt-4 block border-violet-200 bg-violet-50/40 p-5 text-sm transition hover:border-violet-400"
        >
          <p className="text-xs font-bold uppercase text-violet-900">Preview tomorrow</p>
          <p className="mt-2 font-heading text-lg font-bold text-[var(--ep-navy)]">{DAY6_DAY7_TEASER.title}</p>
          <p className="mt-2 text-[var(--ep-navy-muted)]">{DAY6_DAY7_TEASER.body}</p>
          <p className="mt-3 text-xs font-bold text-[var(--ep-navy)]">Preview Day 7 →</p>
        </Link>
      ) : null}
    </section>
  );
}
