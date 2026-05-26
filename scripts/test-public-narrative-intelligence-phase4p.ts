import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRedDirtEnv } from "./load-red-dirt-env";
import { ARKANSAS_COUNTY_REGISTRY } from "../src/lib/county/arkansas-county-registry";
import { loadPublicNarrativeReadiness } from "../src/lib/agents/county-intelligence/publicIssueSignalRegistry";
import { COUNTY_INTELLIGENCE_COPILOT_ORCHESTRATION } from "../src/lib/agents/orchestration/county-intelligence-copilot-registry";
import { buildCountyAgentRuntimePayload } from "../src/lib/agents/county-intelligence/countyAgentRuntimePayloadBuilder";
import { runCampaignManagerAnalysisAgent } from "../src/lib/agents/county-intelligence/campaignManagerAnalysisAgent";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

async function main() {
  const readiness = loadPublicNarrativeReadiness();
  const runtime = await buildCountyAgentRuntimePayload();
  const analysis = runCampaignManagerAnalysisAgent(runtime);

  const has75Rows = readiness.rows.length === ARKANSAS_COUNTY_REGISTRY.length;
  const tools = (COUNTY_INTELLIGENCE_COPILOT_ORCHESTRATION.toolGroups as Record<string, readonly string[]>)
    .publicNarrativeIntelligenceLayer;
  const toolsRegistered = (tools?.length ?? 0) === 14;
  const dashboardBuilds = analysis.publicNarrativeIntelligence.countyComparisons.length === 75;
  const trendsLabeled = analysis.publicNarrativeIntelligence.statewideNarrativeTrends.every(
    (x) => x.includes("SIGNAL") || x.includes("TREND"),
  );
  const missingStaysMissing = readiness.rows.some(
    (row) => row.messagingReadiness === "MISSING" || row.messagingReadiness === "LOW_CONFIDENCE",
  );
  const noTargetingOrContact =
    COUNTY_INTELLIGENCE_COPILOT_ORCHESTRATION.cannot.includes("target individual voters") &&
    COUNTY_INTELLIGENCE_COPILOT_ORCHESTRATION.cannot.includes("generate contact lists");
  const noAutomationEnabled =
    COUNTY_INTELLIGENCE_COPILOT_ORCHESTRATION.executionPolicy.automationEnabled === false;
  const noPsychProfiling = COUNTY_INTELLIGENCE_COPILOT_ORCHESTRATION.cannot.includes(
    "generate psychological persuasion profiles",
  );
  const runtimeBuilds = runtime.countyPayloads.length === 75;
  const runtimeNarrativeAttached = runtime.countyPayloads.every(
    (row) => Array.isArray(row.publicNarrative.topPublicIssues) && row.publicNarrative.topPublicIssues.length > 0,
  );

  console.log("Phase 4P public narrative intelligence checks");
  console.log("  readiness rows (75):", has75Rows);
  console.log("  narrative tools registered:", toolsRegistered);
  console.log("  statewide narrative dashboard builds:", dashboardBuilds);
  console.log("  trends labeled SIGNAL/TREND:", trendsLabeled);
  console.log("  missing remains MISSING/LOW_CONFIDENCE:", missingStaysMissing);
  console.log("  targeting/contact list blocked:", noTargetingOrContact);
  console.log("  automation disabled:", noAutomationEnabled);
  console.log("  psychological profiling blocked:", noPsychProfiling);
  console.log("  runtime payload builds:", runtimeBuilds);
  console.log("  runtime narrative payload attached:", runtimeNarrativeAttached);

  const ok =
    has75Rows &&
    toolsRegistered &&
    dashboardBuilds &&
    trendsLabeled &&
    missingStaysMissing &&
    noTargetingOrContact &&
    noAutomationEnabled &&
    noPsychProfiling &&
    runtimeBuilds &&
    runtimeNarrativeAttached;

  if (!ok) process.exit(1);
  console.log("OK — Phase 4P public narrative intelligence checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

