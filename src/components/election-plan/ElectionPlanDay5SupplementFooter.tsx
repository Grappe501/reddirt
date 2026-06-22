"use client";

import { ElectionPlanDay5ContinueButton } from "@/components/election-plan/ElectionPlanDay5ContinueButton";
import type { Day5SupplementAnchor } from "@/lib/election-plan/day5-supplement-anchors";

export function ElectionPlanDay5SupplementFooter({ anchor }: { anchor: Day5SupplementAnchor }) {
  return (
    <footer className="mt-10 space-y-4 border-t border-[var(--ep-border)] pt-8">
      <ElectionPlanDay5ContinueButton currentStepId={anchor.continueFromStepId} />
      <p className="text-xs text-[var(--ep-navy-muted)]">
        Return path: {anchor.returnLabel} — claims-green pairs only under the timer.
      </p>
    </footer>
  );
}
