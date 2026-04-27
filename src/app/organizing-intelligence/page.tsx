import { StateOrganizingIntelligenceView } from "@/components/organizing-intelligence/StateOrganizingIntelligenceView";
import { buildStateOrganizingIntelligenceDashboard } from "@/lib/campaign-engine/state-organizing-intelligence/build-state-oi-dashboard";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMeta({
  title: "Arkansas organizing intelligence — statewide view",
  description:
    "Statewide field snapshot: eight campaign regions, county coverage context, and labeled demo metrics for planning. Links to regional dashboards and the Pope County sample view. No private voter data.",
  path: "/organizing-intelligence",
  imageSrc: "/media/placeholders/og-default.svg",
});

export default function StateOrganizingIntelligencePage() {
  const data = buildStateOrganizingIntelligenceDashboard();
  return <StateOrganizingIntelligenceView data={data} />;
}
