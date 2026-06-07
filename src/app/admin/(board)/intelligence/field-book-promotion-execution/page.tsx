import Link from "next/link";
import { Phase11P8UpgradePassPanel } from "@/components/admin/intelligence/Phase11P8UpgradePassPanel";
import { FieldBookPromotionExecutionQueuePanel } from "@/components/admin/intelligence/field-book/FieldBookPromotionExecutionQueuePanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { buildFieldBookPromotionExecutionReport } from "@/lib/intelligence/v4/fieldBookPromotionExecutionInventory";
import {
  loadFieldBookPromotionExecutionState,
  saveFieldBookPromotionExecutionState,
  stateFromExecutionReport,
} from "@/lib/intelligence/v4/fieldBookPromotionExecutionState";
import {
  computePhase11P8UpgradePass,
  listPromotionExecutionWaveSurfaces,
} from "@/lib/intelligence/v4/phase11P8Closure";

export const dynamic = "force-dynamic";

export default function FieldBookPromotionExecutionHubPage() {
  const existingState = loadFieldBookPromotionExecutionState();
  const statusByWave = Object.fromEntries((existingState?.waves ?? []).map((w) => [w.waveId, w.status]));

  const report = buildFieldBookPromotionExecutionReport(statusByWave);
  saveFieldBookPromotionExecutionState(stateFromExecutionReport(report));

  const pass = computePhase11P8UpgradePass();
  const waves = listPromotionExecutionWaveSurfaces();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence · Field Book · Phase 11 P8"
        title="Field Book promotion execution"
        description="Eight execution waves complete the P5→P8 canon pipeline — operator Field Book body merge workflow after chunk catalogue, alignment preview, and briefing attach."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/field-book/canon"
          className="rounded-full border border-amber-400 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
        >
          Canon loop hub
        </Link>
        <Link
          href="/admin/intelligence/field-book-chunk-promotion"
          className="rounded-full border border-amber-400 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
        >
          Chunk promotion (P5)
        </Link>
        <Link
          href="/admin/intelligence/phase-11-p8-upgrade"
          className="rounded-full border border-amber-400 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
        >
          P8 upgrade pass
        </Link>
      </V4PageHeader>

      <Phase11P8UpgradePassPanel report={pass} compact />

      <FieldBookPromotionExecutionQueuePanel
        waves={waves}
        promotionPipelineReady={pass.progress.promotionPipelineReady}
      />
    </div>
  );
}
