import { RegionDashboardView } from "@/components/regions/dashboard";
import { buildCentralArkansasRegionDashboard } from "@/lib/campaign-engine/regions/build-region-dashboard";
import type { Metadata } from "next";
import { organizingIntelligenceRegionPageMeta } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = organizingIntelligenceRegionPageMeta({
  regionTitle: "Central Arkansas",
  slug: "central-arkansas",
  description:
    "Central Arkansas regional organizing view: I-30 and capital-corridor counties in a demo snapshot for coverage and strategy planning. No private voter data.",
});

export default function CentralArkansasRegionDashboardPage() {
  const data = buildCentralArkansasRegionDashboard();
  return <RegionDashboardView data={data} />;
}
