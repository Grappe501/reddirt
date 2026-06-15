import type { ReactNode } from "react";
import { ElectionPlanLogoutButton } from "@/components/election-plan/ElectionPlanLogoutButton";
import { requireElectionPlanPage } from "@/lib/election-plan/auth/require-election-plan";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ElectionPlanPortalLayout({ children }: { children: ReactNode }) {
  await requireElectionPlanPage();
  return (
    <>
      {children}
      <ElectionPlanLogoutButton />
    </>
  );
}
