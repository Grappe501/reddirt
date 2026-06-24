import type { Metadata } from "next";
import Link from "next/link";

import { ElectionPlanOperatorsSubnav } from "@/components/election-plan/ElectionPlanOperatorsSubnav";
import { VolunteerCommandView } from "@/components/volunteers/VolunteerCommandView";
import { syncAllVolunteerLeaderOperators } from "@/lib/volunteers/ensure-leader-operator";
import { loadCommandCoverageHeatmap } from "@/lib/volunteers/load-command-coverage";

export const metadata: Metadata = {
  title: "Leader command v3.4 | Operators",
  robots: { index: false, follow: false },
};

export default async function LeaderWorkbenchCommandPage() {
  await syncAllVolunteerLeaderOperators().catch(() => 0);
  const heatmap = await loadCommandCoverageHeatmap();

  return (
    <>
      <div className="ep-classification">Command · coverage v3.4</div>
      <div className="px-6 pt-6 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Link href="/election-plan/operators" className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:underline">
            ← Operators hub
          </Link>
          <h1 className="mt-2 font-heading text-2xl font-bold text-[var(--ep-navy)]">Leader command</h1>
          <p className="mt-2 max-w-3xl text-sm text-[var(--ep-navy-muted)]">
            Live activity from field logs and workbench leadership fills — roster sync runs on each visit.
          </p>
          <div className="mt-6">
            <ElectionPlanOperatorsSubnav />
          </div>
        </div>
      </div>
      <VolunteerCommandView rows={heatmap} />
    </>
  );
}
