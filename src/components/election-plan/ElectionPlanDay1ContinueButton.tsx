"use client";

import { EpButton } from "@/components/election-plan/ui/EpButton";
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

  function signOffAndNavigate() {
    markDay1PathwayStepComplete(currentStepId);
    notifyDay1PathwayProgressChanged();
  }

  if (!next) {
    return (
      <div className={`ep-continue ${className}`}>
        <p className="ep-continue-hint">Sign off this step, then return to the evening check on the Day 1 overview.</p>
        <EpButton
          href={epDebatePrepDayHref(DAY1_ID)}
          variant="success"
          onClick={signOffAndNavigate}
          className="ep-btn-block-sm-auto mt-3"
        >
          Sign off &amp; finish Day 1 evening check →
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
      <EpButton href={next.href} onClick={signOffAndNavigate} className="ep-btn-block-sm-auto mt-3" fullWidth>
        Sign off &amp; continue · {next.label} ({next.minutes} min) →
      </EpButton>
    </div>
  );
}
