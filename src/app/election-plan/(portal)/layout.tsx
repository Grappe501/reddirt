import type { ReactNode } from "react";
import { Suspense } from "react";
import { ElectionPlanLogoutButton } from "@/components/election-plan/ElectionPlanLogoutButton";
import { ElectionPlanPortalHeader } from "@/components/election-plan/ElectionPlanPortalHeader";
import { PageBriefFromPath } from "@/components/election-plan/PageBriefFromPath";
import { requireElectionPlanPage } from "@/lib/election-plan/auth/require-election-plan";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ElectionPlanPortalLayout({ children }: { children: ReactNode }) {
  await requireElectionPlanPage();
  return (
    <>
      <ElectionPlanPortalHeader />
      <div className="mx-auto max-w-6xl px-4 pt-4 lg:px-6">
        <Suspense fallback={null}>
          <PageBriefFromPath />
        </Suspense>
      </div>
      {children}
      <ElectionPlanLogoutButton />
    </>
  );
}
