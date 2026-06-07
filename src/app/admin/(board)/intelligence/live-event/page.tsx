import Link from "next/link";
import { CandidateLiveEventPanel } from "@/components/admin/intelligence/CandidateLiveEventPanel";
import { Phase16P8UpgradePassPanel } from "@/components/admin/intelligence/Phase16P8UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { computePhase16P8UpgradePass } from "@/lib/intelligence/v4/phase16P8Closure";
import {
  buildLiveEventDayOfPlan,
  buildLiveEventSummary,
  isLiveEventModeActive,
  SRE_LIVE_EVENT_ENV_KEY,
} from "@/lib/intelligence/v4/phase16P8LiveEventMode";

export const dynamic = "force-dynamic";

export default function LiveEventHubPage() {
  const report = computePhase16P8UpgradePass();
  const summary = buildLiveEventSummary();
  const plan = buildLiveEventDayOfPlan();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence · Phase 16 · P8"
        title="Live event mode"
        description="ACCA Jun 11 countdown — day-of run-of-show auto-selects shortest stage-safe path when clerk week or live env is active."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/county-clerk-week/acca-summer-conference"
          className="rounded-full border border-amber-400 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
        >
          ACCA prep
        </Link>
        <Link
          href="/admin/intelligence/encounters?scenario=acca-panel"
          className="rounded-full border border-orange-400 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-950"
        >
          ACCA encounter
        </Link>
      </V4PageHeader>

      <Phase16P8UpgradePassPanel report={report} compact />

      <p className="mb-4 rounded-lg border border-orange-100 bg-orange-50/30 p-3 text-xs text-kelly-muted">
        Live mode: <strong>{isLiveEventModeActive() ? "active" : "inactive"}</strong> · env{" "}
        <code>{SRE_LIVE_EVENT_ENV_KEY}=acca-panel-2026</code> or county clerk audience
      </p>

      <CandidateLiveEventPanel summary={summary} plan={plan} />
    </div>
  );
}
