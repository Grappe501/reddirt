import Link from "next/link";
import { Phase11P2UpgradePassPanel } from "@/components/admin/intelligence/Phase11P2UpgradePassPanel";
import { StaffStrategySurfacePanel } from "@/components/admin/intelligence/staff-strategy/StaffStrategySurfacePanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { computePhase11P2UpgradePass, listStaffStrategySurfaceSummaries } from "@/lib/intelligence/v4/phase11P2Closure";
import { getStaffStrategySurfaceOverlay } from "@/lib/intelligence/v4/phase11P2StaffStrategyDepth";

export const dynamic = "force-dynamic";

export default function StaffStrategyCommandPage() {
  const report = computePhase11P2UpgradePass();
  const surfaces = listStaffStrategySurfaceSummaries();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence · Staff lane · Phase 11 P2"
        title="Staff strategy command"
        description="Morning brief, briefing papers, writing toolbox, and NSI pathway/graph/simulation — operator overlays wired to movement philosophy and campaign system manual."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/movement-philosophy"
          className="rounded-full border border-indigo-300 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Movement philosophy
        </Link>
        <Link
          href="/admin/intelligence/phase-11-p2-upgrade"
          className="rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          P2 upgrade pass
        </Link>
      </V4PageHeader>

      <Phase11P2UpgradePassPanel report={report} compact />

      <section className="space-y-4">
        {surfaces.map((surface) => (
          <StaffStrategySurfacePanel
            key={surface.id}
            surface={surface}
            overlay={getStaffStrategySurfaceOverlay(surface.id)}
          />
        ))}
      </section>
    </div>
  );
}
