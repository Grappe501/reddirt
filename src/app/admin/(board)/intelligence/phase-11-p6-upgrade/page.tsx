import Link from "next/link";
import { Phase11P6UpgradePassPanel } from "@/components/admin/intelligence/Phase11P6UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  assertPhase11P6Bar,
  computePhase11P6UpgradePass,
  listAlignmentChunkPreviewLaneSurfaces,
  STRATEGY_ALIGNMENT_CHUNK_PREVIEW_HUB_HREF,
} from "@/lib/intelligence/v4/phase11P6Closure";
import { getStrategyAlignmentChunkPreviewOverlay } from "@/lib/intelligence/v4/phase11P6StrategyAlignmentChunkPreviewDepth";

export const dynamic = "force-dynamic";

export default function Phase11P6UpgradePage() {
  const report = computePhase11P6UpgradePass();
  const bar = assertPhase11P6Bar();
  const lanes = listAlignmentChunkPreviewLaneSurfaces();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence upgrade · Phase 11 P6"
        title="Strategy alignment chunk preview"
        description="Exit gate for eight SDI-1 alignment preview lanes wiring P5 promotion batches to strategy-alignment chunk filters and claims-gated Field Book handoff."
      >
        <V4BackLinks />
        <Link
          href={STRATEGY_ALIGNMENT_CHUNK_PREVIEW_HUB_HREF}
          className="rounded-full border border-purple-300 bg-purple-50 px-3 py-1 text-xs font-bold text-purple-950"
        >
          Chunk preview hub
        </Link>
        <Link
          href="/admin/intelligence/strategy-alignment"
          className="rounded-full border border-purple-300 bg-purple-50 px-3 py-1 text-xs font-bold text-purple-950"
        >
          Strategy alignment
        </Link>
      </V4PageHeader>

      <Phase11P6UpgradePassPanel report={report} />

      <section className="mb-8 rounded-xl border border-kelly-text/10 bg-white p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Exit gate</h2>
        <p className={`mt-2 text-sm font-semibold ${bar.ok ? "text-emerald-700" : "text-rose-700"}`}>
          {bar.ok ? "Phase 11 P6 bar met" : bar.message}
        </p>
        {!bar.ok ? (
          <p className="mt-2 text-xs text-kelly-muted">
            Run: <code>npx tsx scripts/test-phase11-p6-strategy-alignment-chunk-preview.ts</code>
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        {lanes.map((lane) => {
          const overlay = getStrategyAlignmentChunkPreviewOverlay(lane.laneId);
          return (
            <article key={lane.laneId} className="rounded-xl border border-purple-100 bg-white p-4 text-sm">
              <Link href={lane.href} className="font-bold text-kelly-navy underline">
                {lane.label}
              </Link>
              <p className="mt-1 text-xs text-kelly-muted">
                {lane.matchingChunkCount.toLocaleString()} chunks · {overlay.operatorSteps[0]}
              </p>
            </article>
          );
        })}
      </section>
    </div>
  );
}
