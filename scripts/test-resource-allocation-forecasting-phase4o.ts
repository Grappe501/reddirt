import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRedDirtEnv } from "./load-red-dirt-env";
import { ARKANSAS_COUNTY_REGISTRY } from "../src/lib/county/arkansas-county-registry";
import { loadResourceAllocationReadiness } from "../src/lib/agents/county-intelligence/resourceAllocationModel";
import { runCampaignManagerAnalysisAgent } from "../src/lib/agents/county-intelligence/campaignManagerAnalysisAgent";
import { buildCountyAgentRuntimePayload } from "../src/lib/agents/county-intelligence/countyAgentRuntimePayloadBuilder";
import { COUNTY_INTELLIGENCE_COPILOT_ORCHESTRATION } from "../src/lib/agents/orchestration/county-intelligence-copilot-registry";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

async function main() {
  const readiness = loadResourceAllocationReadiness();
  const runtime = await buildCountyAgentRuntimePayload();
  const analysis = runCampaignManagerAnalysisAgent(runtime);

  const has75Rows = readiness.rows.length === ARKANSAS_COUNTY_REGISTRY.length;
  const tools = (COUNTY_INTELLIGENCE_COPILOT_ORCHESTRATION.toolGroups as Record<string, string[]>)
    .countyResourceOperationsLayer;
  const toolsRegistered = tools?.length === 12;
  const statewideRankingBuilds =
    analysis.resourceAllocationForecasting.statewideOperationalRanking.length === 75;
  const forecastsLabeled = analysis.resourceAllocationForecasting.statewideOperationalRanking.every(
    (x) => x.forecastType === "FORECAST",
  );
  const missingStaysMissing = readiness.rows.some((row) => row.forecastCoverage !== "PRESENT");
  const noAutomationEnabled =
    COUNTY_INTELLIGENCE_COPILOT_ORCHESTRATION.executionPolicy.automationEnabled === false;
  const noTargetingOrContact =
    COUNTY_INTELLIGENCE_COPILOT_ORCHESTRATION.cannot.includes("target individual voters") &&
    COUNTY_INTELLIGENCE_COPILOT_ORCHESTRATION.cannot.includes("generate contact lists");
  const runtimeBuilds = runtime.countyPayloads.length === 75;

  console.log("Phase 4O resource allocation checks");
  console.log("  readiness rows (75):", has75Rows);
  console.log("  resource tools registered:", toolsRegistered);
  console.log("  statewide ranking builds:", statewideRankingBuilds);
  console.log("  forecasts labeled FORECAST:", forecastsLabeled);
  console.log("  missing values preserved:", missingStaysMissing);
  console.log("  automation disabled:", noAutomationEnabled);
  console.log("  targeting/contact list blocked:", noTargetingOrContact);
  console.log("  runtime payload builds:", runtimeBuilds);

  const ok =
    has75Rows &&
    toolsRegistered &&
    statewideRankingBuilds &&
    forecastsLabeled &&
    missingStaysMissing &&
    noAutomationEnabled &&
    noTargetingOrContact &&
    runtimeBuilds;

  if (!ok) process.exit(1);
  console.log("OK — Phase 4O resource allocation and forecasting checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

