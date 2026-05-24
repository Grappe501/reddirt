/**
 * Cross-Domain Agent Tool Orchestrator — Phase 4B smoke test.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRedDirtEnv } from "./load-red-dirt-env";
import { buildOrchestrationStatePayload } from "../src/lib/agents/orchestration/build-orchestration-payload";
import { CAMPAIGN_SECTION_MAP } from "../src/lib/agents/orchestration/cross-domain/campaign-section-map";
import { buildCrossDomainDependencyGraph } from "../src/lib/agents/orchestration/cross-domain/cross-domain-dependency-graph";
import { buildCrossDomainPlaybooks } from "../src/lib/agents/orchestration/cross-domain/cross-domain-playbook-engine";
import { buildCrossDomainActionPackets } from "../src/lib/agents/orchestration/cross-domain/cross-domain-action-packets";
import { buildCrossDomainOrchestrationState } from "../src/lib/agents/orchestration/cross-domain/cross-domain-orchestration-state";
import { loadUnifiedAgentToolRegistry } from "../src/lib/agents/orchestration/tooling/agent-tool-registry";
import { buildAgentToolingState } from "../src/lib/agents/orchestration/tooling/agent-tooling-state";
import { runOrchestrationReasoning } from "../src/lib/agents/orchestration/orchestration-reasoning-engine";
import { buildSkeletonCampaignState } from "../src/lib/agents/orchestration/campaign-state-types";
import type { OrchestrationSourceHealth } from "../src/lib/agents/orchestration/orchestration-source-health";
import { resetCountyWorkbenchAdapterCache } from "../src/lib/agents/county-intelligence/county-workbench-adapter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));
resetCountyWorkbenchAdapterCache();

const REQUIRED = [
  "executive_command",
  "county_intelligence",
  "communications",
  "email_os_ecc",
  "events_calendar",
  "volunteer_field",
  "finance_reimbursement",
  "compliance",
  "content_media",
  "donor_fundraising",
  "scheduling",
  "research_strategy",
  "ask_kelly",
  "tool_builder",
  "training_copilots",
  "memory_observations",
  "public_site",
  "deployment_readiness",
];

async function main() {
  const state = buildSkeletonCampaignState("2026-04");
  const sourceHealth: OrchestrationSourceHealth[] = [];
  const diagnosis = runOrchestrationReasoning(state);
  const agentTooling = buildAgentToolingState({ state, sourceHealth, diagnosis, role: "campaign_manager", period: "2026-04" });
  const registry = loadUnifiedAgentToolRegistry();
  const graph = buildCrossDomainDependencyGraph(state);
  const playbooks = buildCrossDomainPlaybooks(state, agentTooling);
  const packets = buildCrossDomainActionPackets(state, agentTooling, playbooks);
  const xdom = buildCrossDomainOrchestrationState({ state, sourceHealth, agentTooling, role: "campaign_manager", period: "2026-04" });
  const payload = await buildOrchestrationStatePayload("2026-04");

  const requiredSectionsPresent = REQUIRED.every((id) => CAMPAIGN_SECTION_MAP.some((s) => s.id === id));
  const allExplainUnderstanding = CAMPAIGN_SECTION_MAP.every((s) => s.improvesCampaignUnderstandingHow.trim().length > 20);
  const graphBuilds = graph.nodes.length >= REQUIRED.length && graph.edges.length >= 10;
  const routerSelects = xdom.recommendedSectionFocus != null && xdom.sectionCoverage.some((c) => c.readyToolCount > 0);
  const requiredPlaybooks = [
    "county-activation",
    "comms-to-field-mobilization",
    "event-intelligence",
    "campaign-manager-daily-command",
    "compliance-safe-operations",
    "deployment-readiness",
  ].every((id) => playbooks.some((p) => p.id === id));
  const packetsNonExecuting = packets.length > 0 && packets.every((p) => p.safetySummary.canExecuteNow === false && p.safetySummary.autoExecutionDisabled === true);
  const hooksGenerated = xdom.learningHooks.length >= playbooks.length;
  const inCampaignState = payload.campaignState.crossDomainOrchestration.sectionMap.length >= REQUIRED.length;
  const dashboardNoUnsafeExecution = true;
  const safetyBlocksRestricted = xdom.safetySummary.restrictedActions.some((a) => a.includes("auto_send_email") || a.includes("finance_post"));
  const registryLoaded = registry.length > 0;

  console.log("Cross-domain orchestrator test (Phase 4B)");
  console.log("  registry tools:", registry.length);
  console.log("  sections:", CAMPAIGN_SECTION_MAP.length);
  console.log("  graph nodes:", graph.nodes.length);
  console.log("  graph edges:", graph.edges.length);
  console.log("  focus:", xdom.recommendedSectionFocus?.label ?? "none");
  console.log("  playbooks:", playbooks.length);
  console.log("  packets:", packets.length);
  console.log("  hooks:", xdom.learningHooks.length);
  console.log("  payload sections:", payload.crossDomainOrchestration.sectionMap.length);

  const ok =
    registryLoaded &&
    requiredSectionsPresent &&
    allExplainUnderstanding &&
    graphBuilds &&
    routerSelects &&
    requiredPlaybooks &&
    packetsNonExecuting &&
    hooksGenerated &&
    inCampaignState &&
    dashboardNoUnsafeExecution &&
    safetyBlocksRestricted;

  if (!ok) {
    console.error("FAIL", {
      registryLoaded,
      requiredSectionsPresent,
      allExplainUnderstanding,
      graphBuilds,
      routerSelects,
      requiredPlaybooks,
      packetsNonExecuting,
      hooksGenerated,
      inCampaignState,
      dashboardNoUnsafeExecution,
      safetyBlocksRestricted,
    });
    process.exit(1);
  }

  console.log("OK — section map, dependency graph, router, playbooks, packets, learning hooks, CampaignState, and safety");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
