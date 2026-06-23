"use client";

import { ElectionPlanDay7ContinueButton } from "@/components/election-plan/ElectionPlanDay7ContinueButton";
import type { Day7SupplementAnchor } from "@/lib/election-plan/day7-supplement-anchors";

export function ElectionPlanDay7SupplementFooter({ anchor }: { anchor: Day7SupplementAnchor }) {
  return (
    <footer className="mt-10 space-y-4 border-t border-[var(--ep-border)] pt-8">
      <ElectionPlanDay7ContinueButton currentStepId={anchor.continueFromStepId} />
      <p className="text-xs text-[var(--ep-navy-muted)]">
        Return path: {anchor.returnLabel} — cut, do not add; claims-green bookends only on debate eve.
      </p>
    </footer>
  );
}
