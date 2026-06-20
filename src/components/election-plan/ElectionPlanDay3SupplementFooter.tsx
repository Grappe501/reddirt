import Link from "next/link";

import { ElectionPlanDay3ContinueButton } from "@/components/election-plan/ElectionPlanDay3ContinueButton";
import type { Day3SupplementAnchor } from "@/lib/election-plan/day3-supplement-anchors";

export function ElectionPlanDay3SupplementFooter({ anchor }: { anchor: Day3SupplementAnchor }) {
  return (
    <footer className="mt-10 space-y-4 border-t border-[var(--ep-border)] pt-8">
      <p className="text-xs text-[var(--ep-navy-muted)]">
        This supplement supports the pathway — it does not replace a block step. Return to{" "}
        <Link href={anchor.returnHref} className="font-semibold text-[var(--ep-navy)] underline">
          {anchor.returnLabel}
        </Link>{" "}
        or continue the linear path.
      </p>
      <ElectionPlanDay3ContinueButton currentStepId={anchor.continueFromStepId} className="w-full sm:max-w-xl" />
    </footer>
  );
}
