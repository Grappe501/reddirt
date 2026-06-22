"use client";

import Link from "next/link";

import { ElectionPlanDay3PathwayProgressBar } from "@/components/election-plan/ElectionPlanDay3PathwayProgressBar";
import { KellyPageSummary } from "@/components/election-plan/KellyPageSummary";
import {
  buildDay3PathwaySteps,
  DAY3_DAY4_TEASER,
  DAY3_EVENING_REVIEW,
  DAY3_MINIMUM_BLOCK_IDS,
  getFirstDay3PathwayStep,
  type Day3PathwayStep,
} from "@/lib/election-plan/day3-learning-pathway";
import {
  DEBATE_PREP_DAY3_RELEASE_LABEL,
  DEBATE_PREP_DAY3_RELEASE_VERSION,
} from "@/lib/election-plan/debate-prep-day3-release";
import { DAY3_V3_KELLY_MINIMUM_SUMMARY } from "@/lib/election-plan/debate-prep-norris-coalition-copy";
import { epDebatePrepDayHref } from "@/lib/election-plan/debate-prep-links";
import { DAY3_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import { getDebateWeekIntensiveDay } from "@/lib/intelligence/v4/debateWeekIntensive2026";
import { getDayDeepOverlay } from "@/lib/intelligence/v4/debateWeekIntensive2026Deep";

function stepIcon(kind: Day3PathwayStep["kind"]): string {
  if (kind === "block") return "Block";
  if (kind === "rehearsal") return "Say aloud";
  if (kind === "drill") return "Drill";
  if (kind === "example") return "Optional";
  return "Close";
}

export function ElectionPlanDay3StartCard() {
  const first = getFirstDay3PathwayStep();
  const plan = getDebateWeekIntensiveDay(DAY3_ID)!;
  const overlay = getDayDeepOverlay(DAY3_ID);

  return (
    <section className="ep-card mb-8 border-2 border-emerald-300 bg-emerald-50/20 p-6">
      <p className="text-xs font-bold uppercase text-emerald-900">Day 3 · superiority map</p>
      <h2 className="mt-2 font-heading text-xl font-bold text-[var(--ep-navy)]">{plan.title}</h2>
      <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{plan.subtitle}</p>
      <KellyPageSummary summary={DAY3_V3_KELLY_MINIMUM_SUMMARY} />
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900">
          Strength · {overlay.kellyStrengthToday}
        </span>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
          Watch out · {overlay.kellyWatchOut}
        </span>
      </div>
      <Link
        href={first.href}
        className="mt-4 inline-block w-full rounded-full bg-[var(--ep-navy)] px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-[var(--ep-navy)]/90 sm:w-auto"
      >
        Start block 1 · {first.minutes} min →
      </Link>
      <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">
        Minimum tonight: manual/framework + claims gate ({DAY3_MINIMUM_BLOCK_IDS.length} blocks).
      </p>
      <p className="mt-2 text-[10px] font-mono text-[var(--ep-navy-muted)]">
        {DEBATE_PREP_DAY3_RELEASE_VERSION} · {DEBATE_PREP_DAY3_RELEASE_LABEL}
      </p>
    </section>
  );
}

export function ElectionPlanDay3PathwayHubCard() {
  const first = getFirstDay3PathwayStep();

  return (
    <section className="ep-card mb-8 border-2 border-emerald-300 bg-white p-6">
      <ElectionPlanDay3PathwayProgressBar compact />

      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href={first.href}
          className="inline-block w-full rounded-full bg-[var(--ep-navy)] px-6 py-3 text-center text-sm font-bold text-white sm:w-auto"
        >
          {first.label} →
        </Link>
        <Link
          href={epDebatePrepDayHref(DAY3_ID)}
          className="inline-block rounded-full border border-[var(--ep-navy)] px-6 py-3 text-sm font-bold text-[var(--ep-navy)]"
        >
          Day 3 overview
        </Link>
      </div>

      <p className="mt-4 text-xs text-[var(--ep-navy-muted)]">
        Optional Hammer admin example does not block completion. Offense and funding blocks can roll to morning if tired
        after manual + claims.
      </p>
    </section>
  );
}

export function ElectionPlanDay3PathwayPanel({
  activeStepId,
  showFullList = true,
  showDay4Teaser = false,
}: {
  activeStepId?: string;
  showFullList?: boolean;
  showDay4Teaser?: boolean;
}) {
  const steps = buildDay3PathwaySteps();
  const activeIdx = activeStepId ? steps.findIndex((s) => s.id === activeStepId) : -1;
  const overlay = getDayDeepOverlay(DAY3_ID);

  return (
    <section className="mb-8">
      <ElectionPlanDay3PathwayProgressBar activeStepId={activeStepId} />

      <div className="mb-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900">
          Strength · {overlay.kellyStrengthToday}
        </span>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
          Watch out · {overlay.kellyWatchOut}
        </span>
      </div>

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
                    isActive ? "border-2 border-emerald-400" : isPast ? "opacity-70" : "hover:border-emerald-300/50"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase text-emerald-900">{stepIcon(step.kind)}</p>
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

      {showDay4Teaser ? (
        <>
          <article className="ep-card mt-6 border-emerald-200 bg-emerald-50/40 p-5 text-sm">
            <p className="text-xs font-bold uppercase text-emerald-900">Evening check — before you stop</p>
            <ul className="mt-3 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
              {DAY3_EVENING_REVIEW.map((line) => (
                <li key={line.slice(0, 40)}>{line}</li>
              ))}
            </ul>
          </article>

          <Link
            href={DAY3_DAY4_TEASER.href}
            className="ep-card mt-4 block border-violet-200 bg-violet-50/40 p-5 text-sm transition hover:border-violet-400"
          >
            <p className="text-xs font-bold uppercase text-violet-900">You are ready for Day 4</p>
            <p className="mt-2 font-heading text-lg font-bold text-[var(--ep-navy)]">{DAY3_DAY4_TEASER.title}</p>
            <p className="mt-2 text-[var(--ep-navy-muted)]">{DAY3_DAY4_TEASER.body}</p>
            <p className="mt-3 text-xs font-bold text-[var(--ep-navy)]">Preview Day 4 →</p>
          </Link>
        </>
      ) : null}
    </section>
  );
}
