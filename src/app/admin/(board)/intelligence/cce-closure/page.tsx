import Link from "next/link";
import { Phase15CceClosureQueuePanel } from "@/components/admin/intelligence/Phase15CceClosureQueuePanel";
import { Phase15P9UpgradePassPanel } from "@/components/admin/intelligence/Phase15P9UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  buildPhase15CceClosureState,
  computePhase15P9UpgradePass,
  listPhase15CceCheckpointSurfaces,
} from "@/lib/intelligence/v4/phase15P9Closure";
import { savePhase15CceClosureState } from "@/lib/intelligence/v4/phase15CceClosureState";

export const dynamic = "force-dynamic";

export default function CceClosureHubPage() {
  savePhase15CceClosureState(buildPhase15CceClosureState());

  const pass = computePhase15P9UpgradePass();
  const checkpoints = listPhase15CceCheckpointSurfaces();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence · Phase 15 · P9"
        title="Candidate Command Experience closure"
        description="Master closure pass aggregating P0+P1–P8 — eight CCE checkpoints, staff backstage enforcement, candidate nav cap, and Phase 15 exit gate."
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
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Build progress
        </Link>
        <Link
          href="/admin/intelligence/phase-15-p9-upgrade"
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          P9 upgrade pass
        </Link>
      </V4PageHeader>

      <Phase15P9UpgradePassPanel report={pass} compact />

      <Phase15CceClosureQueuePanel checkpoints={checkpoints} cceExitReady={pass.progress.cceExitReady} />
    </div>
  );
}
