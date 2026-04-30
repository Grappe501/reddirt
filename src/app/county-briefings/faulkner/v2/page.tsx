import { FaulknerCountyDashboardV2View } from "@/components/county/faulkner/FaulknerCountyDashboardV2View";
import { buildFaulknerCountyDashboardV2 } from "@/lib/campaign-engine/county-dashboards/faulkner-county-dashboard";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMeta({
  title: "Faulkner County organizing dashboard — briefing v2",
  description:
    "Faulkner County, Arkansas: county briefing dashboard using the hardened v2 shell—aggregate data from ingest only; relational and city drills stay scaffold until verified sources land.",
  path: "/county-briefings/faulkner/v2",
  imageSrc: "/media/placeholders/og-default.svg",
});

export default async function FaulknerCountyDashboardV2Page() {
  const data = await buildFaulknerCountyDashboardV2();
  return <FaulknerCountyDashboardV2View data={data} />;
}
