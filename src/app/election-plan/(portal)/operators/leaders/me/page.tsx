import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { VolunteerLeaderWorkbenchV2View } from "@/components/volunteers/VolunteerLeaderWorkbenchV2View";
import { buildLeaderWorkbenchV2Payload } from "@/lib/volunteers/build-leader-workbench-v2";
import { getVolunteerLeaderBySlug } from "@/lib/volunteers/leader-roster";
import { loadCurrentVolunteerLeader } from "@/lib/volunteers/load-current-leader";

export const metadata: Metadata = {
  title: "My workbench | Operators",
  robots: { index: false, follow: false },
};

export default async function LeaderWorkbenchMePage() {
  const leader = await loadCurrentVolunteerLeader();
  if (!leader) notFound();

  return <VolunteerLeaderWorkbenchV2View payload={buildLeaderWorkbenchV2Payload(leader)} isSelf />;
}
