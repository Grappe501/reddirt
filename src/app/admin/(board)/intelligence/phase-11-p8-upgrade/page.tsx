import Link from "next/link";
import { Phase11P8UpgradePassPanel } from "@/components/admin/intelligence/Phase11P8UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  assertPhase11P8Bar,
  computePhase11P8UpgradePass,
  FIELD_BOOK_PROMOTION_EXECUTION_HUB_HREF,
  listPromotionExecutionWaveSurfaces,
} from "@/lib/intelligence/v4/phase11P8Closure";
import { getFieldBookPromotionExecutionOverlay } from "@/lib/intelligence/v4/phase11P8FieldBookPromotionExecutionDepth";

export const dynamic = "force-dynamic";

export default function Phase11P8UpgradePage() {
  const report = computePhase11P8UpgradePass();
  const bar = assertPhase11P8Bar();
  const waves = listPromotionExecutionWaveSurfaces();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence upgrade · Phase 11 P8"
        title="Field Book promotion execution"
        description="Exit gate for eight promotion execution waves completing the P5→P8 canon pipeline with claims-gated Field Book body merge workflow."
      >
        <V4BackLinks />
        <Link
          href={FIELD_BOOK_PROMOTION_EXECUTION_HUB_HREF}
          className="rounded-full border border-amber-400 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
        >
          Execution hub
        </Link>
        <Link
          href="/admin/intelligence/field-book/canon"
          className="rounded-full border border-amber-400 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
        >
          Canon loop hub
        </Link>
      </V4PageHeader>

      <Phase11P8UpgradePassPanel report={report} />

      <section className="mb-8 rounded-xl border border-kelly-text/10 bg-white p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Exit gate</h2>
        <p className={`mt-2 text-sm font-semibold ${bar.ok ? "text-emerald-700" : "text-rose-700"}`}>
          {bar.ok ? "Phase 11 P8 bar met" : bar.message}
        </p>
        {!bar.ok ? (
          <p className="mt-2 text-xs text-kelly-muted">
            Run: <code>npx tsx scripts/test-phase11-p8-field-book-promotion-execution.ts</code>
          </p>
        ) : null}
        <p className="mt-3 text-xs text-kelly-muted">
          Pipeline ready: {report.progress.promotionPipelineReady ? "yes" : "no"} · Canon bindings:{" "}
          {report.progress.canonBindingCount}
        </p>
      </section>

      <section className="space-y-3">
        {waves.map((w) => {
          const overlay = getFieldBookPromotionExecutionOverlay(w.waveId);
          return (
            <article key={w.waveId} className="rounded-xl border border-amber-100 bg-white p-4 text-sm">
              <Link href={w.href} className="font-bold text-kelly-navy underline">
                {w.label}
              </Link>
              <p className="mt-1 text-xs text-kelly-muted">
                {w.linkedChunkCount.toLocaleString()} chunks · {overlay.operatorSteps[0]}
              </p>
            </article>
          );
        })}
      </section>
    </div>
  );
}
