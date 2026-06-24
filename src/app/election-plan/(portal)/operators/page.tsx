import Link from "next/link";

import { ElectionPlanOperatorsHubPanel } from "@/components/election-plan/ElectionPlanOperatorsHubPanels";
import { ElectionPlanOperatorsLeaderDirectory } from "@/components/election-plan/ElectionPlanOperatorsLeaderDirectory";
import { ElectionPlanOperatorsSubnav } from "@/components/election-plan/ElectionPlanOperatorsSubnav";
import { OperationsCommandLadderPanel } from "@/components/volunteers/OperationsCommandLadderPanel";
import { loadOperationsFeedbackRollup } from "@/lib/volunteers/load-operations-feedback-rollup";

export const metadata = {
  title: "Operators | Election Plan",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ElectionPlanOperatorsPage() {
  const operationsFeedbackRollup = await loadOperationsFeedbackRollup();

  return (
    <>
      <div className="ep-classification">Internal · Operators command</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Link href="/election-plan" className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:underline">
            ← Election Plan
          </Link>
          <h1 className="mt-2 font-heading text-2xl font-bold text-[var(--ep-navy)]">Operators</h1>
          <p className="mt-2 max-w-3xl text-sm text-[var(--ep-navy-muted)]">
            Field operator initials, volunteer leader workbenches v2, and command roster — one tab for everyone who runs
            the ground game.
          </p>
          <div className="mt-6">
            <ElectionPlanOperatorsSubnav />
          </div>
          <div className="mt-6">
            <ElectionPlanOperatorsLeaderDirectory />
          </div>
          <div className="mt-6">
            <OperationsCommandLadderPanel
              rollup={operationsFeedbackRollup}
              activeTierId="operators_hub"
              returnTo="/election-plan/operators/my-work"
            />
          </div>
          <div className="mt-6">
            <ElectionPlanOperatorsHubPanel />
          </div>
        </div>
      </div>
    </>
  );
}
