import Link from "next/link";
import {
  loadOppositionStrategyLayerPacket,
  INTEGRITY_2021_PACKAGE_DEPTH,
  PETITION_2025_CLUSTER_DEPTH,
} from "@/lib/intelligence/v4/oppositionStrategyLayer";
import { V4OppositionStrategyLayerPanel } from "@/components/admin/intelligence/v4/V4OppositionStrategyLayerPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function OppositionStrategyLayerPage() {
  const packet = loadOppositionStrategyLayerPacket();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence v6.2 · opposition strategy layer"
        title="Opposition strategy command"
        description="Trap lanes, 2021 integrity architecture, 2025 petition cluster, six offensive moves, Kelly defense vectors, and cross-exam starters — the offense half of the supreme workbench."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/supreme-workbench"
          className="rounded-full border border-kelly-navy/30 px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          Supreme workbench
        </Link>
        <Link
          href="/admin/intelligence/trap-lanes"
          className="rounded-full border border-rose-800/30 px-3 py-1 text-xs font-bold text-rose-950"
        >
          Trap lanes
        </Link>
      </V4PageHeader>

      <V4OppositionStrategyLayerPanel
        packet={packet}
        integrity2021={INTEGRITY_2021_PACKAGE_DEPTH}
        petition2025={PETITION_2025_CLUSTER_DEPTH}
        variant="full"
      />
    </div>
  );
}
