import { composeCountyDashboardContext } from "@/lib/agents/county-intelligence/county-intelligence-engine";
import { CountyCommandCenterPanel } from "@/components/admin/county-intelligence/CountyCommandCenterPanel";

export const dynamic = "force-dynamic";

export default function CountyIntelligencePage() {
  const statewide = composeCountyDashboardContext();
  return <CountyCommandCenterPanel statewide={statewide} />;
}
