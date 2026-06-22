"use client";

import { ElectionPlanDay4ContinueButton } from "@/components/election-plan/ElectionPlanDay4ContinueButton";
import type { Day4SupplementAnchor } from "@/lib/election-plan/day4-supplement-anchors";

export function ElectionPlanDay4SupplementFooter({ anchor }: { anchor: Day4SupplementAnchor }) {
  return (
    <footer className="mt-10 space-y-4 border-t border-[var(--ep-border)] pt-8">
      <ElectionPlanDay4ContinueButton currentStepId={anchor.continueFromStepId} />
      <p className="text-xs text-[var(--ep-navy-muted)]">
        Return path: {anchor.returnLabel} — forum intel stays internal until claims-cleared.
      </p>
    </footer>
  );
}
