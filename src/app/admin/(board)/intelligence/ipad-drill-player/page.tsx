import Link from "next/link";
import { notFound } from "next/navigation";
import { CandidateIpadDrillPlayerView } from "@/components/admin/intelligence/CandidateIpadDrillPlayerView";
import { Phase16P5UpgradePassPanel } from "@/components/admin/intelligence/Phase16P5UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { CANDIDATE_IPAD_DEPLOY_HINT } from "@/lib/intelligence/candidateIpadMode";
import { computePhase16P5UpgradePass } from "@/lib/intelligence/v4/phase16P5Closure";
import {
  buildIpadDrillPlayerHref,
  PHASE16_P5_MAX_COLUMN_PX,
  PHASE16_P5_MIN_TOUCH_TARGET_PX,
  resolveIpadDrillPlayerSession,
} from "@/lib/intelligence/v4/phase16P5IpadDrillPlayer";
import { recordDrillQueueProgress } from "@/lib/intelligence/v4/phase16P6SessionMemory";

export const dynamic = "force-dynamic";

export default async function IpadDrillPlayerPage({
  searchParams,
}: {
  searchParams: Promise<{ queue?: string; card?: string }>;
}) {
  const params = await searchParams;
  const session = resolveIpadDrillPlayerSession(params.queue, params.card);
  if (!session) notFound();

  recordDrillQueueProgress(session.queueId, session.cardIndex + 1, "ipad-drill");
  const report = computePhase16P5UpgradePass();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence · Phase 16 · P5 · iPad"
        title="Drill player"
        description={`Full-screen drill stepper — ${PHASE16_P5_MIN_TOUCH_TARGET_PX}px touch targets · ${PHASE16_P5_MAX_COLUMN_PX}px column · Exit · Prev · Next · Timer.`}
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/drill-queue"
          className="rounded-full border border-teal-400 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-950"
        >
          Desktop drill queue
        </Link>
      </V4PageHeader>

      <Phase16P5UpgradePassPanel report={report} compact />

      <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-950">
        {CANDIDATE_IPAD_DEPLOY_HINT} Bottom nav collapses to drill controls when this route is active in iPad shell.
      </p>

      <CandidateIpadDrillPlayerView session={session} />

      <div className="mt-6 flex flex-wrap gap-2">
        {session.cards.map((c, i) => (
          <Link
            key={c.cardId}
            href={buildIpadDrillPlayerHref(session.queueId, i + 1)}
            className={`min-h-12 rounded-full border px-3 py-2 text-[10px] font-bold ${
              i === session.cardIndex
                ? "border-teal-500 bg-teal-600 text-white"
                : "border-teal-200 bg-white text-teal-950"
            }`}
          >
            {i + 1}
          </Link>
        ))}
      </div>
    </div>
  );
}
