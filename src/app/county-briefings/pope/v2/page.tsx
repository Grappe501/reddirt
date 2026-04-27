import { buildPopeCountyDashboardV2 } from "@/lib/campaign-engine/county-dashboards/pope-county-dashboard";
import { PopeCountyDashboardV2View } from "@/components/county/pope/PopeCountyDashboardV2View";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMeta({
  title: "Pope County organizing dashboard (sample)",
  description:
    "Sample county organizing dashboard for Pope County, Arkansas: labeled demo and seed metrics for training and design—not live election results or private voter records.",
  path: "/county-briefings/pope/v2",
  imageSrc: "/media/placeholders/og-default.svg",
});

export default async function PopeCountyDashboardV2Page() {
  const data = await buildPopeCountyDashboardV2();
  return <PopeCountyDashboardV2View data={data} />;
}
