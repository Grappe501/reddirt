import Link from "next/link";
import { Phase11P6UpgradePassPanel } from "@/components/admin/intelligence/Phase11P6UpgradePassPanel";
import { StrategyAlignmentChunkPreviewQueuePanel } from "@/components/admin/intelligence/strategy-alignment/StrategyAlignmentChunkPreviewQueuePanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  computePhase11P6UpgradePass,
  listAlignmentChunkPreviewLaneSurfaces,
} from "@/lib/intelligence/v4/phase11P6Closure";
import { buildStrategyAlignmentChunkPreviewReport } from "@/lib/intelligence/v4/strategyAlignmentChunkPreviewInventory";
import {
  saveStrategyAlignmentChunkPreviewState,
  stateFromPreviewReport,
} from "@/lib/intelligence/v4/strategyAlignmentChunkPreviewState";

export const dynamic = "force-dynamic";

export default async function StrategyAlignmentChunkPreviewHubPage() {
  const report = await buildStrategyAlignmentChunkPreviewReport();
  saveStrategyAlignmentChunkPreviewState(stateFromPreviewReport(report));

  const pass = computePhase11P6UpgradePass();
  const lanes = listAlignmentChunkPreviewLaneSurfaces();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence · SDI-1 · Phase 11 P6"
        title="Strategy alignment chunk preview"
        description="Eight preview lanes crosswalk P5 promotion batches with SDI-1 doctrine alignment — operator chunk filters, claims preview steps, and Field Book handoff before canon promotion."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/strategy-alignment"
          className="rounded-full border border-purple-300 bg-purple-50 px-3 py-1 text-xs font-bold text-purple-950"
        >
          Strategy alignment
        </Link>
        <Link
          href="/admin/intelligence/field-book-chunk-promotion"
          className="rounded-full border border-purple-300 bg-purple-50 px-3 py-1 text-xs font-bold text-purple-950"
        >
          Chunk promotion (P5)
        </Link>
        <Link
          href="/admin/intelligence/phase-11-p6-upgrade"
          className="rounded-full border border-purple-300 bg-purple-50 px-3 py-1 text-xs font-bold text-purple-950"
        >
          P6 upgrade pass
        </Link>
      </V4PageHeader>

      <Phase11P6UpgradePassPanel report={pass} compact />

      <StrategyAlignmentChunkPreviewQueuePanel lanes={lanes} />
    </div>
  );
}
