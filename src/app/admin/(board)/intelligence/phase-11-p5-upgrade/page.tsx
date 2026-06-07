import Link from "next/link";
import { Phase11P5UpgradePassPanel } from "@/components/admin/intelligence/Phase11P5UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  assertPhase11P5Bar,
  computePhase11P5UpgradePass,
  FIELD_BOOK_CHUNK_PROMOTION_HUB_HREF,
  listPromotionBatchSurfaces,
} from "@/lib/intelligence/v4/phase11P5Closure";
import { getFieldBookChunkPromotionOverlay } from "@/lib/intelligence/v4/phase11P5FieldBookChunkPromotionDepth";

export const dynamic = "force-dynamic";

export default function Phase11P5UpgradePage() {
  const report = computePhase11P5UpgradePass();
  const bar = assertPhase11P5Bar();
  const batches = listPromotionBatchSurfaces();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence upgrade · Phase 11 P5"
        title="Field Book chunk promotion"
        description="Exit gate for cataloguing ~2,795 strategy manual chunks into eleven promotion batches with P5 operator overlays and canon promotion workflow infrastructure."
      >
        <V4BackLinks />
        <Link
          href={FIELD_BOOK_CHUNK_PROMOTION_HUB_HREF}
          className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
        >
          Chunk promotion hub
        </Link>
        <Link
          href="/admin/intelligence/field-book/canon"
          className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
        >
          Canon loop hub
        </Link>
      </V4PageHeader>

      <Phase11P5UpgradePassPanel report={report} />

      <section className="mb-8 rounded-xl border border-kelly-text/10 bg-white p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Exit gate</h2>
        <p className={`mt-2 text-sm font-semibold ${bar.ok ? "text-emerald-700" : "text-rose-700"}`}>
          {bar.ok ? "Phase 11 P5 bar met" : bar.message}
        </p>
        {!bar.ok ? (
          <p className="mt-2 text-xs text-kelly-muted">
            Run: <code>npx tsx scripts/test-phase11-p5-field-book-chunk-promotion.ts</code> to refresh chunk state.
          </p>
        ) : null}
        <p className="mt-3 text-xs text-kelly-muted">
          Promotion execution gate: phase-11 stack readiness ≥{report.progress.phase11StackReadinessPct}% (target 98%) ·{" "}
          {report.progress.promotionGateOpen ? "open for Field Book promotion" : "locked — finish P0–P4 passes first"}
        </p>
      </section>

      <section className="space-y-3">
        {batches.map((batch) => {
          const overlay = getFieldBookChunkPromotionOverlay(batch.batchId);
          return (
            <article key={batch.batchId} className="rounded-xl border border-amber-100 bg-white p-4 text-sm">
              <Link href={batch.href} className="font-bold text-kelly-navy underline">
                {batch.label}
              </Link>
              <p className="mt-1 text-xs text-kelly-muted">
                {batch.chunkCount.toLocaleString()} chunks · {overlay.operatorSteps[0]}
              </p>
            </article>
          );
        })}
      </section>
    </div>
  );
}
