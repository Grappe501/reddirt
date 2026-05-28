import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRedDirtEnv } from "./load-red-dirt-env";
import { ARKANSAS_COUNTY_REGISTRY } from "../src/lib/county/arkansas-county-registry";
import { buildExecutiveCommandRuntime } from "../src/lib/agents/county-intelligence/executiveCommandRuntime";
import { executiveCommandReadinessAudit } from "../src/lib/agents/county-intelligence/executiveCommandReadinessAudit";
import { runCampaignManagerAnalysisAgent } from "../src/lib/agents/county-intelligence/campaignManagerAnalysisAgent";
import { buildCountyAgentRuntimePayload } from "../src/lib/agents/county-intelligence/countyAgentRuntimePayloadBuilder";
import { COUNTY_INTELLIGENCE_COPILOT_ORCHESTRATION } from "../src/lib/agents/orchestration/county-intelligence-copilot-registry";
import { CAMPAIGN_BRAIN_OPERATING_MODEL } from "../src/lib/agents/orchestration/campaign-brain-operating-model-registry";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

async function main() {
  const executiveRuntime = buildExecutiveCommandRuntime();
  const readinessAudit = executiveCommandReadinessAudit();
  const countyRuntime = await buildCountyAgentRuntimePayload();
  const analysis = runCampaignManagerAnalysisAgent(countyRuntime);

  const statewideExecutiveStateBuilds =
    executiveRuntime.countyCount === ARKANSAS_COUNTY_REGISTRY.length &&
    executiveRuntime.counties.length === ARKANSAS_COUNTY_REGISTRY.length;
  const executiveToolsRegistered =
    analysis.executiveCommandCenter.tools.length === 20 &&
    COUNTY_INTELLIGENCE_COPILOT_ORCHESTRATION.toolGroups.executiveCommandCenter.length === 20;
  const interventionQueueBuilds = analysis.executiveCommandCenter.interventionQueueRows === 75;
  const campaignHealthScorecardBuilds = analysis.executiveCommandCenter.campaignHealthSummary.length >= 10;
  const blockedAutomationMatrixPresent =
    analysis.executiveCommandCenter.blockedAutomationMatrix.length >= 4 &&
    executiveRuntime.statewide.blockedAutomationCount === 75;
  const missingDataRemainsSurfaced = executiveRuntime.counties.some((row) => row.status !== "PRESENT");
  const safetyGatekeeperBlocksProhibitedActions =
    COUNTY_INTELLIGENCE_COPILOT_ORCHESTRATION.cannot.includes("target individual voters") &&
    COUNTY_INTELLIGENCE_COPILOT_ORCHESTRATION.cannot.includes("autonomously execute campaign actions") &&
    COUNTY_INTELLIGENCE_COPILOT_ORCHESTRATION.cannot.includes("autonomously allocate resources");
  const noTargetingOrContact = COUNTY_INTELLIGENCE_COPILOT_ORCHESTRATION.cannot.includes(
    "generate contact lists",
  );
  const noAutomationEnabled = COUNTY_INTELLIGENCE_COPILOT_ORCHESTRATION.executionPolicy.automationEnabled === false;
  const noAutonomousExecution = CAMPAIGN_BRAIN_OPERATING_MODEL.executiveCommandCenter.cannot.includes(
    "autonomously execute campaign actions",
  );
  const runtimePayloadStillBuilds = countyRuntime.countyPayloads.length === 75;
  const statewideDashboardRenders =
    analysis.executiveCommandCenter.readinessMatrixRows === 75 &&
    analysis.executiveCommandCenter.regionalPressureRows > 0;
  const readinessRowsValid =
    readinessAudit.rowCount === readinessAudit.expectedCount && readinessAudit.missing.length === 0;

  console.log("Phase 4S executive command center checks");
  console.log("  statewide executive state builds:", statewideExecutiveStateBuilds);
  console.log("  all executive tools registered:", executiveToolsRegistered);
  console.log("  intervention queue builds:", interventionQueueBuilds);
  console.log("  campaign health scorecard builds:", campaignHealthScorecardBuilds);
  console.log("  blocked automation matrix present:", blockedAutomationMatrixPresent);
  console.log("  missing data remains surfaced:", missingDataRemainsSurfaced);
  console.log(
    "  safety gatekeeper blocks prohibited actions:",
    safetyGatekeeperBlocksProhibitedActions,
  );
  console.log("  no targeting/contact-list permissions:", noTargetingOrContact);
  console.log("  no automation permissions:", noAutomationEnabled);
  console.log("  no autonomous execution:", noAutonomousExecution);
  console.log("  orchestration runtime payload builds:", runtimePayloadStillBuilds);
  console.log("  statewide command dashboards render:", statewideDashboardRenders);
  console.log("  executive readiness rows complete:", readinessRowsValid);

  const ok =
    statewideExecutiveStateBuilds &&
    executiveToolsRegistered &&
    interventionQueueBuilds &&
    campaignHealthScorecardBuilds &&
    blockedAutomationMatrixPresent &&
    missingDataRemainsSurfaced &&
    safetyGatekeeperBlocksProhibitedActions &&
    noTargetingOrContact &&
    noAutomationEnabled &&
    noAutonomousExecution &&
    runtimePayloadStillBuilds &&
    statewideDashboardRenders &&
    readinessRowsValid;

  if (!ok) process.exit(1);
  console.log("OK — Phase 4S executive command center checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

