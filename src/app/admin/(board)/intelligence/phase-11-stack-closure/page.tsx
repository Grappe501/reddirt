import Link from "next/link";
import { Phase11P9UpgradePassPanel } from "@/components/admin/intelligence/Phase11P9UpgradePassPanel";
import { Phase11StackClosureQueuePanel } from "@/components/admin/intelligence/Phase11StackClosureQueuePanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  buildPhase11StackClosureState,
  computePhase11P9UpgradePass,
  listPhase11StackCheckpointSurfaces,
} from "@/lib/intelligence/v4/phase11P9Closure";
import { savePhase11StackClosureState } from "@/lib/intelligence/v4/phase11StackClosureState";

export const dynamic = "force-dynamic";

export default function Phase11StackClosureHubPage() {
  savePhase11StackClosureState(buildPhase11StackClosureState());

  const pass = computePhase11P9UpgradePass();
  const checkpoints = listPhase11StackCheckpointSurfaces();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence · Phase 11 · P9"
        title="Phase 11 stack closure"
        description="Master closure pass aggregating P0–P8 — nine stack checkpoints, promotion pipeline readiness, and Phase 11 exit gate for the strategy-manual → Field Book canon workflow."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/strategy-philosophy-hub"
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Strategy hub
        </Link>
        <Link
          href="/admin/intelligence/build-progress"
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Build progress
        </Link>
        <Link
          href="/admin/intelligence/phase-11-p9-upgrade"
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          P9 upgrade pass
        </Link>
      </V4PageHeader>

      <Phase11P9UpgradePassPanel report={pass} compact />

      <Phase11StackClosureQueuePanel checkpoints={checkpoints} stackExitReady={pass.progress.stackExitReady} />
    </div>
  );
}
