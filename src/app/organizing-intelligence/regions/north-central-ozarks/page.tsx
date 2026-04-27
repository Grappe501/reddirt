import { RegionDashboardView } from "@/components/regions/dashboard";
import { buildNorthCentralOzarksRegionDashboard } from "@/lib/campaign-engine/regions/build-region-dashboard";
import type { Metadata } from "next";
import { organizingIntelligenceRegionPageMeta } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = organizingIntelligenceRegionPageMeta({
  regionTitle: "North Central / Ozarks",
  slug: "north-central-ozarks",
  description:
    "North Central and Ozarks regional organizing view: demo KPIs and county grid for upland and northern counties. No private voter data.",
});

export default function NorthCentralOzarksRegionDashboardPage() {
  const data = buildNorthCentralOzarksRegionDashboard();
  return <RegionDashboardView data={data} />;
}
