import Link from "next/link";
import { notFound } from "next/navigation";
import { DebateWeekLanesHubClient } from "@/components/admin/intelligence/DebateWeekV3HubPanels";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { DEBATE_WEEK_INTENSIVE_HUB_HREF } from "@/lib/intelligence/v4/debateWeekIntensive2026";
import {
  DEBATE_INTENSIVE_V3_LABEL,
  DEBATE_WEEK_THEORY_HUB_HREF,
  listAllDrillDownLanes,
} from "@/lib/intelligence/v4/debateWeekIntensive2026V3";
import { loadKellyDebateIntensiveProgress } from "@/lib/intelligence/v4/kellyDebateIntensiveProgress";

export const dynamic = "force-dynamic";

export default function DebateWeekLanesHubPage() {
  const progress = loadKellyDebateIntensiveProgress();
  const laneCount = listAllDrillDownLanes().length;

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow={`Intelligence · ${DEBATE_INTENSIVE_V3_LABEL}`}
        title="Drill-down lanes"
        description={`${laneCount} optional lanes across 8 days — essential first, then deeper, then stretch. Each lane explains theory, why Kelly, and what to watch for.`}
      >
        <V4BackLinks />
        <Link
          href={DEBATE_WEEK_INTENSIVE_HUB_HREF}
          className="rounded-full border border-kelly-gold/50 bg-kelly-gold/10 px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          Intensive hub
        </Link>
        <Link
          href={DEBATE_WEEK_THEORY_HUB_HREF}
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Theory library
        </Link>
      </V4PageHeader>

      <DebateWeekLanesHubClient initialProgress={progress} />
    </div>
  );
}
