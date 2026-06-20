import Link from "next/link";

import { ElectionPlanDay1ContinueButton } from "@/components/election-plan/ElectionPlanDay1ContinueButton";
import type { Day1SupplementAnchor } from "@/lib/election-plan/day1-supplement-anchors";

export function ElectionPlanDay1SupplementFooter({ anchor }: { anchor: Day1SupplementAnchor }) {
  return (
    <footer className="mt-10 space-y-4 border-t border-[var(--ep-border)] pt-8">
      <p className="text-xs text-[var(--ep-navy-muted)]">
        This supplement supports the pathway — it does not replace a block step. Return to{" "}
        <Link href={anchor.returnHref} className="font-semibold text-[var(--ep-navy)] underline">
          {anchor.returnLabel}
        </Link>{" "}
        or continue the linear path.
      </p>
      <ElectionPlanDay1ContinueButton currentStepId={anchor.continueFromStepId} className="w-full sm:max-w-xl" />
    </footer>
  );
}
