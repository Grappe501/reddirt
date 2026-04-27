import { RegionDashboardView } from "@/components/regions/dashboard";
import { buildNorthwestArkansasRegionDashboard } from "@/lib/campaign-engine/regions/build-region-dashboard";
import type { Metadata } from "next";
import { organizingIntelligenceRegionPageMeta } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = organizingIntelligenceRegionPageMeta({
  regionTitle: "Northwest Arkansas",
  slug: "northwest-arkansas",
  description:
    "Northwest Arkansas regional organizing view: Benton, Washington, Carroll, and Madison in one planning snapshot with labeled demo metrics. No private voter data.",
});

export default function NorthwestArkansasRegionDashboardPage() {
  const data = buildNorthwestArkansasRegionDashboard();
  return <RegionDashboardView data={data} />;
}
