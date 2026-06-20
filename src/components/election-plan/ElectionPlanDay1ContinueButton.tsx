"use client";

import Link from "next/link";

import { notifyDay1PathwayProgressChanged } from "@/components/election-plan/ElectionPlanDay1PathwayProgressBar";
import { buildDay1PathwaySteps } from "@/lib/election-plan/day1-learning-pathway";
import { epDebatePrepDayHref } from "@/lib/election-plan/debate-prep-links";
import { DAY1_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import { markDay1PathwayStepComplete } from "@/lib/election-plan/day1-pathway-progress";

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
  const current = idx >= 0 ? steps[idx] : undefined;

  function signOffAndNavigate(href: string) {
    markDay1PathwayStepComplete(currentStepId);
    notifyDay1PathwayProgressChanged();
  }

  if (!next) {
    return (
      <div className={`space-y-3 ${className}`}>
        <p className="text-xs text-[var(--ep-navy-muted)]">
          Sign off this step, then return to the evening check on the Day 1 overview.
        </p>
        <Link
          href={epDebatePrepDayHref(DAY1_ID)}
          onClick={() => signOffAndNavigate(epDebatePrepDayHref(DAY1_ID))}
          className="inline-block rounded-full bg-emerald-800 px-6 py-3 text-sm font-bold text-white"
        >
          Sign off &amp; finish Day 1 evening check →
        </Link>
      </div>
    );
  }

  return (
    <div className={`space-y-3 border-t border-[var(--ep-border)] pt-6 ${className}`}>
      <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Your sign-off</p>
      <p className="text-sm text-[var(--ep-navy-muted)]">
        Finished <strong className="text-[var(--ep-navy)]">{current?.label ?? "this step"}</strong>? Continue records your
        completion and opens the next step.
      </p>
      <Link
        href={next.href}
        onClick={() => signOffAndNavigate(next.href)}
        className="inline-block w-full rounded-full bg-[var(--ep-navy)] px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-[var(--ep-navy)]/90 sm:w-auto"
      >
        Sign off &amp; continue · {next.label} ({next.minutes} min) →
      </Link>
    </div>
  );
}
