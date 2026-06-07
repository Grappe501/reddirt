import Link from "next/link";
import { Phase16P9UpgradePassPanel } from "@/components/admin/intelligence/Phase16P9UpgradePassPanel";
import { Phase16SreClosureQueuePanel } from "@/components/admin/intelligence/Phase16SreClosureQueuePanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  buildPhase16SreClosureState,
  computePhase16P9UpgradePass,
  listPhase16SreCheckpointSurfaces,
} from "@/lib/intelligence/v4/phase16P9Closure";
import { savePhase16SreClosureState } from "@/lib/intelligence/v4/phase16P9SreClosureState";

export const dynamic = "force-dynamic";

export default function SreClosureHubPage() {
  savePhase16SreClosureState(buildPhase16SreClosureState());

  const pass = computePhase16P9UpgradePass();
  const checkpoints = listPhase16SreCheckpointSurfaces();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence · Phase 16 · P9"
        title="Stage Rehearsal Engine closure"
        description="Master closure pass aggregating P0–P8 — nine SRE checkpoints, staff coach guard, iPad drill player, drill queue stage-safe, and candidate nav cap."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence"
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Command home
        </Link>
        <Link
          href="/admin/intelligence/build-progress"
          className="rounded-full border border-amber-400 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
        >
          Build progress
        </Link>
        <Link
          href="/admin/intelligence/phase-16-p9-upgrade"
          className="rounded-full border border-amber-400 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
        >
          P9 upgrade pass
        </Link>
      </V4PageHeader>

      <Phase16P9UpgradePassPanel report={pass} compact />

      <Phase16SreClosureQueuePanel checkpoints={checkpoints} sreExitReady={pass.progress.sreExitReady} />
    </div>
  );
}
