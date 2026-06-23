"use client";

import { EpButton } from "@/components/election-plan/ui/EpButton";
import { notifyDay7PathwayProgressChanged } from "@/components/election-plan/ElectionPlanDay7PathwayProgressBar";
import { buildDay7PathwaySteps } from "@/lib/election-plan/day7-learning-pathway";
import { epDebatePrepDayHref } from "@/lib/election-plan/debate-prep-links";
import { DAY7_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import { markDay7PathwayStepComplete } from "@/lib/election-plan/day7-pathway-progress";

export function ElectionPlanDay7ContinueButton({
  currentStepId,
  className = "",
}: {
  currentStepId: string;
  className?: string;
}) {
  const steps = buildDay7PathwaySteps();
  const idx = steps.findIndex((s) => s.id === currentStepId);
  const next = idx >= 0 && idx < steps.length - 1 ? steps[idx + 1] : undefined;
  const current = idx >= 0 ? steps[idx] : undefined;

  function signOffAndNavigate() {
    markDay7PathwayStepComplete(currentStepId);
    notifyDay7PathwayProgressChanged();
  }

  if (!next) {
    return (
      <div className={`ep-continue ${className}`}>
        <p className="ep-continue-hint">Sign off this step, then return to the evening check on the Day 7 overview.</p>
        <EpButton href={epDebatePrepDayHref(DAY7_ID)} variant="success" onClick={signOffAndNavigate} className="mt-3">
          Sign off &amp; finish Day 7 evening check →
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
