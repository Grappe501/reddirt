import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { VolunteerLeaderWorkbenchV3View } from "@/components/volunteers/VolunteerLeaderWorkbenchV3View";
import { buildLeaderWorkbenchV3Payload } from "@/lib/volunteers/build-leader-workbench-v3";
import { loadCurrentVolunteerLeader } from "@/lib/volunteers/load-current-leader";
import { loadCurrentElectionPlanOperator } from "@/lib/election-plan/auth/load-current-operator";

export const metadata: Metadata = {
  title: "My workbench v3 | Operators",
  robots: { index: false, follow: false },
};

export default async function LeaderWorkbenchMePage() {
  const leader = await loadCurrentVolunteerLeader();
  if (!leader) notFound();

  const [payload, operator] = await Promise.all([
    buildLeaderWorkbenchV3Payload(leader),
    loadCurrentElectionPlanOperator().catch(() => null),
  ]);

  return (
    <VolunteerLeaderWorkbenchV3View
      payload={payload}
      isSelf
      epOperatorInitials={operator?.initials ?? null}
    />
  );
}
