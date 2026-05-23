/**
 * AI Agent Tooling Brain — Phase 4A smoke test.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRedDirtEnv } from "./load-red-dirt-env";
import { loadUnifiedAgentToolRegistry, validateRegistryUnderstanding } from "../src/lib/agents/orchestration/tooling/agent-tool-registry";
import { selectAgentTools } from "../src/lib/agents/orchestration/tooling/agent-tool-selector";
import { buildAgentToolSequences } from "../src/lib/agents/orchestration/tooling/agent-tool-sequencer";
import { prepareAgentActions } from "../src/lib/agents/orchestration/tooling/agent-action-prep";
import { analyzeToolCoverageByDomain } from "../src/lib/agents/orchestration/tooling/agent-tool-coverage";
import { assertPreparedActionSafe, isProhibitedExecution, PROHIBITED_EXECUTION_TYPES } from "../src/lib/agents/orchestration/tooling/agent-tool-safety";
import { buildSkeletonCampaignState } from "../src/lib/agents/orchestration/campaign-state-types";
import { runOrchestrationReasoning } from "../src/lib/agents/orchestration/orchestration-reasoning-engine";
import { buildOrchestrationStatePayload } from "../src/lib/agents/orchestration/build-orchestration-payload";
import { ALL_ORCHESTRATION_DOMAIN_IDS } from "../src/lib/agents/orchestration/tooling/agent-tool-registry";
import { resetCountyWorkbenchAdapterCache } from "../src/lib/agents/county-intelligence/county-workbench-adapter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));
resetCountyWorkbenchAdapterCache();

async function main() {
  const registry = loadUnifiedAgentToolRegistry();
  const understandingGaps = validateRegistryUnderstanding(registry);
  const skeleton = buildSkeletonCampaignState("2026-04");
  const diagnosis = runOrchestrationReasoning(skeleton);
  const sourceHealth = [{ sourceId: "test", label: "Test", status: "ready" as const }];

  const selection = selectAgentTools({
    state: skeleton,
    sourceHealth,
    registry,
    role: "campaign_manager",
    period: "2026-04",
  });
  const sequences = buildAgentToolSequences(skeleton, registry);
  const prepared = prepareAgentActions({ state: skeleton, diagnosis, topRecommendations: selection.topFive });
  const coverage = analyzeToolCoverageByDomain(registry);

  console.log("Agent tooling brain test (Phase 4A)");
  console.log("  registry tools:", registry.length);
  console.log("  understanding gaps:", understandingGaps.length);
  console.log("  recommended:", selection.recommended.length);
  console.log("  sequences:", sequences.length);
  console.log("  prepared actions:", prepared.length);
  console.log("  coverage domains:", coverage.length);

  const payload = await buildOrchestrationStatePayload("2026-04");
  const at = payload.campaignState.agentTooling;

  console.log("  payload agentTooling tools:", at.registryToolCount);
  console.log("  best next tool:", at.bestNextToolForCampaignState?.title ?? "(none)");

  const allHaveUnderstanding = understandingGaps.length === 0;
  const hasRegistry = registry.length >= 50;
  const hasRecommendations = selection.topFive.length >= 1;
  const hasSequences = sequences.length >= 4;
  const allPrepSafe = prepared.every(assertPreparedActionSafe);
  const prohibitedBlocked = isProhibitedExecution("auto_send_email") && PROHIBITED_EXECUTION_TYPES.length >= 8;
  const coverageAllDomains = coverage.length === ALL_ORCHESTRATION_DOMAIN_IDS.length;
  const hasPayloadTooling = at != null && at.registryToolCount > 0;
  const noExecutablePrep = prepared.every((a) => a.canExecuteNow === false);

  const ok =
    allHaveUnderstanding &&
    hasRegistry &&
    hasRecommendations &&
    hasSequences &&
    allPrepSafe &&
    prohibitedBlocked &&
    coverageAllDomains &&
    hasPayloadTooling &&
    noExecutablePrep;

  if (!ok) {
    console.error("FAIL", {
      allHaveUnderstanding,
      hasRegistry,
      hasRecommendations,
      hasSequences,
      allPrepSafe,
      prohibitedBlocked,
      coverageAllDomains,
      hasPayloadTooling,
      noExecutablePrep,
    });
    process.exit(1);
  }
  console.log("OK — agent tooling brain registry, selector, sequencer, safety, CampaignState integration");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
