import Link from "next/link";

import {
  buildDay5PathwaySteps,
  DAY5_DAY4_REVIEW,
  DAY5_DAY6_TEASER,
  DAY5_EVENING_REVIEW,
  DAY5_MINIMUM_BLOCK_IDS,
  isDay5PathwayStepOptional,
} from "@/lib/election-plan/day5-learning-pathway";
import { DEBATE_PREP_DAY5_RELEASE_VERSION } from "@/lib/election-plan/debate-prep-day5-release";

/** Pass 1 — pathway step list until Pass 3 full panel ships. */
export function ElectionPlanDay5PathwayStub({
  showDay4Review = true,
  showDay6Teaser = true,
}: {
  showDay4Review?: boolean;
  showDay6Teaser?: boolean;
}) {
  const steps = buildDay5PathwaySteps();

  return (
    <section className="ep-card mb-6 p-5">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--ep-gold)]">Day 5 pathway · Pass 1</p>
      <h2 className="mt-2 font-heading text-xl font-bold text-[var(--ep-navy)]">One linear path — anticipate & capitalize</h2>
      <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
        Minimum tonight: <strong>{DAY5_MINIMUM_BLOCK_IDS.join(", ")}</strong> — eight when-X-say-Y pairs from Day 4 green
        lines only.
      </p>
      <ol className="mt-6 space-y-3">
        {steps.map((step, index) => (
          <li key={step.id}>
            <Link
              href={step.href}
              className="block rounded-lg border border-[var(--ep-border)] px-4 py-3 transition hover:border-[var(--ep-navy)]"
            >
              <p className="text-xs font-bold text-[var(--ep-gold)]">
                Step {index + 1} · ~{step.minutes} min
                {isDay5PathwayStepOptional(step.id) ? " · optional" : ""}
              </p>
              <p className="mt-1 font-semibold text-[var(--ep-navy)]">{step.label}</p>
              <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{step.teaser}</p>
            </Link>
          </li>
        ))}
      </ol>
      <div className="mt-6 rounded-lg bg-[var(--ep-surface-muted)] p-4 text-sm">
        <p className="font-bold text-[var(--ep-navy)]">Evening review</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--ep-navy-muted)]">
          {DAY5_EVENING_REVIEW.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
      {showDay4Review ? (
        <div className="mt-4 rounded-lg border border-[var(--ep-border)] p-4 text-sm">
          <p className="font-bold text-[var(--ep-navy)]">{DAY5_DAY4_REVIEW.title}</p>
          <p className="mt-2 text-[var(--ep-navy-muted)]">{DAY5_DAY4_REVIEW.body}</p>
          <Link href={DAY5_DAY4_REVIEW.href} className="mt-2 inline-block text-sm font-bold text-[var(--ep-navy)] underline">
            Review Day 4 →
          </Link>
        </div>
      ) : null}
      {showDay6Teaser ? (
        <div className="mt-4 rounded-lg border border-[var(--ep-gold)]/40 bg-amber-50/50 p-4 text-sm">
          <p className="font-bold text-[var(--ep-navy)]">{DAY5_DAY6_TEASER.title}</p>
          <p className="mt-2 text-[var(--ep-navy-muted)]">{DAY5_DAY6_TEASER.body}</p>
          <Link href={DAY5_DAY6_TEASER.href} className="mt-2 inline-block text-sm font-bold text-[var(--ep-navy)] underline">
            Preview Day 6 →
          </Link>
        </div>
      ) : null}
      <p className="mt-4 text-xs text-[var(--ep-navy-muted)]">Release: {DEBATE_PREP_DAY5_RELEASE_VERSION}</p>
    </section>
  );
}
