import { RegionDashboardView } from "@/components/regions/dashboard";
import { buildSoutheastArkansasRegionDashboard } from "@/lib/campaign-engine/regions/build-region-dashboard";
import type { Metadata } from "next";
import { organizingIntelligenceRegionPageMeta } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = organizingIntelligenceRegionPageMeta({
  regionTitle: "Southeast Arkansas",
  slug: "southeast-arkansas",
  description:
    "Southeast Arkansas regional organizing view: demo metrics and county cards for lower-south field planning. No private voter data.",
});

export default function SoutheastArkansasRegionDashboardPage() {
  const data = buildSoutheastArkansasRegionDashboard();
  return <RegionDashboardView data={data} />;
}
