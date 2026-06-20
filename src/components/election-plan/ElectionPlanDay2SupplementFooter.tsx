import Link from "next/link";

import { ElectionPlanDay2ContinueButton } from "@/components/election-plan/ElectionPlanDay2ContinueButton";
import type { Day2SupplementAnchor } from "@/lib/election-plan/day2-supplement-anchors";

export function ElectionPlanDay2SupplementFooter({ anchor }: { anchor: Day2SupplementAnchor }) {
  return (
    <footer className="mt-10 space-y-4 border-t border-[var(--ep-border)] pt-8">
      <p className="text-xs text-[var(--ep-navy-muted)]">
        This supplement supports the pathway — it does not replace a block step. Return to{" "}
        <Link href={anchor.returnHref} className="font-semibold text-[var(--ep-navy)] underline">
          {anchor.returnLabel}
        </Link>{" "}
        or continue the linear path.
      </p>
      <ElectionPlanDay2ContinueButton currentStepId={anchor.continueFromStepId} className="w-full sm:max-w-xl" />
    </footer>
  );
}
