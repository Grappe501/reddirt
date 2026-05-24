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
import { buildAgentToolingState, emptyAgentToolingState } from "./tooling/agent-tooling-state";
import type { AgentToolingState } from "./tooling/agent-tooling-types";
import { buildCrossDomainOrchestrationState, emptyCrossDomainOrchestrationState } from "./cross-domain/cross-domain-orchestration-state";
import type { CrossDomainOrchestrationState } from "./cross-domain/cross-domain-orchestrator-types";

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
  agentTooling: AgentToolingState;
  crossDomainOrchestration: CrossDomainOrchestrationState;
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
    agentTooling: emptyAgentToolingState(),
    crossDomainOrchestration: emptyCrossDomainOrchestrationState(),
    ...(partial.errors?.length ? { errors: partial.errors } : {}),
  };
  base.learningInsights = buildOrchestrationLearningInsights(base);
  if (partial.agentTooling) {
    base.agentTooling = partial.agentTooling;
    base.campaignState = { ...base.campaignState, agentTooling: partial.agentTooling };
  } else if (base.campaignState.agentTooling?.registryToolCount) {
    base.agentTooling = base.campaignState.agentTooling;
  }
  if (partial.crossDomainOrchestration) {
    base.crossDomainOrchestration = partial.crossDomainOrchestration;
    base.campaignState = { ...base.campaignState, crossDomainOrchestration: partial.crossDomainOrchestration };
  } else if (base.campaignState.crossDomainOrchestration?.sectionMap.length) {
    base.crossDomainOrchestration = base.campaignState.crossDomainOrchestration;
  }
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
  const agentTooling = buildAgentToolingState({ state, sourceHealth, diagnosis, role, period });
  const crossDomainOrchestration = buildCrossDomainOrchestrationState({ state: { ...state, agentTooling }, sourceHealth, agentTooling, role, period });
  const enrichedDiagnosis = {
    ...diagnosis,
    toolBuildGaps: [
      ...(crossDomainOrchestration.recommendedSectionFocus
        ? [
            `Cross-domain focus: ${crossDomainOrchestration.recommendedSectionFocus.label} — ${crossDomainOrchestration.recommendedSectionFocus.summary}`,
          ]
        : []),
      ...(agentTooling.bestNextToolForCampaignState
        ? [`Best next tool: ${agentTooling.bestNextToolForCampaignState.title} — ${agentTooling.bestNextToolForCampaignState.whyNow}`]
        : []),
      ...agentTooling.coverageByDomain
        .filter((c) => c.coverageStatus === "weak" || c.coverageStatus === "missing")
        .slice(0, 2)
        .map((c) => `${c.domainLabel} tool coverage ${c.coverageStatus} — build: ${c.recommendedNextTool}`),
      ...diagnosis.toolBuildGaps,
    ].slice(0, 8),
  };
  const campaignState = { ...state, agentTooling, crossDomainOrchestration };
  const recommendedWorkflows = activateWorkflowsFromState(campaignState, enrichedDiagnosis);
  const partialErrors = bundle.errors.length > 0 ? bundle.errors : undefined;

  return normalizeOrchestrationPayload({
    ok: campaignState.operatingMode !== "skeleton",
    generatedAt: campaignState.generatedAt,
    meta,
    campaignState,
    diagnosis: enrichedDiagnosis,
    recommendedWorkflows,
    blockers: enrichedDiagnosis.topBlockers,
    opportunities: enrichedDiagnosis.topOpportunities,
    risks: enrichedDiagnosis.topRisks,
    topMoves: enrichedDiagnosis.topMoves,
    sourceHealth,
    safety: buildSafety(),
    agentTooling,
    crossDomainOrchestration,
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
