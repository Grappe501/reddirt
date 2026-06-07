import Link from "next/link";
import { KellyPrepWeekPathPanel } from "@/components/admin/intelligence/KellyPrepWeekPathPanel";
import { Phase15P2UpgradePassPanel } from "@/components/admin/intelligence/Phase15P2UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { computePhase15P2UpgradePass } from "@/lib/intelligence/v4/phase15P2Closure";
import { buildKellyPrepWeekState } from "@/lib/intelligence/v4/kellyPrepWeekInventory";
import {
  KELLY_PREP_WEEK_DAYS,
  KELLY_PREP_WEEK_PRIMER,
  totalKellyPrepWeekReadMinutes,
} from "@/lib/intelligence/v4/kellyPrepWeekPath";
import { saveKellyPrepWeekState } from "@/lib/intelligence/v4/kellyPrepWeekState";

export const dynamic = "force-dynamic";

export default function KellyPrepWeekHubPage() {
  saveKellyPrepWeekState(buildKellyPrepWeekState());

  const pass = computePhase15P2UpgradePass();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence · Phase 15 · P2"
        title="Kelly prep week"
        description={`${KELLY_PREP_WEEK_PRIMER.whoThisIsFor} ~${totalKellyPrepWeekReadMinutes()} minutes across ${KELLY_PREP_WEEK_DAYS.length} days.`}
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence"
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Command home
        </Link>
        <Link
          href="/admin/intelligence/phase-15-p2-upgrade"
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          P2 upgrade pass
        </Link>
      </V4PageHeader>

      <Phase15P2UpgradePassPanel report={pass} compact />

      <KellyPrepWeekPathPanel />
    </div>
  );
}
