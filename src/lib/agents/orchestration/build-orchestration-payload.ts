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
import type { CampaignUserRole } from "@/lib/agents/user-intelligence/user-personas";
import {
  buildOrchestrationLearningInsights,
  type OrchestrationLearningInsight,
} from "./orchestration-learning-insights";
import { buildSkeletonCampaignState } from "./campaign-state-types";

export type OrchestrationSafetyPayload = {
  humanGateRequired: true;
  autoExecutionDisabled: true;
  restrictedActions: string[];
  controlRules: readonly string[];
  safetyCheckOk: boolean;
};

export type OrchestrationPageMeta = {
  period: string;
  role: CampaignUserRole;
  pathname: string;
};

export type OrchestrationStatePayload = {
  ok: boolean;
  generatedAt: string;
  meta: OrchestrationPageMeta;
  campaignState: CampaignState;
  diagnosis: OrchestrationDiagnosis;
  recommendedWorkflows: OrchestrationWorkflow[];
  blockers: CampaignBlocker[];
  opportunities: CampaignOpportunity[];
  risks: string[];
  topMoves: OrchestrationTopMove[];
  sourceHealth: OrchestrationSourceHealth[];
  safety: OrchestrationSafetyPayload;
  learningInsights: OrchestrationLearningInsight;
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

function emptyDiagnosis(state: CampaignState): OrchestrationDiagnosis {
  return {
    headline: "Orchestration unavailable",
    executiveSummary: "Could not load campaign signals.",
    campaignDiagnosis: state.observationSummary,
    confidenceLevel: "low",
    topBlockers: [],
    topOpportunities: [],
    topRisks: [],
    topMoves: [],
    perDomainDiagnosis: [],
    workflowRecommendations: [],
    communicationsNeeds: [],
    volunteerNeeds: [],
    countyPriorities: [],
    trainingGaps: [],
    toolBuildGaps: [],
    dashboardSimplifications: [],
  };
}

export function normalizeOrchestrationPayload(
  partial: Partial<OrchestrationStatePayload> & Pick<OrchestrationStatePayload, "meta">,
): OrchestrationStatePayload {
  const state = partial.campaignState ?? buildSkeletonCampaignState(partial.meta.period);
  const diagnosis = partial.diagnosis ?? emptyDiagnosis(state);
  const safety = partial.safety ?? buildSafety();
  const base: OrchestrationStatePayload = {
    ok: partial.ok ?? false,
    generatedAt: partial.generatedAt ?? new Date().toISOString(),
    meta: partial.meta,
    campaignState: state,
    diagnosis,
    recommendedWorkflows: partial.recommendedWorkflows ?? [],
    blockers: partial.blockers ?? diagnosis.topBlockers ?? [],
    opportunities: partial.opportunities ?? diagnosis.topOpportunities ?? [],
    risks: partial.risks ?? diagnosis.topRisks ?? [],
    topMoves: partial.topMoves ?? diagnosis.topMoves ?? [],
    sourceHealth: partial.sourceHealth ?? [],
    safety,
    learningInsights: {
      weakDomains: [],
      missingSources: [],
      neededObservations: [],
      toolCoverageGaps: [],
      recommendedImprovements: [],
      knowsSummary: "",
      unknownSummary: "",
    },
    ...(partial.errors?.length ? { errors: partial.errors } : {}),
  };
  base.learningInsights = buildOrchestrationLearningInsights(base);
  return base;
}

export async function buildOrchestrationStatePayload(
  period = "2026-04",
  options?: { pathname?: string; role?: CampaignUserRole },
): Promise<OrchestrationStatePayload> {
  const pathname = options?.pathname ?? "/admin/orchestration";
  const role = options?.role ?? "campaign_manager";
  const meta: OrchestrationPageMeta = { period, role, pathname };

  const { state, sourceHealth, bundle } = await loadCampaignOrchestrationSignals(period, { pathname, role });
  const diagnosis = runOrchestrationReasoning(state);
  const recommendedWorkflows = activateWorkflowsFromState(state, diagnosis);
  const partialErrors = bundle.errors.length > 0 ? bundle.errors : undefined;

  return normalizeOrchestrationPayload({
    ok: state.operatingMode !== "skeleton",
    generatedAt: state.generatedAt,
    meta,
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
  });
}

export function buildOrchestrationErrorPayload(message: string, meta: OrchestrationPageMeta): OrchestrationStatePayload {
  const state = buildSkeletonCampaignState(meta.period);
  return normalizeOrchestrationPayload({
    ok: false,
    generatedAt: new Date().toISOString(),
    meta,
    campaignState: state,
    diagnosis: emptyDiagnosis(state),
    errors: [message],
    safety: buildSafety(),
  });
}
