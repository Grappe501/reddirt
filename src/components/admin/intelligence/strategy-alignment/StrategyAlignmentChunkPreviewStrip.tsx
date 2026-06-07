import Link from "next/link";
import { computePhase11P6UpgradePass } from "@/lib/intelligence/v4/phase11P6Closure";
import { tryIntelligenceLoad } from "@/lib/intelligence/safeIntelligenceLoad";
import { STRATEGY_ALIGNMENT_CHUNK_PREVIEW_HUB_HREF } from "@/lib/intelligence/v4/phase11P6StrategyAlignmentChunkPreviewDepth";

export function StrategyAlignmentChunkPreviewStrip() {
  const pass = tryIntelligenceLoad(
    "strategy-alignment-chunk-preview-strip",
    () => computePhase11P6UpgradePass(),
    {
      passId: "phase-11-p6-strategy-alignment-chunk-preview",
      title: "Step 11 P6 — Strategy alignment chunk preview",
      summary: "Chunk preview metrics unavailable on this deploy.",
      completionPct: 0,
      hubHref: STRATEGY_ALIGNMENT_CHUNK_PREVIEW_HUB_HREF,
      progress: {
        laneTotal: 8,
        lanesAtBar: 0,
        totalMatchingChunks: 0,
        p5PromotionGateOpen: false,
        fieldBookReady: false,
        canonReady: false,
        alignmentRouteBound: false,
        strategyMigrationRoutes: 0,
        overallPct: 0,
      },
    },
  );
  const p = pass.progress;

  return (
    <section className="mb-4 rounded-xl border border-purple-200/60 bg-purple-50/40 p-4 text-xs text-purple-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-bold uppercase tracking-wider">Phase 11 P6 · Chunk preview bridge</p>
          <p className="mt-1 text-kelly-muted">
            {p.lanesAtBar}/{p.laneTotal} SDI-1 preview lanes · {p.totalMatchingChunks.toLocaleString()} matching
            chunks — preview manual units before Field Book promotion.
          </p>
        </div>
        <Link
          href={STRATEGY_ALIGNMENT_CHUNK_PREVIEW_HUB_HREF}
          className="rounded-full border border-purple-300 bg-white px-3 py-1 text-[10px] font-bold text-purple-950"
        >
          Open chunk preview hub
        </Link>
      </div>
    </section>
  );
}
