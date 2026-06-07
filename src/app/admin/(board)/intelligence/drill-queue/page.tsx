import Link from "next/link";
import { Suspense } from "react";
import { CandidateDrillQueuePanel } from "@/components/admin/intelligence/CandidateDrillQueuePanel";
import { Phase16P3UpgradePassPanel } from "@/components/admin/intelligence/Phase16P3UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { computePhase16P3UpgradePass } from "@/lib/intelligence/v4/phase16P3Closure";
import {
  getDrillQueue,
  getDrillQueueCards,
  listDrillQueues,
  resolveDrillQueueId,
  resolveDrillQueueCardIndex,
} from "@/lib/intelligence/v4/phase16P3DrillQueue";
import { buildIpadDrillPlayerHref } from "@/lib/intelligence/v4/phase16P5IpadDrillPlayer";
import { recordDrillQueueProgress } from "@/lib/intelligence/v4/phase16P6SessionMemory";

export const dynamic = "force-dynamic";

export default async function DrillQueueHubPage({
  searchParams,
}: {
  searchParams: Promise<{ queue?: string; card?: string }>;
}) {
  const params = await searchParams;
  const queueId = resolveDrillQueueId(params.queue);
  const cardNumber = resolveDrillQueueCardIndex(params.card, getDrillQueueCards(queueId).length) + 1;
  recordDrillQueueProgress(queueId, cardNumber, "drill-queue");
  const report = computePhase16P3UpgradePass();
  const queues = listDrillQueues();
  const activeQueue = getDrillQueue(queueId)!;
  const cards = getDrillQueueCards(queueId);

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence · Phase 16 · P3"
        title="Drill queue"
        description="Sequential speak-order drills — one card at a time from SOS bank and trap lanes, with stage-safe gates on every line."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/rehearsal"
          className="rounded-full border border-amber-400 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
        >
          Session launcher
        </Link>
        <Link
          href="/admin/intelligence/encounters"
          className="rounded-full border border-violet-400 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Encounter scenarios
        </Link>
        <Link
          href={buildIpadDrillPlayerHref(queueId, 1)}
          className="rounded-full border border-cyan-400 bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-950"
        >
          iPad drill player
        </Link>
        <Link
          href="/admin/intelligence"
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Command home
        </Link>
      </V4PageHeader>

      <Phase16P3UpgradePassPanel report={report} compact />

      <section className="mb-6 rounded-xl border border-teal-100 bg-white p-5 text-sm">
        <p className="font-bold text-kelly-navy">{activeQueue.title}</p>
        <p className="mt-2 text-kelly-muted">{activeQueue.description}</p>
        <p className="mt-3 text-xs text-kelly-muted">
          {activeQueue.cardCount} cards · ~{activeQueue.estimatedMinutes} minutes
        </p>
        <p className="mt-2 rounded-lg border border-teal-100 bg-teal-50/40 p-2 text-xs italic text-kelly-text">
          Kelly rule: {activeQueue.kellyRule}
        </p>
      </section>

      <Suspense fallback={<p className="text-sm text-kelly-muted">Loading drill card…</p>}>
        <CandidateDrillQueuePanel queues={queues} cards={cards} activeQueue={activeQueue} />
      </Suspense>
    </div>
  );
}
