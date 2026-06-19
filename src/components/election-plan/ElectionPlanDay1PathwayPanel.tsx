import Link from "next/link";

import { KellyPageSummary } from "@/components/election-plan/KellyPageSummary";
import {
  buildDay1PathwaySteps,
  DAY1_DAY2_TEASER,
  DAY1_EVENING_REVIEW,
  DAY1_MINIMUM_BLOCK_IDS,
  getFirstDay1PathwayStep,
  type Day1PathwayStep,
} from "@/lib/election-plan/day1-learning-pathway";
import { epDebatePrepDayHref } from "@/lib/election-plan/debate-prep-links";
import { DAY1_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import { getDebateWeekIntensiveDay } from "@/lib/intelligence/v4/debateWeekIntensive2026";

function stepIcon(kind: Day1PathwayStep["kind"]): string {
  if (kind === "block") return "Block";
  if (kind === "rehearsal") return "Say aloud";
  if (kind === "drill") return "Drill";
  if (kind === "example") return "Optional";
  return "Close";
}

export function ElectionPlanDay1StartCard() {
  const first = getFirstDay1PathwayStep();
  const plan = getDebateWeekIntensiveDay(DAY1_ID)!;

  return (
    <section className="ep-card mb-8 border-2 border-[var(--ep-gold)] bg-[var(--ep-cream)]/50 p-6">
      <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">Day 1 · start here</p>
      <h2 className="mt-2 font-heading text-xl font-bold text-[var(--ep-navy)]">{plan.title}</h2>
      <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{plan.subtitle}</p>
      <KellyPageSummary summary="~4 hours if you do everything — or finish posture + author/administrator and stop. That is a successful Day 1." />
      <Link
        href={first.href}
        className="mt-4 inline-block rounded-full bg-[var(--ep-navy)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[var(--ep-navy)]/90"
      >
        Start block 1 · {first.minutes} min →
      </Link>
      <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">
        Minimum tonight: posture + author/administrator ({DAY1_MINIMUM_BLOCK_IDS.length} blocks).
      </p>
    </section>
  );
}

export function ElectionPlanDay1PathwayPanel({
  activeStepId,
  showFullList = true,
  showDay2Teaser = false,
}: {
  activeStepId?: string;
  showFullList?: boolean;
  showDay2Teaser?: boolean;
}) {
  const steps = buildDay1PathwaySteps();
  const activeIdx = activeStepId ? steps.findIndex((s) => s.id === activeStepId) : -1;

  return (
    <section className="mb-8">
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
                  className={`ep-card flex items-center justify-between gap-3 p-4 text-sm transition ${
                    isActive ? "border-2 border-[var(--ep-gold)]" : isPast ? "opacity-70" : "hover:border-[var(--ep-gold)]/50"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase text-violet-900">{stepIcon(step.kind)}</p>
                    <p className="font-bold text-[var(--ep-navy)]">{step.label}</p>
                    {!isActive ? <p className="mt-1 truncate text-xs text-[var(--ep-navy-muted)]">{step.teaser}</p> : null}
                  </div>
                  <span className="shrink-0 font-mono text-xs text-[var(--ep-navy-muted)]">{step.minutes}m →</span>
                </Link>
              </li>
            );
          })}
        </ol>
      ) : null}

      {showDay2Teaser ? (
        <>
          <article className="ep-card mt-6 border-emerald-200 bg-emerald-50/40 p-5 text-sm">
            <p className="text-xs font-bold uppercase text-emerald-900">Evening check — before you stop</p>
            <ul className="mt-3 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
              {DAY1_EVENING_REVIEW.map((line) => (
                <li key={line.slice(0, 40)}>{line}</li>
              ))}
            </ul>
          </article>

          <Link
            href={DAY1_DAY2_TEASER.href}
            className="ep-card mt-4 block border-indigo-200 bg-indigo-50/40 p-5 text-sm transition hover:border-indigo-400"
          >
            <p className="text-xs font-bold uppercase text-indigo-900">You are ready for Day 2</p>
            <p className="mt-2 font-heading text-lg font-bold text-[var(--ep-navy)]">{DAY1_DAY2_TEASER.title}</p>
            <p className="mt-2 text-[var(--ep-navy-muted)]">{DAY1_DAY2_TEASER.body}</p>
            <p className="mt-3 text-xs font-bold text-[var(--ep-navy)]">Preview Day 2 →</p>
          </Link>
        </>
      ) : null}
    </section>
  );
}

export function ElectionPlanDay1ContinueButton({
  currentStepId,
  className = "",
}: {
  currentStepId: string;
  className?: string;
}) {
  const steps = buildDay1PathwaySteps();
  const idx = steps.findIndex((s) => s.id === currentStepId);
  const next = idx >= 0 && idx < steps.length - 1 ? steps[idx + 1] : undefined;

  if (!next) {
    return (
      <Link
        href={epDebatePrepDayHref(DAY1_ID)}
        className={`inline-block rounded-full bg-emerald-800 px-6 py-3 text-sm font-bold text-white ${className}`}
      >
        Day 1 complete — evening check →
      </Link>
    );
  }

  return (
    <Link
      href={next.href}
      className={`inline-block rounded-full bg-[var(--ep-navy)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[var(--ep-navy)]/90 ${className}`}
    >
      Continue · {next.label} ({next.minutes} min) →
    </Link>
  );
}
