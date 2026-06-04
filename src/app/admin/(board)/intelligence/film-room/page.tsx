import Link from "next/link";
import { loadDebateFilmRoomPagePacket } from "@/lib/intelligence/v4/debateFilmRoomPage";
import { getSurfaceGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { V4OperatorGuide } from "@/components/admin/intelligence/v4/V4OperatorGuide";
import { DebateFilmRoomClient } from "@/components/admin/intelligence/film-room/DebateFilmRoomClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 26;

export default async function DebateFilmRoomPage() {
  const packet = loadDebateFilmRoomPagePacket();
  const guide = getSurfaceGuide("debateWarRoomP4");

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Debate prep · film room"
        title="Film room — clips, transcripts & debate performance"
        description="Watch, verify, and rehearse: opponent media (KATV, THV11, TBP), committee video, cross-exam bank, and argument library. INTERNAL_DRAFT — Kelly does not play clips on stage without staff verification and claims gate."
        guide={guide}
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/debate-command"
          className="rounded-full border border-kelly-navy/30 px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          Debate command
        </Link>
        <Link
          href="/admin/intelligence/video-archive-room"
          className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
        >
          Video archive
        </Link>
        <Link
          href="/admin/intelligence/sos-debate-questions"
          className="rounded-full border border-sky-300 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-950"
        >
          Expected questions
        </Link>
        <Link
          href="/admin/intelligence/trap-lanes"
          className="rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Trap lanes
        </Link>
      </V4PageHeader>

      <article className="mb-6 rounded-xl border-2 border-amber-200 bg-amber-50/50 p-4 text-xs text-amber-950">
        <p className="font-bold uppercase tracking-wider">Governance</p>
        <p className="mt-2">
          NON_PUBLISHABLE · HUMAN_REVIEW_REQUIRED · Do not cite statistics or “we have video” on stage without VERIFIED
          ledger rows. {packet.filmRoom.archiveHonestyNote}
        </p>
      </article>

      {guide ? <V4OperatorGuide guide={guide} /> : null}

      <DebateFilmRoomClient packet={packet} />
    </div>
  );
}
