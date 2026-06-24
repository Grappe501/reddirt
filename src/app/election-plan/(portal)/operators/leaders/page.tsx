import Link from "next/link";

import { ElectionPlanOperatorsLeaderDirectory } from "@/components/election-plan/ElectionPlanOperatorsLeaderDirectory";
import { ElectionPlanOperatorsSubnav } from "@/components/election-plan/ElectionPlanOperatorsSubnav";

export const metadata = {
  title: "Leader workbenches | Operators",
  robots: { index: false, follow: false },
};

export default function ElectionPlanLeaderWorkbenchesIndexPage() {
  return (
    <>
      <div className="ep-classification">v3 · Leadership workbench shell</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Link href="/election-plan/operators" className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:underline">
            ← Operators hub
          </Link>
          <h1 className="mt-2 font-heading text-2xl font-bold text-[var(--ep-navy)]">Leader workbenches</h1>
          <p className="mt-2 max-w-3xl text-sm text-[var(--ep-navy-muted)]">
          Every volunteer leader gets a personal v3 command surface: live record KPIs, calendar, event command, message
          hub slice, Power of 5, and geography drill-downs.
          </p>
          <div className="mt-6">
            <ElectionPlanOperatorsSubnav />
          </div>
          <div className="mt-6">
            <ElectionPlanOperatorsLeaderDirectory />
          </div>
        </div>
      </div>
    </>
  );
}
