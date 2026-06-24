import type { Metadata } from "next";
import Link from "next/link";

import { ElectionPlanOperatorsSubnav } from "@/components/election-plan/ElectionPlanOperatorsSubnav";
import { RealLeaderDashboard } from "@/components/volunteers/RealLeaderDashboard";
import { OperationsCommandLadderPanel } from "@/components/volunteers/OperationsCommandLadderPanel";
import {
  canAccessLeaderDashboardCommand,
} from "@/lib/volunteers/leader-roster";
import { loadRealLeaderDashboard } from "@/lib/volunteers/load-real-leader-dashboard";
import { loadOperationsFeedbackRollup } from "@/lib/volunteers/load-operations-feedback-rollup";
import { tryLoadCurrentVolunteerLeader } from "@/lib/volunteers/load-current-leader";
import { requireElectionPlanPortalAccess } from "@/lib/election-plan/auth/portal-access";

export const metadata: Metadata = {
  title: "Leader dashboard | Operators",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function LeaderDashboardOpsPage() {
  const authMode = await requireElectionPlanPortalAccess();
  const leader = await tryLoadCurrentVolunteerLeader();
  const includeCommandRollup =
    authMode === "election-plan" || Boolean(leader && canAccessLeaderDashboardCommand(leader));

  const payload = await loadRealLeaderDashboard({
    leader,
    includeCommandRollup,
  });
  const operationsFeedbackRollup = await loadOperationsFeedbackRollup();

  return (
    <>
      <div className="ep-classification">Operators · leader dashboard v1</div>
      <div className="px-6 pt-6 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Link href="/election-plan/operators" className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:underline">
            ← Operators hub
          </Link>
          <h1 className="mt-2 font-heading text-2xl font-bold text-[var(--ep-navy)]">Leader dashboard</h1>
          <p className="mt-2 max-w-3xl text-sm text-[var(--ep-navy-muted)]">
            Production team health, My Five roster, and follow-up queue tied to your leader slug — replaces demo
            pins. Command access sees statewide Po5 gaps and activity rollup.
          </p>
          <div className="mt-6">
            <ElectionPlanOperatorsSubnav />
          </div>
          <div className="mt-6">
            <OperationsCommandLadderPanel rollup={operationsFeedbackRollup} activeTierId="leader_workbench" />
          </div>
        </div>
      </div>
      <RealLeaderDashboard payload={payload} />
    </>
  );
}
