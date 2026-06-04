import Link from "next/link";
import { KellyDebateCoachingPanel } from "@/components/admin/intelligence/KellyDebateCoachingPanel";
import { V4DebateDepthHub } from "@/components/admin/intelligence/v4/V4DebateDepthHub";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { buildVideoArchiveRoomPacket } from "@/lib/legislature/videoArchiveRoom";
import { getSurfaceGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";
import { V4OperatorGuide } from "@/components/admin/intelligence/v4/V4OperatorGuide";
import { loadVvsg20CandidateEducation } from "@/lib/intelligence/v4/vvsg20CandidateEducation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function KellyDebateCoachingPage() {
  const archive = buildVideoArchiveRoomPacket();
  const vvsg = loadVvsg20CandidateEducation();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Kelly · first debate coaching"
        title="Stage presence, scripts & three-way strategy"
        description="Narrative control on stage, full Check My Record walkthrough (six beats + 60s script), record-findings frames, Packo geometry, principles, acts, and scripts. Plain-language depth blocks cover attacks, adversity, and culture-war recovery."
        guide={getSurfaceGuide("kellyDebateCoaching")}
      >
        <V4BackLinks />
        <Link href="/admin/intelligence/candidate-dossiers/kelly-grappe" className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-950">
          Your alignment profile
        </Link>
        <Link href="/admin/intelligence/debate-depth/culture-war" className="rounded-full border border-indigo-300 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950">
          Culture-war guide
        </Link>
        <Link href="/admin/intelligence/kim-hammer/debate-prep" className="rounded-full border border-kelly-navy/30 px-3 py-1 text-xs font-bold text-kelly-navy">
          Debate prep packet
        </Link>
        <Link href="/admin/intelligence/election-equipment-vvsg" className="rounded-full border border-indigo-300 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950">
          VVSG 2.0 education
        </Link>
      </V4PageHeader>

      {getSurfaceGuide("kellyDebateCoaching") ? (
        <div className="mb-6">
          <V4OperatorGuide guide={getSurfaceGuide("kellyDebateCoaching")!} />
        </div>
      ) : null}

      <V4DebateDepthHub compact />

      <KellyDebateCoachingPanel
        suggestions={archive.opponentMedia.kellySuggestions}
        directDemocracy={archive.legislativeRecord}
        roadStories={archive.roadStories}
        vvsgEducation={{
          executiveSummary: vvsg.executiveSummaryForKelly,
          whatToKnow: vvsg.whatKellyShouldKnow.slice(0, 4),
          fairPublicLine: vvsg.debateAndTrailTalkingPoints.fairPublicLine,
          href: "/admin/intelligence/election-equipment-vvsg",
        }}
      />
    </div>
  );
}
