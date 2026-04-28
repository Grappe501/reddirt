import { PulaskiCountyDashboardV2View } from "@/components/county/pulaski/PulaskiCountyDashboardV2View";
import { buildPulaskiCountyDashboardV2 } from "@/lib/campaign-engine/county-dashboards/pulaski-county-dashboard";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMeta({
  title: "Pulaski County organizing dashboard — briefing v2",
  description:
    "Pulaski County, Arkansas: county briefing dashboard using the hardened v2 shell—aggregate data from ingest only; relational and city drills stay scaffold until verified sources land.",
  path: "/county-briefings/pulaski/v2",
  imageSrc: "/media/placeholders/og-default.svg",
});

export default async function PulaskiCountyDashboardV2Page() {
  const data = await buildPulaskiCountyDashboardV2();
  return <PulaskiCountyDashboardV2View data={data} />;
}
