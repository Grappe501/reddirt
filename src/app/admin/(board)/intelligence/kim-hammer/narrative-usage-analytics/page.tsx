import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";
import { KimHammerNarrativeUsageAnalyticsDashboard } from "../KimHammerNarrativeUsageAnalyticsDashboard";
import { computeNarrativeUsageAnalytics } from "@/lib/opposition/kimHammerNarrativeUsageAnalytics";

export default async function KimHammerNarrativeUsageAnalyticsPage() {
  const index = computeNarrativeUsageAnalytics();

  return (
    <KimHammerBriefingPageShell moduleId="narrative-usage-analytics">
      <KimHammerNarrativeUsageAnalyticsDashboard index={index} />
    </KimHammerBriefingPageShell>
  );
}
