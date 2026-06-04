import Link from "next/link";
import { KellyDebateCoachingPanel } from "@/components/admin/intelligence/KellyDebateCoachingPanel";
import { buildVideoArchiveRoomPacket } from "@/lib/legislature/videoArchiveRoom";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function KellyDebateCoachingPage() {
  const archive = buildVideoArchiveRoomPacket();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Kelly · first debate coaching"
        title="Stage presence, scripts & three-way strategy"
        description="Narrative control on stage, full Check My Record walkthrough (six beats + 60s script), record-findings frames, Packo geometry, principles, acts, and scripts. Submit suggestions below."
      >
        <V4BackLinks />
        <Link href="/admin/intelligence/kim-hammer/debate-prep" className="rounded-full border border-kelly-navy/30 px-3 py-1 text-xs font-bold text-kelly-navy">
          Debate prep packet
        </Link>
      </V4PageHeader>

      <KellyDebateCoachingPanel
        suggestions={archive.opponentMedia.kellySuggestions}
        directDemocracy={archive.legislativeRecord}
        roadStories={archive.roadStories}
      />
    </div>
  );
}
