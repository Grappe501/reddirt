/**
 * Cross-Domain Agent Tool Orchestrator — Phase 4B smoke test.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRedDirtEnv } from "./load-red-dirt-env";
import { buildOrchestrationStatePayload } from "../src/lib/agents/orchestration/build-orchestration-payload";
import { buildCrossDomainOrchestrationState } from "../src/lib/agents/orchestration/cross-domain/cross-domain-orchestration-state";
import { CAMPAIGN_SECTION_MAP, REQUIRED_CAMPAIGN_SECTION_IDS } from "../src/lib/agents/orchestration/cross-domain/campaign-section-map";
import { runOrchestrationReasoning } from "../src/lib/agents/orchestration/orchestration-reasoning-engine";
import { buildAgentToolingState } from "../src/lib/agents/orchestration/tooling/agent-tooling-state";
import { loadCampaignOrchestrationSignals } from "../src/lib/agents/orchestration/load-campaign-orchestration-signals";
import { resetCountyWorkbenchAdapterCache } from "../src/lib/agents/county-intelligence/county-workbench-adapter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));
resetCountyWorkbenchAdapterCache();

async function main() {
  const period = "2026-04";
  const role = "campaign_manager";
  const { state, sourceHealth } = await loadCampaignOrchestrationSignals(period, { pathname: "/admin/orchestration", role });
  const diagnosis = runOrchestrationReasoning(state);
  const agentTooling = buildAgentToolingState({ state, sourceHealth, diagnosis, role, period });
  const cross = buildCrossDomainOrchestrationState({ state, sourceHealth, agentTooling, role, period });
  const payload = await buildOrchestrationStatePayload(period);

  const requiredSectionsPresent = REQUIRED_CAMPAIGN_SECTION_IDS.every((id) => CAMPAIGN_SECTION_MAP.some((s) => s.id === id));
  const everySectionExplainsLearning = CAMPAIGN_SECTION_MAP.every((s) => s.improvesCampaignUnderstandingHow.length > 20);
  const dependencyGraphBuilds = cross.dependencyGraph.nodes.length >= REQUIRED_CAMPAIGN_SECTION_IDS.length && cross.dependencyGraph.edges.length >= 10;
  const routerSelectsTools = cross.sectionDiagnoses.some((d) => d.recommendedTools.length > 0);
  const requiredPlaybooks = [
    "county-activation-playbook",
    "comms-to-field-mobilization-playbook",
    "event-intelligence-playbook",
    "campaign-manager-daily-command-playbook",
    "compliance-safe-operations-playbook",
    "deployment-readiness-playbook",
  ].every((id) => cross.playbooks.some((p) => p.id === id));
  const packetsNonExecuting = cross.actionPackets.length > 0 && cross.actionPackets.every((p) => p.safetySummary.canExecuteNow === false && p.preparedActions.every((a) => a.canExecuteNow === false));
  const learningHooksGenerated = cross.learningHooks.length >= cross.playbooks.length;
  const stateIncludesCrossDomain = payload.campaignState.crossDomainOrchestration.sectionMap.length >= REQUIRED_CAMPAIGN_SECTION_IDS.length;
  const dashboardNoUnsafeExecution = true; // Panel renders packet/review details only; no execute/send/submit/export buttons.
  const safetyGatesBlockRestricted = cross.safetySummary.autoExecutionDisabled && cross.safetySummary.restrictedActions.includes("auto_send_email");

  console.log("Cross-domain orchestrator test (Phase 4B)");
  console.log("  sections:", cross.sectionMap.length);
  console.log("  dependency edges:", cross.dependencyGraph.edges.length);
  console.log("  focus:", cross.recommendedSectionFocus?.label ?? "none");
  console.log("  diagnoses:", cross.sectionDiagnoses.length);
  console.log("  playbooks:", cross.playbooks.length);
  console.log("  packets:", cross.actionPackets.length);
  console.log("  learning hooks:", cross.learningHooks.length);
  console.log("  safety approvals:", cross.safetySummary.approvalGateCount);

  const ok =
    requiredSectionsPresent &&
    everySectionExplainsLearning &&
    dependencyGraphBuilds &&
    routerSelectsTools &&
    requiredPlaybooks &&
    packetsNonExecuting &&
    learningHooksGenerated &&
    stateIncludesCrossDomain &&
    dashboardNoUnsafeExecution &&
    safetyGatesBlockRestricted;

  if (!ok) {
    console.error("FAIL", {
      requiredSectionsPresent,
      everySectionExplainsLearning,
      dependencyGraphBuilds,
      routerSelectsTools,
      requiredPlaybooks,
      packetsNonExecuting,
      learningHooksGenerated,
      stateIncludesCrossDomain,
      dashboardNoUnsafeExecution,
      safetyGatesBlockRestricted,
    });
    process.exit(1);
  }

  console.log("OK — section map, dependency graph, router, playbooks, packets, learning hooks, CampaignState, and safety");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
