"use client";

import { ElectionPlanDay6ContinueButton } from "@/components/election-plan/ElectionPlanDay6ContinueButton";
import type { Day6SupplementAnchor } from "@/lib/election-plan/day6-supplement-anchors";

export function ElectionPlanDay6SupplementFooter({ anchor }: { anchor: Day6SupplementAnchor }) {
  return (
    <footer className="mt-10 space-y-4 border-t border-[var(--ep-border)] pt-8">
      <ElectionPlanDay6ContinueButton currentStepId={anchor.continueFromStepId} />
      <p className="text-xs text-[var(--ep-navy-muted)]">
        Return path: {anchor.returnLabel} — simulation uses claims-green lines only.
      </p>
    </footer>
  );
}
