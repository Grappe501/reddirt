import { composeCountyDashboardContext } from "@/lib/agents/county-intelligence/county-intelligence-engine";
import { summarizeCountyPublicBriefReadiness, generateAllCountyBriefBundles } from "@/lib/intelligence/briefs/countyPublicBriefGenerator";
import { CountyCommandCenterPanel } from "@/components/admin/county-intelligence/CountyCommandCenterPanel";
import { CountyFactoryRollupPanel } from "@/components/admin/county-intelligence/CountyFactoryRollupPanel";

export const dynamic = "force-dynamic";

export default function CountyIntelligencePage() {
  const statewide = composeCountyDashboardContext();
  const countyBriefBundles = generateAllCountyBriefBundles();
  const publicBriefRollup = summarizeCountyPublicBriefReadiness(countyBriefBundles);
  return (
    <>
      <CountyFactoryRollupPanel />
      <CountyCommandCenterPanel
      statewide={statewide}
      publicBriefRollup={publicBriefRollup}
    />
    </>
  );
}
