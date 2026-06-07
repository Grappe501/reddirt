import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllTrapLaneIds, getTrapLaneDrillDown, getTrapLaneWithBriefing } from "@/lib/intelligence/v4/trapLaneDrillDowns";
import { V4TrapLaneDrillDownPanel } from "@/components/admin/intelligence/v4/V4TrapLaneDrillDownPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { evaluateStageSafeContent, resolveStageSafeAudience } from "@/lib/intelligence/v4/phase15StageSafeFilter";
import { resolveIntelligenceNavProfileServer } from "@/lib/intelligence/v4/roleBasedNavProfile";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function generateStaticParams() {
  return getAllTrapLaneIds().map((laneId) => ({ laneId }));
}

type PageProps = { params: Promise<{ laneId: string }> };

export default async function TrapLaneDrillDownPage({ params }: PageProps) {
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

  const audience = resolveStageSafeAudience(resolveIntelligenceNavProfileServer());
  const stageSafeDecision = evaluateStageSafeContent(drill.claimsGate, audience);

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow={`Trap lane ${drill.laneNumber} of 6`}
        title={drill.title}
        description="Deep prep: opponent lines, set-ups, rebuttals, scripts, zingers, and rehearsal — verify acts before stage."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/trap-lanes"
          className="rounded-full border border-kelly-navy/30 px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          ← All trap lanes
        </Link>
      </V4PageHeader>

      <V4TrapLaneDrillDownPanel drill={drill} prev={prev} next={next} stageSafeDecision={stageSafeDecision} />
    </div>
  );
}
