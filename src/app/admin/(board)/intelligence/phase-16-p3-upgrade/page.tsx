import Link from "next/link";
import { Phase16P3UpgradePassPanel } from "@/components/admin/intelligence/Phase16P3UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  assertPhase16P3Bar,
  computePhase16P3UpgradePass,
  DRILL_QUEUE_HUB_HREF,
} from "@/lib/intelligence/v4/phase16P3Closure";
import { listDrillQueues } from "@/lib/intelligence/v4/phase16P3DrillQueue";

export const dynamic = "force-dynamic";

export default function Phase16P3UpgradePage() {
  const report = computePhase16P3UpgradePass();
  const bar = assertPhase16P3Bar();
  const queues = listDrillQueues();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence upgrade · Phase 16 P3"
        title="Drill queue"
        description="Sequential SOS speak-order and trap pivot cards with stage-safe enforcement on every drill line."
      >
        <V4BackLinks />
        <Link
          href={DRILL_QUEUE_HUB_HREF}
          className="rounded-full border border-teal-400 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-950"
        >
          Drill queue hub
        </Link>
        <Link
          href="/admin/intelligence/encounters"
          className="rounded-full border border-violet-400 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Encounters (P2)
        </Link>
        <Link
          href="/admin/intelligence/run-of-show"
          className="rounded-full border border-orange-400 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-950"
        >
          Run-of-show (P1)
        </Link>
      </V4PageHeader>

      <Phase16P3UpgradePassPanel report={report} />

      <section className="mb-8 rounded-xl border border-kelly-text/10 bg-white p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Exit gate</h2>
        <p className={`mt-2 text-sm font-semibold ${bar.ok ? "text-emerald-700" : "text-rose-700"}`}>
          {bar.ok ? "Phase 16 P3 bar met" : bar.message}
        </p>
        {!bar.ok ? (
          <p className="mt-2 text-xs text-kelly-muted">
            Run: <code>npx tsx scripts/test-phase16-p3-drill-queue.ts</code>
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Queues ({queues.length})</h2>
        {queues.map((queue) => (
          <article key={queue.queueId} className="rounded-xl border border-teal-100 bg-white p-4 text-sm">
            <Link href={queue.launchHref} className="font-bold text-kelly-navy underline">
              {queue.title}
            </Link>
            <p className="mt-1 text-[10px] text-kelly-muted">
              {queue.cardCount} cards · ~{queue.estimatedMinutes} min
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
