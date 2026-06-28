import type { Metadata } from "next";
import { headers } from "next/headers";

import { CposAudienceApp } from "@/components/cpos/CposAudienceApp";
import { KICKOFF_MEETING_ID, loadMeetingManifest } from "@/lib/cpos/load-meeting-manifest";

export const metadata: Metadata = {
  title: "Team Kickoff · Kelly Grappe Campaign",
  description: "Live guided kickoff — follow along on your phone or computer.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function TeamKickoffAudiencePage() {
  const { manifest, warnings } = loadMeetingManifest(KICKOFF_MEETING_ID);
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const joinUrlDisplay = host
    ? `${proto}://${host}${manifest.join.audiencePath}`
    : manifest.join.audiencePath;

  if (warnings.length > 0 && process.env.NODE_ENV === "development") {
    console.warn("[CPOS] manifest warnings:", warnings);
  }

  return <CposAudienceApp manifest={manifest} meetingId={KICKOFF_MEETING_ID} joinUrlDisplay={joinUrlDisplay} />;
}
