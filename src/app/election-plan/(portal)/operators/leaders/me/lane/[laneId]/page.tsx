import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LeaderLaneDrillDownView } from "@/components/volunteers/LeaderLaneDrillDownView";
import {
  buildLaneDrillDownPage,
  isValidLeaderLane,
  laneLabelForId,
} from "@/lib/volunteers/lane-drill-down-config";
import { getEffectiveTeamLanes } from "@/lib/volunteers/leader-roster";
import { loadCurrentVolunteerLeader } from "@/lib/volunteers/load-current-leader";
import { resolveLeaderPersonalLinks } from "@/lib/volunteers/resolve-leader-links";

type Props = { params: Promise<{ laneId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { laneId } = await params;
  const laneLabel = isValidLeaderLane(laneId) ? laneLabelForId(laneId) : "Lane";
  return {
    title: `My ${laneLabel} lane · v3.4`,
    robots: { index: false, follow: false },
  };
}

export default async function LeaderLaneDrillDownMePage({ params }: Props) {
  const { laneId } = await params;
  if (!isValidLeaderLane(laneId)) notFound();

  const leader = await loadCurrentVolunteerLeader();
  if (!leader || !getEffectiveTeamLanes(leader).includes(laneId)) notFound();

  const areaLinks = resolveLeaderPersonalLinks(leader);
  const page = buildLaneDrillDownPage(laneId, leader, areaLinks, { isSelf: true });
  if (!page) notFound();

  return <LeaderLaneDrillDownView leader={leader} page={page} isSelf />;
}
