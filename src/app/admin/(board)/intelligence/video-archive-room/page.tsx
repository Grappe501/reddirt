import Link from "next/link";
import { VideoArchiveRoomClient } from "@/components/admin/intelligence/VideoArchiveRoomClient";
import { buildVideoArchiveRoomPacket } from "@/lib/legislature/videoArchiveRoom";
import { buildHammerDirectDemocracyPacket } from "@/lib/intelligence/v4/hammerDirectDemocracyOffensive";
import { loadKellyRoadStories } from "@/lib/intelligence/loadKellyRoadStories";
import { LEGISLATIVE_GOVERNANCE } from "@/lib/legislature/legislativeGovernance";
import { tryIntelligenceLoad } from "@/lib/intelligence/safeIntelligenceLoad";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 26;

export default function VideoArchiveRoomPage() {
  const packet = tryIntelligenceLoad("video-archive-room", () => buildVideoArchiveRoomPacket(), {
    generatedAt: new Date().toISOString(),
    focusBillCount: 0,
    billsWithVideo: 0,
    totalCommitteeLinks: 0,
    cutReadyCount: 0,
    cutReadyFolderLabel: "cut-and-ready",
    operatorNotes: "",
    bills: [],
    opponentMedia: { hammer: [], packo: [], kellySuggestions: [] },
    transcripts: { catalogCount: 0, pipelineSegmentCount: 0, transcriptionStatus: "UNKNOWN" },
    legislativeRecord: buildHammerDirectDemocracyPacket(),
    roadStories: loadKellyRoadStories(),
    committeeTranscriptExcerpts: [],
  });

  return (
    <div className="mx-auto max-w-7xl p-6 text-kelly-text">
      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950">
        <strong>INTERNAL ONLY</strong> — {LEGISLATIVE_GOVERNANCE.labels.join(" · ")}. Committee video links are for
        research and clip prep. Verify speaker before debate or social use.
      </div>

      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Intelligence · video</p>
        <h1 className="font-heading text-2xl font-bold text-kelly-navy">Video archive room</h1>
        <p className="mt-2 max-w-3xl text-sm text-kelly-muted">
          Committee bill videos, legislative offense (direct democracy acts), road stories, transcripts, and opponent media —
          Talk Business, YouTube, PBS, campaign sites. Download, cut snippets, register in{" "}
          <strong>{packet.cutReadyFolderLabel}</strong>.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Link href="/admin/intelligence" className="rounded-full border border-kelly-navy/30 px-3 py-1 font-bold text-kelly-navy">
            ← Hub
          </Link>
          <Link
            href="/admin/intelligence/legislative-video"
            className="rounded-full border border-kelly-navy/30 px-3 py-1 font-bold text-kelly-navy"
          >
            Legislative video pipeline
          </Link>
          <Link
            href="/admin/intelligence/kim-hammer/debate-prep"
            className="rounded-full border border-kelly-navy/30 px-3 py-1 font-bold text-kelly-navy"
          >
            Debate prep
          </Link>
          <Link
            href="/admin/intelligence/kelly-debate-coaching"
            className="rounded-full border border-violet-300 bg-violet-50 px-3 py-1 font-bold text-violet-950"
          >
            Debate coaching
          </Link>
        </div>
      </header>

      <VideoArchiveRoomClient packet={packet} />
    </div>
  );
}
