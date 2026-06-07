import Link from "next/link";
import { CandidateSessionDebriefPanel } from "@/components/admin/intelligence/CandidateSessionDebriefPanel";
import { Phase16P4UpgradePassPanel } from "@/components/admin/intelligence/Phase16P4UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { computePhase16P4UpgradePass } from "@/lib/intelligence/v4/phase16P4Closure";
import {
  buildPreStageChecklist,
  HUMAN_ACTION_QUEUE_HREF,
  listRecentSessionDebriefCaptures,
} from "@/lib/intelligence/v4/phase16P4SessionDebrief";

export const dynamic = "force-dynamic";

export default function SessionDebriefHubPage() {
  const report = computePhase16P4UpgradePass();
  const checklist = buildPreStageChecklist();
  const recentCaptures = listRecentSessionDebriefCaptures(5);

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence · Phase 16 · P4"
        title="Session debrief"
        description="Pre-stage checklist before doors — post-session capture for felt-risky lines and staff follow-ups reviewed on the human action queue."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/drill-queue"
          className="rounded-full border border-teal-400 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-950"
        >
          Drill queue
        </Link>
        <Link
          href={HUMAN_ACTION_QUEUE_HREF}
          className="rounded-full border border-violet-400 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Human action queue
        </Link>
        <Link
          href="/admin/intelligence"
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Command home
        </Link>
      </V4PageHeader>

      <Phase16P4UpgradePassPanel report={report} compact />

      <CandidateSessionDebriefPanel
        checklist={checklist}
        recentCaptures={recentCaptures}
        actionQueueHref={HUMAN_ACTION_QUEUE_HREF}
      />
    </div>
  );
}
