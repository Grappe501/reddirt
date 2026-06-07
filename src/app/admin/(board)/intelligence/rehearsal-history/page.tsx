import Link from "next/link";
import { CandidateRehearsalHistoryPanel } from "@/components/admin/intelligence/CandidateRehearsalHistoryPanel";
import { Phase16P6UpgradePassPanel } from "@/components/admin/intelligence/Phase16P6UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { computePhase16P6UpgradePass } from "@/lib/intelligence/v4/phase16P6Closure";
import {
  getActiveSessionForDisplay,
  listSessionMemoryHistory,
} from "@/lib/intelligence/v4/phase16P6SessionMemory";
import { rehearsalSessionStatePath } from "@/lib/intelligence/v4/phase16P6SessionMemoryState";

export const dynamic = "force-dynamic";

export default function RehearsalHistoryHubPage() {
  const report = computePhase16P6UpgradePass();
  const active = getActiveSessionForDisplay();
  const history = listSessionMemoryHistory();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence · Phase 16 · P6"
        title="Rehearsal history"
        description="Session memory — continue last drill from command home, review history, staff reset when needed."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/drill-queue"
          className="rounded-full border border-teal-400 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-950"
        >
          Drill queue
        </Link>
        <Link
          href="/admin/intelligence"
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Command home
        </Link>
      </V4PageHeader>

      <Phase16P6UpgradePassPanel report={report} compact />

      <p className="mb-4 rounded-lg border border-sky-100 bg-sky-50/30 p-3 text-xs text-kelly-muted">
        State file: <code>{rehearsalSessionStatePath().replace(/\\/g, "/")}</code>
      </p>

      <CandidateRehearsalHistoryPanel active={active} history={history} />
    </div>
  );
}
