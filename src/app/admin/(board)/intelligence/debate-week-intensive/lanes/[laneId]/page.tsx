import Link from "next/link";
import { notFound } from "next/navigation";
import { DebateWeekLaneDetailClient } from "@/components/admin/intelligence/DebateWeekLaneDetailClient";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  DEBATE_WEEK_INTENSIVE_DAYS,
  debateWeekIntensiveDayHref,
  DEBATE_WEEK_INTENSIVE_HUB_HREF,
} from "@/lib/intelligence/v4/debateWeekIntensive2026";
import {
  DEBATE_WEEK_LANES_HUB_HREF,
  getDrillDownLane,
  listAllDrillDownLanes,
} from "@/lib/intelligence/v4/debateWeekIntensive2026V3";
import { loadKellyDebateIntensiveProgress } from "@/lib/intelligence/v4/kellyDebateIntensiveProgress";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return listAllDrillDownLanes().map((lane) => ({ laneId: lane.id }));
}

export default async function DebateWeekLanePage({
  params,
}: {
  params: Promise<{ laneId: string }>;
}) {
  const { laneId } = await params;
  const lane = getDrillDownLane(laneId);
  if (!lane) notFound();

  const day = DEBATE_WEEK_INTENSIVE_DAYS.find((d) => d.dayId === lane.dayId)!;
  const progress = loadKellyDebateIntensiveProgress();
  const done = (progress.completedLanes ?? []).includes(lane.id);

  return (
    <div className="mx-auto max-w-4xl text-kelly-text">
      <V4PageHeader
        eyebrow={`Day ${day.day} · ${lane.tier} lane · ~${lane.minutes} min`}
        title={lane.title}
        description={lane.subtitle}
      >
        <V4BackLinks />
        <Link
          href={DEBATE_WEEK_LANES_HUB_HREF}
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          All lanes
        </Link>
        <Link
          href={debateWeekIntensiveDayHref(lane.dayId)}
          className="rounded-full border border-kelly-gold/50 bg-kelly-gold/10 px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          Day {day.day} page
        </Link>
        <Link
          href={DEBATE_WEEK_INTENSIVE_HUB_HREF}
          className="rounded-full border border-kelly-text/15 px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          Hub
        </Link>
      </V4PageHeader>

      <DebateWeekLaneDetailClient lane={lane} initialDone={done} />
    </div>
  );
}
