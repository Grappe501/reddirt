"use client";

import { EpButton } from "@/components/election-plan/ui/EpButton";
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
      <div className={`ep-continue ${className}`}>
        <p className="ep-continue-hint">Sign off this step, then return to the evening check on the Day 2 overview.</p>
        <EpButton href={epDebatePrepDayHref(DAY2_ID)} variant="success" onClick={signOffAndNavigate} className="mt-3">
          Sign off &amp; finish Day 2 evening check →
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
