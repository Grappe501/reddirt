import Link from "next/link";
import { Phase11P5UpgradePassPanel } from "@/components/admin/intelligence/Phase11P5UpgradePassPanel";
import { FieldBookChunkPromotionQueuePanel } from "@/components/admin/intelligence/field-book/FieldBookChunkPromotionQueuePanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { buildFieldBookChunkPromotionInventory } from "@/lib/intelligence/v4/fieldBookChunkPromotionInventory";
import {
  loadFieldBookChunkPromotionState,
  saveFieldBookChunkPromotionState,
  stateFromInventoryReport,
} from "@/lib/intelligence/v4/fieldBookChunkPromotionState";
import {
  computePhase11P5UpgradePass,
  listPromotionBatchSurfaces,
} from "@/lib/intelligence/v4/phase11P5Closure";

export const dynamic = "force-dynamic";

export default async function FieldBookChunkPromotionHubPage() {
  const existingState = loadFieldBookChunkPromotionState();
  const statusByBatch = Object.fromEntries((existingState?.batches ?? []).map((b) => [b.batchId, b.status]));

  const inventory = await buildFieldBookChunkPromotionInventory(statusByBatch);
  saveFieldBookChunkPromotionState(stateFromInventoryReport(inventory));

  const report = computePhase11P5UpgradePass();
  const batches = listPromotionBatchSurfaces();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence · Field Book · Phase 11 P5"
        title="Field Book chunk promotion"
        description="~2,795 strategy manual H2/H3 chunks catalogued into eleven promotion batches — operator overlays, claims gates, and canon targets for Field Book execution after ~98% intelligence readiness."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/field-book/canon"
          className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
        >
          Canon loop hub
        </Link>
        <Link
          href="/admin/intelligence/strategy-alignment"
          className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
        >
          Strategy alignment
        </Link>
        <Link
          href="/admin/intelligence/phase-11-p5-upgrade"
          className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
        >
          P5 upgrade pass
        </Link>
      </V4PageHeader>

      <Phase11P5UpgradePassPanel report={report} compact />

      <FieldBookChunkPromotionQueuePanel batches={batches} promotionGateOpen={report.progress.promotionGateOpen} />
    </div>
  );
}
