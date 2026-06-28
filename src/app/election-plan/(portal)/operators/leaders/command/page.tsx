import type { Metadata } from "next";
import Link from "next/link";

import { ElectionPlanOperatorsSubnav } from "@/components/election-plan/ElectionPlanOperatorsSubnav";
import { VolunteerCommandView } from "@/components/volunteers/VolunteerCommandView";
import { OperationsCommandLadderPanel } from "@/components/volunteers/OperationsCommandLadderPanel";
import { syncAllVolunteerLeaderOperators } from "@/lib/volunteers/ensure-leader-operator";
import { loadCommandCoverageHeatmap } from "@/lib/volunteers/load-command-coverage";
import { loadOperationsFeedbackRollup } from "@/lib/volunteers/load-operations-feedback-rollup";
import { loadOpenLeaderTasksBySlug } from "@/lib/volunteers/ops-work-items";

export const metadata: Metadata = {
  title: "Leader command v4.0 | Operators",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams?: Promise<{ opsWork?: string }>;
};

export default async function LeaderWorkbenchCommandPage({ searchParams }: PageProps) {
  await syncAllVolunteerLeaderOperators().catch(() => 0);
  const params = (await searchParams) ?? {};
  const [heatmap, operationsFeedbackRollup, openLeaderTasksBySlug] = await Promise.all([
    loadCommandCoverageHeatmap(),
    loadOperationsFeedbackRollup(),
    loadOpenLeaderTasksBySlug(),
  ]);

  return (
    <>
      <div className="ep-classification">Command · coverage v4.0</div>
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
          <div className="mt-6">
            <OperationsCommandLadderPanel
              rollup={operationsFeedbackRollup}
              activeTierId="leader_command"
              returnTo="/election-plan/operators/leaders/command"
            />
          </div>
        </div>
      </div>
      <VolunteerCommandView
        rows={heatmap}
        openLeaderTasksBySlug={openLeaderTasksBySlug}
        statusMessage={params.opsWork === "leader_task_created" ? "Leader coaching task created." : null}
      />
    </>
  );
}
