import { RegionDashboardView } from "@/components/regions/dashboard";
import { buildRiverValleyRegionDashboard } from "@/lib/campaign-engine/regions/build-region-dashboard";
import type { Metadata } from "next";
import { organizingIntelligenceRegionPageMeta } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = organizingIntelligenceRegionPageMeta({
  regionTitle: "River Valley",
  slug: "river-valley",
  description:
    "River Valley regional organizing view: county cards, demo metrics, strategy context, and Pope County as the public sample anchor. No private voter data.",
});

export default function RiverValleyRegionDashboardPage() {
  const data = buildRiverValleyRegionDashboard();
  return <RegionDashboardView data={data} showPopeAnchorCta />;
}
