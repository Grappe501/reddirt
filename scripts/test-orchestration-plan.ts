/**
 * Campaign Orchestration Intelligence Layer — planning sprint smoke test.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRedDirtEnv } from "./load-red-dirt-env";
import {
  ORCHESTRATION_INTELLIGENCE_TOOL_CONTRACTS,
  ORCHESTRATION_INTELLIGENCE_TOOL_COUNT,
  assertOrchestrationSafetyBoundaries,
  ORCHESTRATION_FORBIDDEN_AUTO_ACTIONS,
} from "../src/lib/agents/orchestration/orchestration-tool-contracts";
import { ORCHESTRATION_DOMAINS } from "../src/lib/agents/orchestration/orchestration-domains";
import { buildSkeletonCampaignState } from "../src/lib/agents/orchestration/campaign-state-types";
import { runOrchestrationReasoning } from "../src/lib/agents/orchestration/orchestration-reasoning-engine";
import {
  buildOrchestrationWorkflowPlans,
  ORCHESTRATION_WORKFLOW_TEMPLATES,
} from "../src/lib/agents/orchestration/orchestration-workflow-planner";
import { ORCHESTRATION_LAYER_README } from "../src/lib/agents/orchestration/orchestration-readme";
import { CAMPAIGN_AI_HUMAN_CONTROL_RULES } from "../src/lib/campaign-events/ai-tools/tool-contract";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

function main() {
  const state = buildSkeletonCampaignState("2026-04");
  const diagnosis = runOrchestrationReasoning(state);
  const plans = buildOrchestrationWorkflowPlans(diagnosis);
  const safety = assertOrchestrationSafetyBoundaries();
  const ids = new Set(ORCHESTRATION_INTELLIGENCE_TOOL_CONTRACTS.map((t) => t.id));
  const dupes = ORCHESTRATION_INTELLIGENCE_TOOL_CONTRACTS.length - ids.size;

  console.log("Orchestration intelligence plan test");
  console.log("  layer:", ORCHESTRATION_LAYER_README.name, ORCHESTRATION_LAYER_README.version);
  console.log("  tools:", ORCHESTRATION_INTELLIGENCE_TOOL_COUNT);
  console.log("  domains:", ORCHESTRATION_DOMAINS.length);
  console.log("  workflow templates:", Object.keys(ORCHESTRATION_WORKFLOW_TEMPLATES).length);
  console.log("  plans from diagnosis:", plans.length);
  console.log("  diagnosis headline:", diagnosis.headline.slice(0, 60));
  console.log("  safety ok:", safety.ok, safety.violations);
  console.log("  forbidden auto actions:", ORCHESTRATION_FORBIDDEN_AUTO_ACTIONS.length);
  console.log("  human control rules:", CAMPAIGN_AI_HUMAN_CONTROL_RULES.length);

  const ok =
    ORCHESTRATION_INTELLIGENCE_TOOL_COUNT >= 35 &&
    dupes === 0 &&
    ORCHESTRATION_DOMAINS.length >= 20 &&
    state.currentPeriod === "2026-04" &&
    diagnosis.campaignDiagnosis.length > 10 &&
    safety.ok &&
    CAMPAIGN_AI_HUMAN_CONTROL_RULES.length >= 3;

  if (!ok) {
    console.error("FAIL", { dupes, domains: ORCHESTRATION_DOMAINS.length, safety });
    process.exit(1);
  }
  console.log("OK — orchestration plan: contracts, state skeleton, domains, safety");
}

main();
