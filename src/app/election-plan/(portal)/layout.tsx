import type { ReactNode } from "react";
import { Suspense } from "react";

import { ElectionPlanLogoutButton } from "@/components/election-plan/ElectionPlanLogoutButton";
import { ElectionPlanOperatorBar } from "@/components/election-plan/ElectionPlanOperatorBar";
import { ElectionPlanPortalHeader } from "@/components/election-plan/ElectionPlanPortalHeader";
import { PageBriefFromPath } from "@/components/election-plan/PageBriefFromPath";
import { VolunteerHubLogoutButton } from "@/components/volunteers/VolunteerHubShell";
import { loadCurrentElectionPlanOperator } from "@/lib/election-plan/auth/load-current-operator";
import { requireElectionPlanPortalAccess } from "@/lib/election-plan/auth/portal-access";
import { tryLoadCurrentVolunteerLeader } from "@/lib/volunteers/load-current-leader";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 26;

export default async function ElectionPlanPortalLayout({ children }: { children: ReactNode }) {
  const authMode = await requireElectionPlanPortalAccess();
  const operator = authMode === "election-plan" ? await loadCurrentElectionPlanOperator() : null;
  const volunteerLeader =
    authMode === "volunteer-leader" || authMode === "dev-open" ? await tryLoadCurrentVolunteerLeader() : null;

  return (
    <div className="ep-portal-shell">
      <ElectionPlanPortalHeader authMode={authMode} volunteerLeader={volunteerLeader} />
      <div className="ep-portal-content">
        <div className="pt-4">
          {authMode === "election-plan" ? (
            <ElectionPlanOperatorBar
              currentInitials={operator?.initials ?? null}
              currentDisplayName={operator?.displayName ?? null}
            />
          ) : volunteerLeader ? (
            <div className="ep-operator-bar ep-operator-bar-signed-in">
              <p className="text-sm text-[var(--ep-navy)]">
                <span className="ep-operator-initials">{volunteerLeader.initials}</span>{" "}
                <strong>{volunteerLeader.displayName}</strong>
                <span className="text-[var(--ep-navy-muted)]"> · Leader workbench</span>
              </p>
              <VolunteerHubLogoutButton />
            </div>
          ) : null}
          {authMode === "election-plan" ? (
            <Suspense fallback={null}>
              <PageBriefFromPath />
            </Suspense>
          ) : null}
        </div>
      </div>
      {children}
      {authMode === "election-plan" ? <ElectionPlanLogoutButton /> : null}
    </div>
  );
}
