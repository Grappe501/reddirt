"use client";

import { EpButton } from "@/components/election-plan/ui/EpButton";
import { notifyDay5PathwayProgressChanged } from "@/components/election-plan/ElectionPlanDay5PathwayProgressBar";
import { buildDay5PathwaySteps } from "@/lib/election-plan/day5-learning-pathway";
import { epDebatePrepDayHref } from "@/lib/election-plan/debate-prep-links";
import { DAY5_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import { markDay5PathwayStepComplete } from "@/lib/election-plan/day5-pathway-progress";

export function ElectionPlanDay5ContinueButton({
  currentStepId,
  className = "",
}: {
  currentStepId: string;
  className?: string;
}) {
  const steps = buildDay5PathwaySteps();
  const idx = steps.findIndex((s) => s.id === currentStepId);
  const next = idx >= 0 && idx < steps.length - 1 ? steps[idx + 1] : undefined;
  const current = idx >= 0 ? steps[idx] : undefined;

  function signOffAndNavigate() {
    markDay5PathwayStepComplete(currentStepId);
    notifyDay5PathwayProgressChanged();
  }

  if (!next) {
    return (
      <div className={`ep-continue ${className}`}>
        <p className="ep-continue-hint">Sign off this step, then return to the evening check on the Day 5 overview.</p>
        <EpButton href={epDebatePrepDayHref(DAY5_ID)} variant="success" onClick={signOffAndNavigate} className="mt-3">
          Sign off &amp; finish Day 5 evening check →
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
