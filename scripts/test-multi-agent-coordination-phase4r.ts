import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRedDirtEnv } from "./load-red-dirt-env";
import { loadCampaignBrainAgentRegistry, loadAgentDependencyGraph, loadAgentRuntimeCoordinationMap, loadMultiAgentCoordinationReadiness } from "../src/lib/agents/county-intelligence/campaignBrainAgentRegistry";
import { COUNTY_INTELLIGENCE_COPILOT_ORCHESTRATION } from "../src/lib/agents/orchestration/county-intelligence-copilot-registry";
import { buildCountyAgentRuntimePayload } from "../src/lib/agents/county-intelligence/countyAgentRuntimePayloadBuilder";
import { runCampaignManagerAnalysisAgent } from "../src/lib/agents/county-intelligence/campaignManagerAnalysisAgent";
import { agentSafetyGatekeeper } from "../src/lib/agents/county-intelligence/agentSafetyGatekeeper";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

async function main() {
  const registry = loadCampaignBrainAgentRegistry();
  const graph = loadAgentDependencyGraph();
  const coordination = loadAgentRuntimeCoordinationMap();
  const readiness = loadMultiAgentCoordinationReadiness();
  const runtime = await buildCountyAgentRuntimePayload();
  const analysis = runCampaignManagerAnalysisAgent(runtime);

  const allAgentsRegistered = registry.agents.length === 11;
  const dependencyGraphLoads = graph.nodes.length > 0 && graph.edges.length > 0;
  const runtimeCoordinationBuilds = coordination.rows.length === 75;
  const statewideSynthesisBuilds = analysis.multiAgentCoordination.executiveUrgencyRanking.length === 75;
  const conflictsSurfaced = readiness.rows.some((row) => row.conflictsSurfaced);
  const missingDataRemains = readiness.rows.some((row) =>
    [
      row.registryReady,
      row.capabilityMapReady,
      row.dependencyGraphReady,
      row.runtimeCoordinationReady,
      row.safetyPolicyReady,
      row.insightStreamReady,
    ].includes("LOW_CONFIDENCE"),
  );
  const safetyBlocksProhibitedAction =
    agentSafetyGatekeeper("autonomously execute campaign actions").allowed === false &&
    agentSafetyGatekeeper("target voters by individual segment").allowed === false;
  const noTargetingOrContact =
    COUNTY_INTELLIGENCE_COPILOT_ORCHESTRATION.cannot.includes("target individual voters") &&
    COUNTY_INTELLIGENCE_COPILOT_ORCHESTRATION.cannot.includes("generate contact lists");
  const noAutomationEnabled =
    COUNTY_INTELLIGENCE_COPILOT_ORCHESTRATION.executionPolicy.automationEnabled === false;
  const noAutonomousExecution = COUNTY_INTELLIGENCE_COPILOT_ORCHESTRATION.cannot.includes(
    "autonomously execute campaign actions",
  );
  const runtimePayloadBuilds = runtime.countyPayloads.length === 75;

  console.log("Phase 4R multi-agent coordination checks");
  console.log("  all agents registered:", allAgentsRegistered);
  console.log("  dependency graph loads:", dependencyGraphLoads);
  console.log("  runtime coordination map builds:", runtimeCoordinationBuilds);
  console.log("  statewide synthesis builds:", statewideSynthesisBuilds);
  console.log("  cross-agent conflicts surfaced:", conflictsSurfaced);
  console.log("  missing data remains surfaced:", missingDataRemains);
  console.log("  safety gatekeeper blocks prohibited actions:", safetyBlocksProhibitedAction);
  console.log("  targeting/contact list blocked:", noTargetingOrContact);
  console.log("  automation disabled:", noAutomationEnabled);
  console.log("  autonomous execution blocked:", noAutonomousExecution);
  console.log("  runtime payload builds:", runtimePayloadBuilds);

  const ok =
    allAgentsRegistered &&
    dependencyGraphLoads &&
    runtimeCoordinationBuilds &&
    statewideSynthesisBuilds &&
    conflictsSurfaced &&
    missingDataRemains &&
    safetyBlocksProhibitedAction &&
    noTargetingOrContact &&
    noAutomationEnabled &&
    noAutonomousExecution &&
    runtimePayloadBuilds;

  if (!ok) process.exit(1);
  console.log("OK — Phase 4R multi-agent coordination checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

