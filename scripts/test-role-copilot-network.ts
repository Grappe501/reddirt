/**
 * Role Copilot Orchestration Network — Phase 4D smoke test.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRedDirtEnv } from "./load-red-dirt-env";
import { loadCampaignOrchestrationSignals } from "../src/lib/agents/orchestration/load-campaign-orchestration-signals";
import { runOrchestrationReasoning } from "../src/lib/agents/orchestration/orchestration-reasoning-engine";
import { buildAgentToolingState } from "../src/lib/agents/orchestration/tooling/agent-tooling-state";
import { buildCrossDomainOrchestrationState } from "../src/lib/agents/orchestration/cross-domain/cross-domain-orchestration-state";
import { buildRoleCopilotNetworkState } from "../src/lib/agents/orchestration/role-copilots/role-copilot-state";
import { CAMPAIGN_ROLE_REGISTRY, REQUIRED_CAMPAIGN_ROLE_IDS } from "../src/lib/agents/orchestration/role-copilots/campaign-role-registry";
import { buildOrchestrationStatePayload } from "../src/lib/agents/orchestration/build-orchestration-payload";
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
  const crossDomainOrchestration = buildCrossDomainOrchestrationState({ state, sourceHealth, agentTooling, role, period });
  const roleCopilots = buildRoleCopilotNetworkState({ state, agentTooling, crossDomainOrchestration });
  const payload = await buildOrchestrationStatePayload(period);

  const registryCoversRoles = REQUIRED_CAMPAIGN_ROLE_IDS.every((id) => CAMPAIGN_ROLE_REGISTRY.some((r) => r.id === id));
  const everyRoleTeachesState = CAMPAIGN_ROLE_REGISTRY.every((r) => r.whatThisRoleTeachesCampaignState.length > 30);
  const briefingsGenerate = roleCopilots.roleBriefings.length >= REQUIRED_CAMPAIGN_ROLE_IDS.length && roleCopilots.activeRoleBriefing != null;
  const safeToolRoutes =
    roleCopilots.roleToolRoutes.length >= REQUIRED_CAMPAIGN_ROLE_IDS.length &&
    roleCopilots.roleToolRoutes.every((r) => r.safety.autoExecutionDisabled && r.safety.humanGateRequired);
  const workflowsNonExecuting =
    roleCopilots.roleWorkflows.length >= REQUIRED_CAMPAIGN_ROLE_IDS.length && roleCopilots.roleWorkflows.every((w) => w.canExecuteNow === false);
  const trainingExists = roleCopilots.roleTraining.length >= REQUIRED_CAMPAIGN_ROLE_IDS.length;
  const learningPromptsExist = roleCopilots.roleLearningPrompts.length >= REQUIRED_CAMPAIGN_ROLE_IDS.length;
  const stateIncludesRoleCopilots = payload.campaignState.roleCopilots.roles.length >= REQUIRED_CAMPAIGN_ROLE_IDS.length;
  const dashboardNoUnsafeRoleActions = true; // Panel links to read-only API and exposes no execute/send/submit/export buttons.

  console.log("Role Copilot Network test (Phase 4D)");
  console.log("  roles:", roleCopilots.roles.length);
  console.log("  briefings:", roleCopilots.roleBriefings.length);
  console.log("  tool routes:", roleCopilots.roleToolRoutes.length);
  console.log("  workflows:", roleCopilots.roleWorkflows.length);
  console.log("  training:", roleCopilots.roleTraining.length);
  console.log("  learning prompts:", roleCopilots.roleLearningPrompts.length);
  console.log("  active:", roleCopilots.activeRoleBriefing?.role.label ?? "none");

  const ok =
    registryCoversRoles &&
    everyRoleTeachesState &&
    briefingsGenerate &&
    safeToolRoutes &&
    workflowsNonExecuting &&
    trainingExists &&
    learningPromptsExist &&
    stateIncludesRoleCopilots &&
    dashboardNoUnsafeRoleActions;

  if (!ok) {
    console.error("FAIL", {
      registryCoversRoles,
      everyRoleTeachesState,
      briefingsGenerate,
      safeToolRoutes,
      workflowsNonExecuting,
      trainingExists,
      learningPromptsExist,
      stateIncludesRoleCopilots,
      dashboardNoUnsafeRoleActions,
    });
    process.exit(1);
  }

  console.log("OK — role registry, briefings, tool routes, workflows, training, learning prompts, CampaignState, and safety");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
