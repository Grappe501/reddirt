import Link from "next/link";
import {
  CampaignSystemCategoryGuidePanel,
  Phase11UpgradePassPanel,
} from "@/components/admin/intelligence/Phase11UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { listCampaignSystemCategoryGuides } from "@/lib/intelligence/v4/campaignSystemManualInventory";
import { computePhase11UpgradePass } from "@/lib/intelligence/v4/phase11CampaignSystemClosure";
import { CAMPAIGN_SYSTEM_MANUAL_HUB_HREF } from "@/lib/campaign-strategy/campaign-system-nav";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function Phase11UpgradePage() {
  const report = await computePhase11UpgradePass();
  const guides = listCampaignSystemCategoryGuides();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence upgrade · Phase 11 · P0"
        title="Campaign system manual surfacing"
        description="First post–Phase 10 priority — bring 252 hidden operational documents into the intelligence tree with category inventory, browsable reader, and strategy command cross-links."
      >
        <V4BackLinks />
        <Link
          href={CAMPAIGN_SYSTEM_MANUAL_HUB_HREF}
          className="rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Campaign system hub
        </Link>
        <Link
          href="/admin/intelligence/strategy-philosophy-hub"
          className="rounded-full border border-indigo-300 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Strategy hub
        </Link>
        <Link
          href="/admin/intelligence/strategy-philosophy-hub"
          className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
        >
          Phase 10 hub
        </Link>
      </V4PageHeader>

      <Phase11UpgradePassPanel report={report} />

      <section className="mb-8 rounded-xl border border-kelly-navy/15 bg-white p-6 text-sm leading-relaxed">
        <h2 className="font-heading text-xl font-bold text-kelly-navy">P0 deliverables</h2>
        <ol className="mt-4 list-inside list-decimal space-y-2 text-kelly-muted">
          <li>
            Intelligence-native reader at {CAMPAIGN_SYSTEM_MANUAL_HUB_HREF} with 8 category sections and full file
            inventory.
          </li>
          <li>Category operator guides with intelligence cross-links (debate prep, strategy hub, morning brief, claims).</li>
          <li>Priority tome paths flagged for Phase 11 enrichment (lifecycle manual, simulation, tool stack, morning brief).</li>
          <li>Field Book article campaign-system-manual-command + canon binding + strategy migration bridge route.</li>
          <li>Nav release batch for staff lane discoverability.</li>
        </ol>
      </section>

      <CampaignSystemCategoryGuidePanel guides={guides} />
    </div>
  );
}
