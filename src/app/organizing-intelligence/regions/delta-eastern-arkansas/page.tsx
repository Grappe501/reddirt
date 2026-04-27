import { RegionDashboardView } from "@/components/regions/dashboard";
import { buildDeltaEasternArkansasRegionDashboard } from "@/lib/campaign-engine/regions/build-region-dashboard";
import type { Metadata } from "next";
import { organizingIntelligenceRegionPageMeta } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = organizingIntelligenceRegionPageMeta({
  regionTitle: "Delta / Eastern Arkansas",
  slug: "delta-eastern-arkansas",
  description:
    "Delta and Eastern Arkansas regional organizing view: demo metrics and county context for eastern field planning. No private voter data.",
});

export default function DeltaEasternArkansasRegionDashboardPage() {
  const data = buildDeltaEasternArkansasRegionDashboard();
  return <RegionDashboardView data={data} />;
}
