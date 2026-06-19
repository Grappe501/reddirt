import Link from "next/link";
import { notFound } from "next/navigation";

import { DebateWeekLaneDetailClient } from "@/components/admin/intelligence/DebateWeekLaneDetailClient";
import { ElectionPlanDebatePrepSubnav } from "@/components/election-plan/ElectionPlanDebatePrepSubnav";
import { DEBATE_PREP_PACKAGE_LABEL } from "@/lib/election-plan/debate-prep-links";
import {
  EP_DEBATE_PREP_HREF,
  EP_DEBATE_PREP_LANES_HREF,
  EP_DEBATE_PREP_PROGRESS_API,
} from "@/lib/election-plan/debate-prep-links";
import {
  epDebatePrepDayHref,
  mapAdminHrefToElectionPlan,
} from "@/lib/election-plan/debate-prep-route-map";
import { DEBATE_WEEK_INTENSIVE_DAYS } from "@/lib/intelligence/v4/debateWeekIntensive2026";
import { getDrillDownLane, listAllDrillDownLanes } from "@/lib/intelligence/v4/debateWeekIntensive2026V3";
import { loadKellyDebateIntensiveProgress } from "@/lib/intelligence/v4/kellyDebateIntensiveProgress";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return listAllDrillDownLanes().map((lane) => ({ laneId: lane.id }));
}

export const metadata = {
  title: "Drill Lane | Debate Prep | Election Plan",
  robots: { index: false, follow: false },
};

export default async function ElectionPlanDebatePrepLanePage({
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
    <>
      <div className="ep-classification">Internal · Drill lane · {DEBATE_PREP_PACKAGE_LABEL}</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <ElectionPlanDebatePrepSubnav />

          <header className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--ep-gold)]">
              Day {day.day} · {lane.tier} lane · ~{lane.minutes} min
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold text-[var(--ep-navy)]">{lane.title}</h1>
            <p className="mt-3 text-sm text-[var(--ep-navy-muted)]">{lane.subtitle}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
              <Link href={EP_DEBATE_PREP_LANES_HREF} className="rounded-full border border-[var(--ep-border)] px-3 py-1 hover:border-[var(--ep-navy)]">
                All lanes
              </Link>
              <Link href={epDebatePrepDayHref(lane.dayId)} className="rounded-full border border-[var(--ep-border)] px-3 py-1 hover:border-[var(--ep-navy)]">
                Day {day.day} page
              </Link>
              <Link href={EP_DEBATE_PREP_HREF} className="rounded-full border border-[var(--ep-border)] px-3 py-1 hover:border-[var(--ep-navy)]">
                Debate prep hub
              </Link>
            </div>
          </header>

          <DebateWeekLaneDetailClient
            lane={lane}
            initialDone={done}
            progressApiBase={EP_DEBATE_PREP_PROGRESS_API}
            resolveHref={mapAdminHrefToElectionPlan}
          />
        </div>
      </div>
    </>
  );
}
