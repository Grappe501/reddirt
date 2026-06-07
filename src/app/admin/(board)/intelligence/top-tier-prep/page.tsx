import Link from "next/link";
import { CandidateTopTierPrepPanel } from "@/components/admin/intelligence/CandidateTopTierPrepPanel";
import { Phase15P4UpgradePassPanel } from "@/components/admin/intelligence/Phase15P4UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  computePhase15P4UpgradePass,
  listTopTierPrepSurfaces,
  TOP_TIER_PREP_HUB_HREF,
} from "@/lib/intelligence/v4/phase15P4Closure";
import { countTopTierPrepMinutes } from "@/lib/intelligence/v4/phase15P4TopTierSurfacing";

export const dynamic = "force-dynamic";

export default function TopTierPrepHubPage() {
  const report = computePhase15P4UpgradePass();
  const items = listTopTierPrepSurfaces();
  const minutes = countTopTierPrepMinutes(items);

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence · Phase 15 · P4"
        title="Top-tier prep"
        description="Eight philosophy briefings, five plain-language depth guides, and eight psychology sections — promoted for candidate command home instead of buried under builder nav."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence"
          className="rounded-full border border-violet-400 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Command home
        </Link>
        <Link
          href="/admin/intelligence/debate-briefings"
          className="rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          All briefings
        </Link>
      </V4PageHeader>

      <Phase15P4UpgradePassPanel report={report} compact />

      <section className="mb-8 rounded-xl border border-violet-100 bg-white p-5 text-sm">
        <p className="font-bold text-kelly-navy">
          {items.length} promoted surfaces · ~{minutes} minutes total
        </p>
        <p className="mt-2 text-kelly-muted">
          Read tier A first (briefings + depth), then tier B psychology. Command home shows the top five for tonight.
        </p>
      </section>

      <CandidateTopTierPrepPanel items={items} />
    </div>
  );
}
