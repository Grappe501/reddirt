import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ElectionPlanOperatorsSubnav } from "@/components/election-plan/ElectionPlanOperatorsSubnav";
import { VolunteerLeaderWorkbenchV2View } from "@/components/volunteers/VolunteerLeaderWorkbenchV2View";
import { buildLeaderWorkbenchV2Payload } from "@/lib/volunteers/build-leader-workbench-v2";
import { getVolunteerLeaderBySlug } from "@/lib/volunteers/leader-roster";
import { loadCurrentVolunteerLeader, tryLoadCurrentVolunteerLeader } from "@/lib/volunteers/load-current-leader";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const leader = getVolunteerLeaderBySlug(slug);
  return {
    title: leader ? `${leader.displayName} · Leader workbench` : "Leader workbench",
    robots: { index: false, follow: false },
  };
}

export default async function LeaderWorkbenchSlugPage({ params }: Props) {
  const { slug } = await params;
  const leader = getVolunteerLeaderBySlug(slug);
  if (!leader) notFound();

  const current = await tryLoadCurrentVolunteerLeader();
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
      <VolunteerLeaderWorkbenchV2View payload={buildLeaderWorkbenchV2Payload(leader)} isSelf={isSelf} />
    </>
  );
}
