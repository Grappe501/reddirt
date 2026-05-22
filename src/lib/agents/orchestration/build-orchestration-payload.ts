/**
 * Build complete orchestration API payload — server-only entry.
 */

import { loadCampaignOrchestrationSignals } from "./load-campaign-orchestration-signals";
import { runOrchestrationReasoning, type OrchestrationDiagnosis, type OrchestrationTopMove } from "./orchestration-reasoning-engine";
import { activateWorkflowsFromState, type OrchestrationWorkflow } from "./orchestration-workflow-planner";
import type { CampaignState, CampaignBlocker, CampaignOpportunity } from "./campaign-state-types";
import type { OrchestrationSourceHealth } from "./orchestration-source-health";
import {
  ORCHESTRATION_FORBIDDEN_AUTO_ACTIONS,
  assertOrchestrationSafetyBoundaries,
} from "./orchestration-tool-contracts";
import { CAMPAIGN_AI_HUMAN_CONTROL_RULES } from "@/lib/campaign-events/ai-tools/tool-contract";

export type OrchestrationSafetyPayload = {
  humanGateRequired: true;
  autoExecutionDisabled: true;
  restrictedActions: string[];
  controlRules: readonly string[];
  safetyCheckOk: boolean;
};

export type OrchestrationStatePayload = {
  ok: boolean;
  generatedAt: string;
  campaignState: CampaignState;
  diagnosis: OrchestrationDiagnosis;
  recommendedWorkflows: OrchestrationWorkflow[];
  blockers: CampaignBlocker[];
  opportunities: CampaignOpportunity[];
  risks: string[];
  topMoves: OrchestrationTopMove[];
  sourceHealth: OrchestrationSourceHealth[];
  safety: OrchestrationSafetyPayload;
  errors?: string[];
};

function buildSafety(): OrchestrationSafetyPayload {
  const check = assertOrchestrationSafetyBoundaries();
  return {
    humanGateRequired: true,
    autoExecutionDisabled: true,
    restrictedActions: [...ORCHESTRATION_FORBIDDEN_AUTO_ACTIONS],
    controlRules: CAMPAIGN_AI_HUMAN_CONTROL_RULES,
    safetyCheckOk: check.ok,
  };
}

export async function buildOrchestrationStatePayload(
  period = "2026-04",
  options?: { pathname?: string; role?: import("@/lib/agents/user-intelligence/user-personas").CampaignUserRole },
): Promise<OrchestrationStatePayload> {
  const { state, sourceHealth, bundle } = await loadCampaignOrchestrationSignals(period, options);
  const diagnosis = runOrchestrationReasoning(state);
  const recommendedWorkflows = activateWorkflowsFromState(state, diagnosis);
  const degraded = sourceHealth.some((s) => s.status === "error" || s.status === "missing");
  const partialErrors = bundle.errors.length > 0 ? bundle.errors : undefined;

  return {
    ok: state.operatingMode !== "skeleton",
    generatedAt: state.generatedAt,
    campaignState: state,
    diagnosis,
    recommendedWorkflows,
    blockers: diagnosis.topBlockers,
    opportunities: diagnosis.topOpportunities,
    risks: diagnosis.topRisks,
    topMoves: diagnosis.topMoves,
    sourceHealth,
    safety: buildSafety(),
    ...(partialErrors ? { errors: partialErrors } : {}),
  };
}
