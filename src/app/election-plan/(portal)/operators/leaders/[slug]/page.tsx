import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ElectionPlanOperatorsSubnav } from "@/components/election-plan/ElectionPlanOperatorsSubnav";
import { VolunteerLeaderWorkbenchV3View } from "@/components/volunteers/VolunteerLeaderWorkbenchV3View";
import { buildLeaderWorkbenchV3Payload } from "@/lib/volunteers/build-leader-workbench-v3";
import { getVolunteerLeaderBySlug } from "@/lib/volunteers/leader-roster";
import { tryLoadCurrentVolunteerLeader } from "@/lib/volunteers/load-current-leader";
import { loadCurrentElectionPlanOperator } from "@/lib/election-plan/auth/load-current-operator";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const leader = getVolunteerLeaderBySlug(slug);
  return {
    title: leader ? `${leader.displayName} · Leader workbench v3` : "Leader workbench",
    robots: { index: false, follow: false },
  };
}

export default async function LeaderWorkbenchSlugPage({ params }: Props) {
  const { slug } = await params;
  const leader = getVolunteerLeaderBySlug(slug);
  if (!leader) notFound();

  const [payload, current, operator] = await Promise.all([
    buildLeaderWorkbenchV3Payload(leader),
    tryLoadCurrentVolunteerLeader(),
    loadCurrentElectionPlanOperator().catch(() => null),
  ]);
  const isSelf = current?.slug === leader.slug;

  return (
    <>
      <div className="px-6 pt-6 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/election-plan/operators/leaders"
            className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:underline"
          >
            ← All leader workbenches
          </Link>
          <div className="mt-4">
            <ElectionPlanOperatorsSubnav />
          </div>
        </div>
      </div>
      <VolunteerLeaderWorkbenchV3View
        payload={payload}
        isSelf={isSelf}
        epOperatorInitials={operator?.initials ?? null}
      />
    </>
  );
}
