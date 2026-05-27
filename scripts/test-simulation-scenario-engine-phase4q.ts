import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRedDirtEnv } from "./load-red-dirt-env";
import { ARKANSAS_COUNTY_REGISTRY } from "../src/lib/county/arkansas-county-registry";
import { loadSimulationEngineReadiness } from "../src/lib/agents/county-intelligence/statewideScenarioMatrix";
import { COUNTY_INTELLIGENCE_COPILOT_ORCHESTRATION } from "../src/lib/agents/orchestration/county-intelligence-copilot-registry";
import { buildCountyAgentRuntimePayload } from "../src/lib/agents/county-intelligence/countyAgentRuntimePayloadBuilder";
import { runCampaignManagerAnalysisAgent } from "../src/lib/agents/county-intelligence/campaignManagerAnalysisAgent";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

async function main() {
  const readiness = loadSimulationEngineReadiness();
  const runtime = await buildCountyAgentRuntimePayload();
  const analysis = runCampaignManagerAnalysisAgent(runtime);

  const has75Rows = readiness.rows.length === ARKANSAS_COUNTY_REGISTRY.length;
  const tools = (COUNTY_INTELLIGENCE_COPILOT_ORCHESTRATION.toolGroups as Record<string, readonly string[]>)
    .simulationScenarioEngine;
  const toolsRegistered = (tools?.length ?? 0) === 15;
  const dashboardBuilds = analysis.simulationScenarioEngine.countyScenarioRankings.length === 75;
  const labelsValid = analysis.simulationScenarioEngine.countyScenarioRankings.every(
    (row) => ["SCENARIO", "FORECAST", "MODEL"].includes(row.label),
  );
  const missingPreserved = readiness.rows.some((row) =>
    [
      row.scenarioRegistry,
      row.statewideMatrix,
      row.pathwaySensitivity,
      row.registrationScenarios,
      row.resourceImpact,
      row.eventImpact,
      row.turnoutSensitivity,
    ].includes("MISSING"),
  );
  const assumptionsSurfaced = readiness.rows.every((row) => typeof row.assumptionsPresent === "boolean");
  const noTargetingOrContact =
    COUNTY_INTELLIGENCE_COPILOT_ORCHESTRATION.cannot.includes("target individual voters") &&
    COUNTY_INTELLIGENCE_COPILOT_ORCHESTRATION.cannot.includes("generate contact lists");
  const noAutomationEnabled =
    COUNTY_INTELLIGENCE_COPILOT_ORCHESTRATION.executionPolicy.automationEnabled === false;
  const noAutonomousStrategy = COUNTY_INTELLIGENCE_COPILOT_ORCHESTRATION.cannot.includes(
    "autonomously execute campaign strategy",
  );
  const runtimeBuilds = runtime.countyPayloads.length === 75;
  const runtimeSimulationAttached = runtime.countyPayloads.every(
    (row) => row.simulations.topScenarioCard.includes("SCENARIO") || row.simulations.topScenarioCard.includes("FORECAST") || row.simulations.topScenarioCard.includes("MODEL"),
  );

  console.log("Phase 4Q simulation scenario engine checks");
  console.log("  readiness rows (75):", has75Rows);
  console.log("  simulation tools registered:", toolsRegistered);
  console.log("  statewide simulation dashboard builds:", dashboardBuilds);
  console.log("  scenario labels valid:", labelsValid);
  console.log("  missing data remains MISSING:", missingPreserved);
  console.log("  assumptions surfaced:", assumptionsSurfaced);
  console.log("  targeting/contact list blocked:", noTargetingOrContact);
  console.log("  automation disabled:", noAutomationEnabled);
  console.log("  autonomous strategy blocked:", noAutonomousStrategy);
  console.log("  runtime payload builds:", runtimeBuilds);
  console.log("  runtime simulation payload attached:", runtimeSimulationAttached);

  const ok =
    has75Rows &&
    toolsRegistered &&
    dashboardBuilds &&
    labelsValid &&
    missingPreserved &&
    assumptionsSurfaced &&
    noTargetingOrContact &&
    noAutomationEnabled &&
    noAutonomousStrategy &&
    runtimeBuilds &&
    runtimeSimulationAttached;

  if (!ok) process.exit(1);
  console.log("OK — Phase 4Q simulation scenario engine checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

