import Link from "next/link";
import {
  KellyStrategicPlanChapterInventoryPanel,
  Phase11P1UpgradePassPanel,
} from "@/components/admin/intelligence/Phase11P1UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  computePhase11P1UpgradePass,
  listKellyStrategicPlanChapterSurfaces,
  KELLY_STRATEGIC_PLAN_HUB_HREF,
} from "@/lib/intelligence/v4/phase11KellyStrategicPlanClosure";
import { CAMPAIGN_SYSTEM_MANUAL_HUB_HREF } from "@/lib/campaign-strategy/campaign-system-nav";

export const dynamic = "force-dynamic";

export default function Phase11P1UpgradePage() {
  const report = computePhase11P1UpgradePass();
  const chapters = listKellyStrategicPlanChapterSurfaces();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence upgrade · Phase 11 · P1"
        title="Kelly SOS strategic plan command"
        description="Intelligence-native reader for all 22 Kelly manual chapters — full Phase 11 P1 depth overlays tying every program and foundation chapter to debate prep and strategy command."
      >
        <V4BackLinks />
        <Link
          href={KELLY_STRATEGIC_PLAN_HUB_HREF}
          className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-950"
        >
          Kelly strategic plan
        </Link>
        <Link
          href={CAMPAIGN_SYSTEM_MANUAL_HUB_HREF}
          className="rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Phase 11 P0
        </Link>
        <Link
          href="/admin/intelligence/strategy-philosophy-hub"
          className="rounded-full border border-indigo-300 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Strategy hub
        </Link>
      </V4PageHeader>

      <Phase11P1UpgradePassPanel report={report} />

      <section className="mb-8 rounded-xl border border-kelly-navy/15 bg-white p-6 text-sm leading-relaxed">
        <h2 className="font-heading text-xl font-bold text-kelly-navy">P1 deliverables</h2>
        <ol className="mt-4 list-inside list-decimal space-y-2 text-kelly-muted">
          <li>Intelligence reader at {KELLY_STRATEGIC_PLAN_HUB_HREF} mirroring Kelly SOS manual nav.</li>
          <li>Phase 11 P1 depth overlay on all 22 chapters — debate application + operator steps + intelligence links.</li>
          <li>Chapter intelligence panel above markdown on every drill-down page.</li>
          <li>Field Book kelly-strategic-plan-command + canon binding + strategy migration bridge.</li>
          <li>strategyPhilosophyInventory updated — all Kelly chapters point to intelligence hrefs.</li>
        </ol>
      </section>

      <KellyStrategicPlanChapterInventoryPanel chapters={chapters} />
    </div>
  );
}
