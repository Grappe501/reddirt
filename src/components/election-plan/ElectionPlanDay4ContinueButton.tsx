"use client";

import { EpButton } from "@/components/election-plan/ui/EpButton";
import { notifyDay4PathwayProgressChanged } from "@/components/election-plan/ElectionPlanDay4PathwayProgressBar";
import { buildDay4PathwaySteps } from "@/lib/election-plan/day4-learning-pathway";
import { epDebatePrepDayHref } from "@/lib/election-plan/debate-prep-links";
import { DAY4_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import { markDay4PathwayStepComplete } from "@/lib/election-plan/day4-pathway-progress";

export function ElectionPlanDay4ContinueButton({
  currentStepId,
  className = "",
}: {
  currentStepId: string;
  className?: string;
}) {
  const steps = buildDay4PathwaySteps();
  const idx = steps.findIndex((s) => s.id === currentStepId);
  const next = idx >= 0 && idx < steps.length - 1 ? steps[idx + 1] : undefined;
  const current = idx >= 0 ? steps[idx] : undefined;

  function signOffAndNavigate() {
    markDay4PathwayStepComplete(currentStepId);
    notifyDay4PathwayProgressChanged();
  }

  if (!next) {
    return (
      <div className={`ep-continue ${className}`}>
        <p className="ep-continue-hint">Sign off this step, then return to the evening check on the Day 4 overview.</p>
        <EpButton href={epDebatePrepDayHref(DAY4_ID)} variant="success" onClick={signOffAndNavigate} className="mt-3">
          Sign off &amp; finish Day 4 evening check →
        </EpButton>
      </div>
    );
  }

  return (
    <div className={`ep-continue ${className}`}>
      <p className="ep-continue-label">Your sign-off</p>
      <p className="ep-continue-hint">
        Finished <strong>{current?.label ?? "this step"}</strong>? Continue records your completion and opens the next
        step.
      </p>
      <EpButton href={next.href} onClick={signOffAndNavigate} fullWidth className="ep-btn-block-sm-auto mt-3">
        Sign off &amp; continue · {next.label} ({next.minutes} min) →
      </EpButton>
    </div>
  );
}
