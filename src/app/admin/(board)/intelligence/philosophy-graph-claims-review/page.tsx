import Link from "next/link";
import { Phase11P4UpgradePassPanel } from "@/components/admin/intelligence/Phase11P4UpgradePassPanel";
import { PhilosophyGraphClaimsQueuePanel } from "@/components/admin/intelligence/philosophy-graph/PhilosophyGraphClaimsQueuePanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { listPhilosophyGraphClaims } from "@/lib/intelligence/claims/philosophyGraphClaimsSeed";
import {
  computePhase11P4UpgradePass,
  listPhilosophyGraphNodeSurfaces,
} from "@/lib/intelligence/v4/phase11P4Closure";

export const dynamic = "force-dynamic";

export default function PhilosophyGraphClaimsReviewHubPage() {
  const report = computePhase11P4UpgradePass();
  const nodes = listPhilosophyGraphNodeSurfaces();
  const claims = listPhilosophyGraphClaims();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence · NSI-4 · Phase 11 P4"
        title="Philosophy graph claims review"
        description="Eight civic philosophy nodes from campaign-philosophy-graph.json — each bound to a governed claim row with P4 review overlays, stage-safe wording, and do-not-say guardrails."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/campaign-intelligence-graph"
          className="rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Intelligence graph
        </Link>
        <Link
          href="/admin/intelligence/claims"
          className="rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Claims ledger
        </Link>
        <Link
          href="/admin/intelligence/phase-11-p4-upgrade"
          className="rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          P4 upgrade pass
        </Link>
      </V4PageHeader>

      <Phase11P4UpgradePassPanel report={report} compact />

      <PhilosophyGraphClaimsQueuePanel nodes={nodes} claims={claims} />
    </div>
  );
}
