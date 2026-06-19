import Link from "next/link";
import { notFound } from "next/navigation";

import { V4TrapLaneDrillDownPanel } from "@/components/admin/intelligence/v4/V4TrapLaneDrillDownPanel";
import { ElectionPlanDebatePrepSubnav } from "@/components/election-plan/ElectionPlanDebatePrepSubnav";
import { VoterAudienceSpeakToBanner } from "@/components/election-plan/voter-audience/VoterAudienceSpeakToBanner";
import { EP_TRAP_LANES_HREF, epTrapLaneHref } from "@/lib/election-plan/debate-prep-links";
import { mapAdminHrefToElectionPlan } from "@/lib/election-plan/debate-prep-route-map";
import { resolveAudiencesForTrapLane } from "@/lib/election-plan/voter-audience-models/resolve-audiences";
import { evaluateStageSafeContent } from "@/lib/intelligence/v4/phase15StageSafeFilter";
import { getAllTrapLaneIds, getTrapLaneDrillDown, getTrapLaneWithBriefing } from "@/lib/intelligence/v4/trapLaneDrillDowns";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return getAllTrapLaneIds().map((laneId) => ({ laneId }));
}

export async function generateMetadata({ params }: { params: Promise<{ laneId: string }> }) {
  const { laneId } = await params;
  const drill = getTrapLaneDrillDown(laneId);
  if (!drill) return { title: "Trap lane not found" };
  return {
    title: `${drill.title} | Trap Lanes | Debate Prep`,
    robots: { index: false, follow: false },
  };
}

export default async function ElectionPlanTrapLaneDetailPage({
  params,
}: {
  params: Promise<{ laneId: string }>;
}) {
  const { laneId } = await params;
  const drill = getTrapLaneWithBriefing(laneId);
  if (!drill) notFound();

  const ids = getAllTrapLaneIds();
  const idx = ids.indexOf(laneId);
  const prev = idx > 0 ? { laneId: ids[idx - 1], title: getTrapLaneDrillDown(ids[idx - 1])!.title } : null;
  const next =
    idx >= 0 && idx < ids.length - 1
      ? { laneId: ids[idx + 1], title: getTrapLaneDrillDown(ids[idx + 1])!.title }
      : null;

  const stageSafeDecision = evaluateStageSafeContent(drill.claimsGate, "candidate");

  return (
    <>
      <div className="ep-classification">Internal · Trap lane {drill.laneNumber} of 6 · Debate prep</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <ElectionPlanDebatePrepSubnav />

          <header className="mb-6">
            <Link href={EP_TRAP_LANES_HREF} className="text-xs font-bold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
              ← All trap lanes
            </Link>
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.24em] text-violet-800">
              Trap lane {drill.laneNumber} of 6 · ~{drill.estimatedPrepMinutes} min prep
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold text-[var(--ep-navy)]">{drill.title}</h1>
            <p className="mt-3 text-sm text-[var(--ep-navy-muted)]">{drill.summary}</p>
          </header>

          <VoterAudienceSpeakToBanner profiles={resolveAudiencesForTrapLane(laneId)} />

          <V4TrapLaneDrillDownPanel
            drill={drill}
            prev={prev}
            next={next}
            stageSafeDecision={stageSafeDecision}
            trapLaneHref={epTrapLaneHref}
            trapLanesIndexHref={EP_TRAP_LANES_HREF}
            resolveHref={mapAdminHrefToElectionPlan}
          />
        </div>
      </div>
    </>
  );
}
