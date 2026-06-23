"use client";

import { EpButton } from "@/components/election-plan/ui/EpButton";
import { notifyDay8PathwayProgressChanged } from "@/components/election-plan/ElectionPlanDay8PathwayProgressBar";
import { buildDay8PathwaySteps } from "@/lib/election-plan/day8-learning-pathway";
import { markDay8PathwayStepComplete } from "@/lib/election-plan/day8-pathway-progress";
import { epDebatePrepDayHref } from "@/lib/election-plan/debate-prep-links";
import { DAY8_ID } from "@/lib/election-plan/debatePrepDayDrillDown";

export function ElectionPlanDay8ContinueButton({
  currentStepId,
  className = "",
}: {
  currentStepId: string;
  className?: string;
}) {
  const steps = buildDay8PathwaySteps();
  const idx = steps.findIndex((s) => s.id === currentStepId);
  const next = idx >= 0 && idx < steps.length - 1 ? steps[idx + 1] : undefined;
  const current = idx >= 0 ? steps[idx] : undefined;

  function signOffAndNavigate() {
    markDay8PathwayStepComplete(currentStepId);
    notifyDay8PathwayProgressChanged();
  }

  if (!next) {
    return (
      <div className={`ep-continue ${className}`}>
        <p className="ep-continue-hint">Sign off this section, then return to the course complete check on the Day 8 overview.</p>
        <EpButton href={epDebatePrepDayHref(DAY8_ID)} variant="success" onClick={signOffAndNavigate} className="mt-3">
          Sign off &amp; finish Day 8 course check →
        </EpButton>
      </div>
    );
  }

  return (
    <div className={`ep-continue ${className}`}>
      <p className="ep-continue-label">Your sign-off</p>
      <p className="ep-continue-hint">
        Finished <strong>{current?.label ?? "this section"}</strong>? Continue records completion and opens the next
        section.
      </p>
      <EpButton href={next.href} onClick={signOffAndNavigate} fullWidth className="ep-btn-block-sm-auto mt-3">
        Sign off &amp; continue · {next.label} ({next.minutes} min) →
      </EpButton>
    </div>
  );
}
