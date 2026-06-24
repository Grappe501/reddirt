import type { Metadata } from "next";
import Link from "next/link";

import { CoalitionLaneRollupDashboard } from "@/components/coalition/CoalitionLaneRollupDashboard";
import { ElectionPlanOperatorsSubnav } from "@/components/election-plan/ElectionPlanOperatorsSubnav";
import { loadCoalitionLaneDashboard } from "@/lib/coalition/load-coalition-lane-dashboard";

export const metadata: Metadata = {
  title: "Coalition lane rollup | Operators",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function CoalitionCommandOpsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const payload = await loadCoalitionLaneDashboard();

  return (
    <>
      <div className="ep-classification">Operators · coalition lane v1</div>
      <div className="px-6 pt-6 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Link href="/election-plan/operators" className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:underline">
            ← Operators hub
          </Link>
          <h1 className="mt-2 font-heading text-2xl font-bold text-[var(--ep-navy)]">Coalition lane rollup</h1>
          <p className="mt-2 max-w-3xl text-sm text-[var(--ep-navy-muted)]">
            Twelve coalition workbenches — ownership, readiness, partner relationships, and intake placement. Liaisons
            and Election Plan operators share this surface.
          </p>
          <div className="mt-6">
            <ElectionPlanOperatorsSubnav />
          </div>
        </div>
      </div>
      <CoalitionLaneRollupDashboard payload={payload} selectedIntakeId={sp.intake} />
    </>
  );
}
