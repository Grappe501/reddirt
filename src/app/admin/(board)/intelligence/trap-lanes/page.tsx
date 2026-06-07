import Link from "next/link";
import { EvidenceHonestyBadgeFromText } from "@/components/admin/intelligence/EvidenceHonestyBadge";
import { listTrapLaneSummaries, TRAP_LANE_FIRST_TIMER_NOTE } from "@/lib/intelligence/v4/trapLaneDrillDowns";
import { getSurfaceGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const card =
  "flex flex-col rounded-xl border-2 border-kelly-gold/30 bg-white p-5 shadow-sm transition active:border-kelly-navy/50 min-h-[120px]";

export default function TrapLanesIndexPage() {
  const lanes = listTrapLaneSummaries();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Debate prep · trap lanes"
        title="Trap lanes — full drill-down"
        description="Position Hammer into your hand: what to expect him to say, set-ups, rebuttals, sample scripts, and pivots. Tap any lane for deep narrative — built for Kelly's first debate."
        guide={getSurfaceGuide("trap-lanes-index")}
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence"
          className="rounded-full border border-kelly-navy/30 px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          Command hub
        </Link>
        <Link
          href="/admin/intelligence/kelly-debate-coaching"
          className="rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Debate coaching
        </Link>
      </V4PageHeader>

      <div className="mb-6 max-w-xl">
        <EvidenceHonestyBadgeFromText text="NEEDS_REVIEW — verify acts before stage · per-lane claimsGate" showMessage />
      </div>

      <article className="mb-6 rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-sm text-amber-950">
        {TRAP_LANE_FIRST_TIMER_NOTE}
      </article>

      <p className="mb-4 text-xs text-kelly-muted">
        Plain-language attack and recovery guides:{" "}
        <Link href="/admin/intelligence/debate-depth/hammer-attacks" className="font-bold text-kelly-navy underline">
          How Hammer attacks
        </Link>
        {" · "}
        <Link href="/admin/intelligence/debate-depth/culture-war" className="font-bold text-kelly-navy underline">
          Culture-war defense
        </Link>
        {" · "}
        <Link href="/admin/intelligence/debate-depth/if-stuck" className="font-bold text-kelly-navy underline">
          If you get stuck
        </Link>
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {lanes.map((lane, i) => (
          <Link key={lane.laneId} href={`/admin/intelligence/trap-lanes/${lane.laneId}`} className={card}>
            <span className="text-[10px] font-bold uppercase text-violet-800">Lane {i + 1}</span>
            <h2 className="mt-2 font-heading text-lg font-bold text-kelly-navy">{lane.title}</h2>
            <p className="mt-2 flex-1 text-xs text-kelly-muted line-clamp-4">{lane.summary}</p>
            <p className="mt-4 text-xs font-bold text-kelly-gold">Open full drill-down →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
