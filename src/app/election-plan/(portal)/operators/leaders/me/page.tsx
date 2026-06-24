import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { VolunteerLeaderWorkbenchV3View } from "@/components/volunteers/VolunteerLeaderWorkbenchV3View";
import { buildLeaderFieldLogContext } from "@/lib/volunteers/build-leader-field-log-context";
import { buildLeaderWorkbenchV3Payload } from "@/lib/volunteers/build-leader-workbench-v3";
import { loadCurrentVolunteerLeader } from "@/lib/volunteers/load-current-leader";

export const metadata: Metadata = {
  title: "My workbench v3.1 | Operators",
  robots: { index: false, follow: false },
};

export default async function LeaderWorkbenchMePage() {
  const leader = await loadCurrentVolunteerLeader();
  if (!leader) notFound();

  const [payload, fieldLog] = await Promise.all([
    buildLeaderWorkbenchV3Payload(leader),
    buildLeaderFieldLogContext(leader, { isSelf: true }),
  ]);

  return <VolunteerLeaderWorkbenchV3View payload={payload} isSelf fieldLog={fieldLog} />;
}
