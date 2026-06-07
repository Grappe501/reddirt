import Link from "next/link";
import { CandidateRehearsalCoachPanel } from "@/components/admin/intelligence/CandidateRehearsalCoachPanel";
import { Phase16P7UpgradePassPanel } from "@/components/admin/intelligence/Phase16P7UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { computePhase16P7UpgradePass } from "@/lib/intelligence/v4/phase16P7Closure";
import {
  getRehearsalCoachStateForDisplay,
  listCoachAssignableEncounters,
  listStaffCoachPinOptions,
  PHASE16_P7_MAX_PINNED_DRILLS,
} from "@/lib/intelligence/v4/phase16P7StaffCoach";
import { rehearsalCoachStatePath } from "@/lib/intelligence/v4/phase16P7RehearsalCoachState";

export const dynamic = "force-dynamic";

export default function RehearsalCoachHubPage() {
  const report = computePhase16P7UpgradePass();
  const state = getRehearsalCoachStateForDisplay();
  const encounters = listCoachAssignableEncounters();
  const pinOptions = listStaffCoachPinOptions();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence · Phase 16 · P7 · Staff"
        title="Rehearsal coach"
        description="Assign tonight's encounter and pin up to three must-run drills — surfaced on Kelly's command home, STAFF profile only."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/rehearsal"
          className="rounded-full border border-amber-400 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
        >
          Session launcher
        </Link>
        <Link
          href="/admin/intelligence"
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Command home
        </Link>
      </V4PageHeader>

      <Phase16P7UpgradePassPanel report={report} compact />

      <p className="mb-4 rounded-lg border border-violet-100 bg-violet-50/30 p-3 text-xs text-kelly-muted">
        State file: <code>{rehearsalCoachStatePath().replace(/\\/g, "/")}</code>
      </p>

      <CandidateRehearsalCoachPanel
        state={state}
        encounters={encounters}
        pinOptions={pinOptions}
        maxPins={PHASE16_P7_MAX_PINNED_DRILLS}
      />
    </div>
  );
}
