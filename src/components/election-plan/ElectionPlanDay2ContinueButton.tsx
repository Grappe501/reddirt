"use client";

import Link from "next/link";

import { notifyDay2PathwayProgressChanged } from "@/components/election-plan/ElectionPlanDay2PathwayProgressBar";
import { buildDay2PathwaySteps } from "@/lib/election-plan/day2-learning-pathway";
import { epDebatePrepDayHref } from "@/lib/election-plan/debate-prep-links";
import { DAY2_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import { markDay2PathwayStepComplete } from "@/lib/election-plan/day2-pathway-progress";

export function ElectionPlanDay2ContinueButton({
  currentStepId,
  className = "",
}: {
  currentStepId: string;
  className?: string;
}) {
  const steps = buildDay2PathwaySteps();
  const idx = steps.findIndex((s) => s.id === currentStepId);
  const next = idx >= 0 && idx < steps.length - 1 ? steps[idx + 1] : undefined;
  const current = idx >= 0 ? steps[idx] : undefined;

  function signOffAndNavigate() {
    markDay2PathwayStepComplete(currentStepId);
    notifyDay2PathwayProgressChanged();
  }

  if (!next) {
    return (
      <div className={`space-y-3 ${className}`}>
        <p className="text-xs text-[var(--ep-navy-muted)]">
          Sign off this step, then return to the evening check on the Day 2 overview.
        </p>
        <Link
          href={epDebatePrepDayHref(DAY2_ID)}
          onClick={signOffAndNavigate}
          className="inline-block rounded-full bg-emerald-800 px-6 py-3 text-sm font-bold text-white"
        >
          Sign off &amp; finish Day 2 evening check →
        </Link>
      </div>
    );
  }

  return (
    <div className={`space-y-3 border-t border-[var(--ep-border)] pt-6 ${className}`}>
      <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Your sign-off</p>
      <p className="text-sm text-[var(--ep-navy-muted)]">
        Finished <strong className="text-[var(--ep-navy)]">{current?.label ?? "this step"}</strong>? Continue records
        your completion and opens the next step.
      </p>
      <Link
        href={next.href}
        onClick={signOffAndNavigate}
        className="inline-block w-full rounded-full bg-[var(--ep-navy)] px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-[var(--ep-navy)]/90 sm:w-auto"
      >
        Sign off &amp; continue · {next.label} ({next.minutes} min) →
      </Link>
    </div>
  );
}
