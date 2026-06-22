import type { ReactNode } from "react";
import { Suspense } from "react";

import { ElectionPlanLogoutButton } from "@/components/election-plan/ElectionPlanLogoutButton";
import { ElectionPlanOperatorBar } from "@/components/election-plan/ElectionPlanOperatorBar";
import { ElectionPlanPortalHeader } from "@/components/election-plan/ElectionPlanPortalHeader";
import { PageBriefFromPath } from "@/components/election-plan/PageBriefFromPath";
import { loadCurrentElectionPlanOperator } from "@/lib/election-plan/auth/load-current-operator";
import { requireElectionPlanPage } from "@/lib/election-plan/auth/require-election-plan";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 26;

export default async function ElectionPlanPortalLayout({ children }: { children: ReactNode }) {
  await requireElectionPlanPage();
  const operator = await loadCurrentElectionPlanOperator();
  return (
    <div className="ep-portal-shell">
      <ElectionPlanPortalHeader />
      <div className="ep-portal-content">
        <div className="pt-4">
          <ElectionPlanOperatorBar
            currentInitials={operator?.initials ?? null}
            currentDisplayName={operator?.displayName ?? null}
          />
          <Suspense fallback={null}>
            <PageBriefFromPath />
          </Suspense>
        </div>
      </div>
      {children}
      <ElectionPlanLogoutButton />
    </div>
  );
}
