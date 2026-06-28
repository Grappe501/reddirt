import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { VolunteerLeaderWorkbenchV3View } from "@/components/volunteers/VolunteerLeaderWorkbenchV3View";
import { buildLeaderFieldLogContext } from "@/lib/volunteers/build-leader-field-log-context";
import { buildLeaderWorkbenchV3Payload } from "@/lib/volunteers/build-leader-workbench-v3";
import { loadLeaderContactSpineSummary } from "@/lib/volunteers/contact-spine";
import { loadCurrentVolunteerLeader } from "@/lib/volunteers/load-current-leader";
import { loadLeaderRoleInbox } from "@/lib/volunteers/ops-work-items";

export const metadata: Metadata = {
  title: "My workbench v4.0 | Operators",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams?: Promise<{ opsWork?: string }>;
};

export default async function LeaderWorkbenchMePage({ searchParams }: PageProps) {
  const leader = await loadCurrentVolunteerLeader();
  if (!leader) notFound();

  const params = (await searchParams) ?? {};

  const [payload, fieldLog, contactSpine, myWork] = await Promise.all([
    buildLeaderWorkbenchV3Payload(leader, { isSelf: true }),
    buildLeaderFieldLogContext(leader, { isSelf: true }),
    loadLeaderContactSpineSummary(leader.slug),
    loadLeaderRoleInbox(leader.slug),
  ]);

  return (
    <VolunteerLeaderWorkbenchV3View
      payload={payload}
      isSelf
      fieldLog={fieldLog}
      contactSpine={contactSpine}
      myWork={myWork}
      myWorkStatus={params.opsWork ?? null}
    />
  );
}
