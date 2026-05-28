/**
 * Phase 4L/4N orchestration checks.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRedDirtEnv } from "./load-red-dirt-env";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

type Json = Record<string, unknown>;

function readJson(rel: string): Json {
  const abs = path.join(process.cwd(), rel);
  return JSON.parse(fs.readFileSync(abs, "utf8")) as Json;
}

function asRecord(x: unknown): Record<string, unknown> {
  return (x as Record<string, unknown>) ?? {};
}

function asStringArray(x: unknown): string[] {
  return Array.isArray(x) ? x.map((v) => String(v)) : [];
}

async function main() {
  const copilot = readJson("data/campaign-events/county-intelligence-copilot-orchestration.json");
  const model = readJson("data/campaign-events/campaign-brain-operating-model.json");
  const map = readJson("data/campaign-events/campaign-brain-operating-system-map.json");

  const toolGroups = asRecord(copilot.toolGroups);
  const voterFileTools = asStringArray(toolGroups.voterFile);
  const mapTools = asStringArray(toolGroups.mapGeospatial);
  const memoryTools = asStringArray(toolGroups.countyInstitutionalMemory);
  const publicNarrativeTools = asStringArray(toolGroups.publicNarrativeIntelligenceLayer);
  const simulationTools = asStringArray(toolGroups.simulationScenarioEngine);
  const multiAgentTools = asStringArray(toolGroups.multiAgentCampaignBrain);
  const executiveCommandTools = asStringArray(toolGroups.executiveCommandCenter);

  const hasSchemaReadinessInput = asStringArray(asRecord(copilot).dataSources).includes(
    "data/audit/voter-warehouse-schema-readiness.json",
  );
  const hasRegistrationTemplateInput = asStringArray(asRecord(copilot).dataSources).includes(
    "data/import-templates/voter-registration-snapshot-template.csv",
  );
  const hasLandingContractInput = asStringArray(asRecord(copilot).dataSources).includes(
    "data/campaign-events/county-landing-page-orchestration-contract.json",
  );
  const hasDeepVoterTools =
    voterFileTools.includes("voterFileChunkLocator") &&
    voterFileTools.includes("voterSegmentModelReader") &&
    voterFileTools.includes("voterHistoryPatternAnalyzer") &&
    voterFileTools.includes("voterContactListPermissionGate");
  const hasMapGroup = mapTools.length === 8 && mapTools.includes("heatMapPermissionGate");
  const hasMemoryGroup =
    memoryTools.length === 10 &&
    memoryTools.includes("countyMemoryTimeline") &&
    memoryTools.includes("countyRelationshipGraphReader") &&
    memoryTools.includes("institutionalMemoryGapExplainer");
  const hasPublicNarrativeGroup =
    publicNarrativeTools.length === 14 &&
    publicNarrativeTools.includes("issueSignalTracker") &&
    publicNarrativeTools.includes("countyNarrativeComparisonTool") &&
    publicNarrativeTools.includes("publicNarrativeTrendAnalyzer");
  const hasSimulationGroup =
    simulationTools.length === 15 &&
    simulationTools.includes("countyScenarioSimulator") &&
    simulationTools.includes("statewideScenarioRankingTool") &&
    simulationTools.includes("scenarioRiskAnalyzer");
  const hasMultiAgentGroup =
    multiAgentTools.length === 15 &&
    multiAgentTools.includes("campaignBrainSynthesisEngine") &&
    multiAgentTools.includes("statewideInterventionCoordinator") &&
    multiAgentTools.includes("executiveCoordinationBriefBuilder");

  const flow = asStringArray(map.flow);
  const has4LFlowNodes =
    flow.includes("Voter warehouse schema readiness") &&
    flow.includes("Registration snapshot template/import") &&
    flow.includes("County win pathway formula") &&
    flow.includes("County summary brief builder");
  const has4NFlowNode = flow.includes("County institutional memory");
  const has4PFlowNode = flow.includes("Public narrative intelligence layer");
  const has4QFlowNode = flow.includes("Simulation scenario engine");
  const has4RFlowNode = flow.includes("Multi-agent campaign brain");
  const has4SFlowNode = flow.includes("Executive command center");

  const artifacts = asRecord(map.canonicalArtifacts);
  const has4LArtifacts =
    artifacts.voterWarehouseSchemaReadiness === "data/audit/voter-warehouse-schema-readiness.json" &&
    artifacts.registrationSnapshotTemplate ===
      "data/import-templates/voter-registration-snapshot-template.csv" &&
    artifacts.countyWinPathwayInputs === "data/audit/county-win-pathway-inputs.json" &&
    artifacts.countyLandingOrchestrationContract ===
      "data/campaign-events/county-landing-page-orchestration-contract.json";
  const has4NArtifacts =
    artifacts.countyMemoryIndex === "data/county-memory/county-memory-index.json" &&
    artifacts.countyEventOutcomes === "data/county-memory/county-event-outcomes.json" &&
    artifacts.countyRelationshipGraph === "data/county-memory/county-relationship-graph.json" &&
    artifacts.regionalInfluenceMap === "data/county-memory/regional-influence-map.json" &&
    artifacts.countyMemoryReadiness === "data/audit/county-memory-readiness-table.json";
  const has4PArtifacts =
    artifacts.publicIssueSignalRegistry === "data/public-narrative/public-issue-signal-registry.json" &&
    artifacts.countyIssueClusters === "data/public-narrative/county-issue-clusters.json" &&
    artifacts.regionalNarrativeMap === "data/public-narrative/regional-narrative-map.json" &&
    artifacts.earnedMediaOpportunities === "data/public-narrative/earned-media-opportunities.json" &&
    artifacts.civicSentimentSummary === "data/public-narrative/civic-sentiment-summary.json" &&
    artifacts.publicMeetingWatchlist === "data/public-narrative/public-meeting-watchlist.json" &&
    artifacts.publicNarrativeReadiness === "data/audit/public-narrative-readiness-table.json";
  const has4QArtifacts =
    artifacts.countyScenarioRegistry === "data/simulations/county-scenario-registry.json" &&
    artifacts.statewideScenarioMatrix === "data/simulations/statewide-scenario-matrix.json" &&
    artifacts.pathwaySensitivityModel === "data/simulations/pathway-sensitivity-model.json" &&
    artifacts.registrationGrowthScenarios === "data/simulations/registration-growth-scenarios.json" &&
    artifacts.resourceImpactModels === "data/simulations/resource-impact-models.json" &&
    artifacts.eventImpactScenarios === "data/simulations/event-impact-scenarios.json" &&
    artifacts.turnoutSensitivityModels === "data/simulations/turnout-sensitivity-models.json" &&
    artifacts.simulationEngineReadiness === "data/audit/simulation-engine-readiness-table.json";
  const has4RArtifacts =
    artifacts.campaignBrainAgentRegistry === "data/multi-agent/campaign-brain-agent-registry.json" &&
    artifacts.agentCapabilityMap === "data/multi-agent/agent-capability-map.json" &&
    artifacts.agentRuntimeCoordinationMap === "data/multi-agent/agent-runtime-coordination-map.json" &&
    artifacts.agentDependencyGraph === "data/multi-agent/agent-dependency-graph.json" &&
    artifacts.agentSafetyPolicyMap === "data/multi-agent/agent-safety-policy-map.json" &&
    artifacts.agentRuntimeStateTable === "data/multi-agent/agent-runtime-state-table.json" &&
    artifacts.crossAgentInsightStream === "data/multi-agent/cross-agent-insight-stream.json" &&
    artifacts.multiAgentCoordinationReadiness === "data/audit/multi-agent-coordination-readiness-table.json";
  const has4SArtifacts =
    artifacts.executiveCommandState === "data/executive-command/executive-command-state.json" &&
    artifacts.statewideReadinessMatrix === "data/executive-command/statewide-readiness-matrix.json" &&
    artifacts.executivePriorityRanking === "data/executive-command/executive-priority-ranking.json" &&
    artifacts.operationalBottleneckMap === "data/executive-command/operational-bottleneck-map.json" &&
    artifacts.statewideInterventionQueue === "data/executive-command/statewide-intervention-queue.json" &&
    artifacts.regionalPressureMap === "data/executive-command/regional-pressure-map.json" &&
    artifacts.campaignHealthScorecard === "data/executive-command/campaign-health-scorecard.json" &&
    artifacts.executiveAlertStream === "data/executive-command/executive-alert-stream.json" &&
    artifacts.executiveBriefRegistry === "data/executive-command/executive-brief-registry.json" &&
    artifacts.executiveCommandReadiness === "data/audit/executive-command-readiness-table.json";

  const automationStillBlocked =
    asRecord(copilot.executionPolicy).automationEnabled === false &&
    String(asRecord(map.gates).automationExecution ?? "").toLowerCase().includes("not built");

  const modelHas4N = asStringArray(model.foundationRequirements).includes(
    "data/audit/county-memory-readiness-table.json",
  );
  const modelHas4P = asStringArray(model.foundationRequirements).includes(
    "data/audit/public-narrative-readiness-table.json",
  );
  const modelHas4Q = asStringArray(model.foundationRequirements).includes(
    "data/audit/simulation-engine-readiness-table.json",
  );
  const modelHas4R = asStringArray(model.foundationRequirements).includes(
    "data/audit/multi-agent-coordination-readiness-table.json",
  );
  const modelHas4S = asStringArray(model.foundationRequirements).includes(
    "data/audit/executive-command-readiness-table.json",
  );
  const hasExecutiveCommandGroup =
    executiveCommandTools.length === 20 &&
    executiveCommandTools.includes("executiveCommandStateBuilder") &&
    executiveCommandTools.includes("blockedAutomationMatrixInspector");

  const ok =
    hasSchemaReadinessInput &&
    hasRegistrationTemplateInput &&
    hasLandingContractInput &&
    hasDeepVoterTools &&
    hasMapGroup &&
    hasMemoryGroup &&
    hasPublicNarrativeGroup &&
    hasSimulationGroup &&
    hasMultiAgentGroup &&
    hasExecutiveCommandGroup &&
    has4LFlowNodes &&
    has4NFlowNode &&
    has4PFlowNode &&
    has4QFlowNode &&
    has4RFlowNode &&
    has4SFlowNode &&
    has4LArtifacts &&
    has4NArtifacts &&
    has4PArtifacts &&
    has4QArtifacts &&
    has4RArtifacts &&
    has4SArtifacts &&
    modelHas4N &&
    modelHas4P &&
    modelHas4Q &&
    modelHas4R &&
    modelHas4S &&
    automationStillBlocked;

  console.log("Phase 4L/4N orchestration checks");
  console.log("  schema readiness source wired:", hasSchemaReadinessInput);
  console.log("  registration template source wired:", hasRegistrationTemplateInput);
  console.log("  landing contract source wired:", hasLandingContractInput);
  console.log("  deep voter tools wired:", hasDeepVoterTools);
  console.log("  map tool group wired:", hasMapGroup);
  console.log("  memory tool group wired:", hasMemoryGroup);
  console.log("  public narrative tool group wired:", hasPublicNarrativeGroup);
  console.log("  simulation tool group wired:", hasSimulationGroup);
  console.log("  multi-agent tool group wired:", hasMultiAgentGroup);
  console.log("  executive command tool group wired:", hasExecutiveCommandGroup);
  console.log("  campaign brain 4L flow nodes:", has4LFlowNodes);
  console.log("  campaign brain 4N flow node:", has4NFlowNode);
  console.log("  campaign brain 4P flow node:", has4PFlowNode);
  console.log("  campaign brain 4Q flow node:", has4QFlowNode);
  console.log("  campaign brain 4R flow node:", has4RFlowNode);
  console.log("  campaign brain 4S flow node:", has4SFlowNode);
  console.log("  campaign brain 4L artifacts:", has4LArtifacts);
  console.log("  campaign brain 4N artifacts:", has4NArtifacts);
  console.log("  campaign brain 4P artifacts:", has4PArtifacts);
  console.log("  campaign brain 4Q artifacts:", has4QArtifacts);
  console.log("  campaign brain 4R artifacts:", has4RArtifacts);
  console.log("  campaign brain 4S artifacts:", has4SArtifacts);
  console.log("  model includes 4N foundations:", modelHas4N);
  console.log("  model includes 4P foundations:", modelHas4P);
  console.log("  model includes 4Q foundations:", modelHas4Q);
  console.log("  model includes 4R foundations:", modelHas4R);
  console.log("  model includes 4S foundations:", modelHas4S);
  console.log("  automation remains blocked:", automationStillBlocked);

  if (!ok) process.exit(1);
  console.log("OK — Phase 4L/4N orchestration checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

