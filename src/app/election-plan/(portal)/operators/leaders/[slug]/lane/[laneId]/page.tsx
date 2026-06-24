import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ElectionPlanOperatorsSubnav } from "@/components/election-plan/ElectionPlanOperatorsSubnav";
import { LeaderLaneDrillDownView } from "@/components/volunteers/LeaderLaneDrillDownView";
import {
  buildLaneDrillDownPage,
  isValidLeaderLane,
  laneLabelForId,
} from "@/lib/volunteers/lane-drill-down-config";
import { getVolunteerLeaderBySlug, getEffectiveTeamLanes } from "@/lib/volunteers/leader-roster";
import { resolveLeaderPersonalLinks } from "@/lib/volunteers/resolve-leader-links";
import { tryLoadCurrentVolunteerLeader } from "@/lib/volunteers/load-current-leader";

type Props = { params: Promise<{ slug: string; laneId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, laneId } = await params;
  const leader = getVolunteerLeaderBySlug(slug);
  const laneLabel = isValidLeaderLane(laneId) ? laneLabelForId(laneId) : "Lane";
  return {
    title: leader ? `${laneLabel} · ${leader.displayName}` : "Lane drill-down",
    robots: { index: false, follow: false },
  };
}

export default async function LeaderLaneDrillDownSlugPage({ params }: Props) {
  const { slug, laneId } = await params;
  if (!isValidLeaderLane(laneId)) notFound();

  const leader = getVolunteerLeaderBySlug(slug);
  if (!leader || !getEffectiveTeamLanes(leader).includes(laneId)) notFound();

  const current = await tryLoadCurrentVolunteerLeader();
  const isSelf = current?.slug === leader.slug;
  const areaLinks = resolveLeaderPersonalLinks(leader);
  const page = buildLaneDrillDownPage(laneId, leader, areaLinks, { isSelf });
  if (!page) notFound();

  return (
    <>
      <div className="px-6 pt-6 lg:px-10">
        <div className="mx-auto max-w-4xl">
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
      <LeaderLaneDrillDownView leader={leader} page={page} isSelf={isSelf} />
    </>
  );
}
