import { RegionDashboardView } from "@/components/regions/dashboard";
import { buildSouthwestArkansasRegionDashboard } from "@/lib/campaign-engine/regions/build-region-dashboard";
import type { Metadata } from "next";
import { organizingIntelligenceRegionPageMeta } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = organizingIntelligenceRegionPageMeta({
  regionTitle: "Southwest Arkansas",
  slug: "southwest-arkansas",
  description:
    "Southwest Arkansas regional organizing view: demo KPIs and county context for southwest field planning. No private voter data.",
});

export default function SouthwestArkansasRegionDashboardPage() {
  const data = buildSouthwestArkansasRegionDashboard();
  return <RegionDashboardView data={data} />;
}
