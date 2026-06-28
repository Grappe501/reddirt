import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CposPresenterApp } from "@/components/cpos/CposPresenterApp";
import { KICKOFF_MEETING_ID, loadMeetingManifest } from "@/lib/cpos/load-meeting-manifest";
import { canAccessPresenterConsole } from "@/lib/cpos/presenter-auth";

export const metadata: Metadata = {
  title: "Presenter Console · Team Kickoff",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function TeamKickoffPresenterPage() {
  if (!(await canAccessPresenterConsole())) {
    redirect(`/election-plan/login?next=/election-plan/team-kickoff/presenter`);
  }

  const { manifest } = loadMeetingManifest(KICKOFF_MEETING_ID);
  return <CposPresenterApp manifest={manifest} meetingId={KICKOFF_MEETING_ID} />;
}
