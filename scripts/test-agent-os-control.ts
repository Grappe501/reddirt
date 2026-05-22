/**
 * Agent OS Control Layer smoke — no email/GCal/finance writes.
 */
import { loadRedDirtEnv } from "./load-red-dirt-env";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildCampaignOsStateSnapshot } from "../src/lib/agents/os-control/campaign-os-state-snapshot";
import { buildOsWorkflowPlans } from "../src/lib/agents/os-control/os-workflow-planner";
import { prepareAgentActions } from "../src/lib/agents/os-control/agent-action-preparer";
import { isActionForbidden, gatesByRisk } from "../src/lib/agents/os-control/human-approval-gate-matrix";
import { buildToolExecutionReadinessSummary } from "../src/lib/agents/os-control/tool-execution-readiness";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

async function main() {
  const state = await buildCampaignOsStateSnapshot("2026-03");
  const plans = buildOsWorkflowPlans(state);
  const prepared = prepareAgentActions(state, plans);
  const tools = buildToolExecutionReadinessSummary(10);

  const safePrepared = prepared.filter((p) => p.riskLevel === "low" || p.executionStatus === "prepared_only");
  const emailForbidden = isActionForbidden("send_approval_email");
  const gcalForbidden = isActionForbidden("promote_google_calendar");
  const finForbidden = isActionForbidden("post_financial_transaction");

  console.log("Agent OS control layer test");
  console.log("  period:", state.period);
  console.log("  systemHealthScore:", state.systemHealthScore);
  console.log("  activeBlockers:", state.activeBlockers.length);
  console.log("  recommendedWorkflow:", state.recommendedWorkflow.slice(0, 60) + "…");
  console.log("  workflowPlans:", plans.length);
  console.log("  preparedActions:", prepared.length);
  console.log("  safePrepared:", safePrepared.length);
  console.log("  gated gates:", gatesByRisk("gated").length);
  console.log("  forbidden gates:", gatesByRisk("forbidden").length);
  console.log("  email blocked:", emailForbidden);
  console.log("  gcal blocked:", gcalForbidden);
  console.log("  FIN post blocked:", finForbidden);

  const ok =
    state.systemHealthScore >= 0 &&
    plans.length >= 3 &&
    prepared.length >= 2 &&
    safePrepared.length >= 1 &&
    emailForbidden &&
    gcalForbidden &&
    finForbidden &&
    !prepared.some((p) => p.executionStatus === "prepared_only" && p.actionType === "send_email");

  if (!ok) {
    console.error("FAIL");
    process.exit(1);
  }
  console.log("OK — snapshot, plans, prepared actions; high-risk gates enforced");
  console.log("  sample tool readiness:", tools[0]?.toolId, tools[0]?.canExecute);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
