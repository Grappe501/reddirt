import { RegionDashboardView } from "@/components/regions/dashboard";
import { buildNortheastArkansasRegionDashboard } from "@/lib/campaign-engine/regions/build-region-dashboard";
import type { Metadata } from "next";
import { organizingIntelligenceRegionPageMeta } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = organizingIntelligenceRegionPageMeta({
  regionTitle: "Northeast Arkansas",
  slug: "northeast-arkansas",
  description:
    "Northeast Arkansas regional organizing view: demo metrics, county list, and peer context for field planning. No private voter data.",
});

export default function NortheastArkansasRegionDashboardPage() {
  const data = buildNortheastArkansasRegionDashboard();
  return <RegionDashboardView data={data} />;
}
