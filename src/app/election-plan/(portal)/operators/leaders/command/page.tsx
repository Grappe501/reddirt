import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ElectionPlanOperatorsSubnav } from "@/components/election-plan/ElectionPlanOperatorsSubnav";
import { VolunteerCommandView } from "@/components/volunteers/VolunteerCommandView";
import { tryLoadCurrentVolunteerLeader } from "@/lib/volunteers/load-current-leader";

export const metadata: Metadata = {
  title: "Leader command | Operators",
  robots: { index: false, follow: false },
};

export default async function LeaderWorkbenchCommandPage() {
  const leader = await tryLoadCurrentVolunteerLeader();
  if (leader && !leader.commandAccess) {
    notFound();
  }

  return (
    <>
      <div className="ep-classification">Command roster</div>
      <div className="px-6 pt-6 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Link href="/election-plan/operators" className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:underline">
            ← Operators hub
          </Link>
          <div className="mt-4">
            <ElectionPlanOperatorsSubnav />
          </div>
        </div>
      </div>
      <VolunteerCommandView />
    </>
  );
}
