import { appendGlobalUserObservation } from "@/lib/agents/user-intelligence/user-observations";
import { loadRuntimeAudit } from "@/lib/agents/runtime/runtime-audit";
import { buildCampaignOsStateSnapshot } from "./campaign-os-state-snapshot";
import { buildOsWorkflowPlans, rankTopMoves } from "./os-workflow-planner";
import { prepareAgentActions } from "./agent-action-preparer";
import { HUMAN_APPROVAL_GATES, gatesByRisk } from "./human-approval-gate-matrix";
import { buildToolExecutionReadinessSummary, countReadinessBands } from "./tool-execution-readiness";

export type OsControlBundle = {
  state: Awaited<ReturnType<typeof buildCampaignOsStateSnapshot>>;
  plans: ReturnType<typeof buildOsWorkflowPlans>;
  topMoves: ReturnType<typeof rankTopMoves>;
  preparedActions: ReturnType<typeof prepareAgentActions>;
  gates: typeof HUMAN_APPROVAL_GATES;
  gatesSafe: ReturnType<typeof gatesByRisk>;
  gatesGated: ReturnType<typeof gatesByRisk>;
  gatesForbidden: ReturnType<typeof gatesByRisk>;
  toolReadiness: ReturnType<typeof buildToolExecutionReadinessSummary>;
  toolBands: ReturnType<typeof countReadinessBands>;
  recentAudits: ReturnType<typeof loadRuntimeAudit>;
};

export async function loadOsControlBundle(period = "2026-04", options?: { emitObservation?: boolean }): Promise<OsControlBundle> {
  const state = await buildCampaignOsStateSnapshot(period);
  const plans = buildOsWorkflowPlans(state);
  const preparedActions = prepareAgentActions(state, plans);
  const toolReadiness = buildToolExecutionReadinessSummary(20);
  const toolBands = countReadinessBands(toolReadiness);
  const recentAudits = loadRuntimeAudit().slice(-8).reverse();

  if (options?.emitObservation !== false) {
    appendGlobalUserObservation({
      event: "os_state_snapshot_viewed",
      actor: "system",
      role: "operator",
      pathname: "/admin/ai-command-center",
      meta: { score: state.systemHealthScore, blockers: state.activeBlockers.length },
    });
    appendGlobalUserObservation({
      event: "agent_workflow_plan_generated",
      actor: "system",
      role: "operator",
      pathname: "/admin/ai-command-center",
      meta: { plans: plans.length },
    });
    if (preparedActions.length) {
      appendGlobalUserObservation({ event: "agent_action_prepared", actor: "system", role: "operator", pathname: "/admin/ai-command-center" });
    }
    if (state.activeBlockers.length) {
      appendGlobalUserObservation({ event: "system_blocker_detected", actor: "system", role: "operator", pathname: "/admin/ai-command-center" });
    }
  }

  return {
    state,
    plans,
    topMoves: rankTopMoves(plans, 3),
    preparedActions,
    gates: HUMAN_APPROVAL_GATES,
    gatesSafe: gatesByRisk("safe"),
    gatesGated: gatesByRisk("gated"),
    gatesForbidden: gatesByRisk("forbidden"),
    toolReadiness,
    toolBands,
    recentAudits,
  };
}
