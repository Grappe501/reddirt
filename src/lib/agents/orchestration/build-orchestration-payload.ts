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
import { buildRoleCopilotNetworkState, emptyRoleCopilotNetworkState } from "./role-copilots/role-copilot-state";
import type { RoleCopilotNetworkState } from "./role-copilots/role-copilot-types";
import {
  buildCountyAgentRuntimePayload,
  type CountyAgentRuntimePayload,
} from "@/lib/agents/county-intelligence/countyAgentRuntimePayloadBuilder";
import {
  runCampaignManagerAnalysisAgent,
  type CampaignManagerAnalysisResult,
} from "@/lib/agents/county-intelligence/campaignManagerAnalysisAgent";

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
  roleCopilots: RoleCopilotNetworkState;
  countyAgentRuntime: CountyAgentRuntimePayload | null;
  campaignManagerAnalysis: CampaignManagerAnalysisResult | null;
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
    roleCopilots: emptyRoleCopilotNetworkState(),
    countyAgentRuntime: null,
    campaignManagerAnalysis: null,
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
  if (partial.roleCopilots) {
    base.roleCopilots = partial.roleCopilots;
    base.campaignState = { ...base.campaignState, roleCopilots: partial.roleCopilots };
  } else if (base.campaignState.roleCopilots?.roles.length) {
    base.roleCopilots = base.campaignState.roleCopilots;
  }
  if (partial.countyAgentRuntime) {
    base.countyAgentRuntime = partial.countyAgentRuntime;
  }
  if (partial.campaignManagerAnalysis) {
    base.campaignManagerAnalysis = partial.campaignManagerAnalysis;
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
  const crossDomainOrchestration = buildCrossDomainOrchestrationState({ state, sourceHealth, agentTooling, role, period });
  const roleCopilots = buildRoleCopilotNetworkState({ state, agentTooling, crossDomainOrchestration });
  const enrichedDiagnosis = {
    ...diagnosis,
    toolBuildGaps: [
      ...(roleCopilots.activeRoleBriefing
        ? [`Role briefing: ${roleCopilots.activeRoleBriefing.role.label} — ${roleCopilots.activeRoleBriefing.topPriorities[0] ?? "review role plan"}`]
        : []),
      ...(crossDomainOrchestration.recommendedSectionFocus
        ? [`Section focus: ${crossDomainOrchestration.recommendedSectionFocus.label} — ${crossDomainOrchestration.recommendedSectionFocus.whyNeedsAttention}`]
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
  const campaignState = { ...state, agentTooling, crossDomainOrchestration, roleCopilots };
  const recommendedWorkflows = activateWorkflowsFromState(campaignState, enrichedDiagnosis);
  const partialErrors = bundle.errors.length > 0 ? bundle.errors : undefined;
  let countyAgentRuntime: CountyAgentRuntimePayload | null = null;
  try {
    countyAgentRuntime = await buildCountyAgentRuntimePayload();
  } catch {
    countyAgentRuntime = null;
  }
  let campaignManagerAnalysis: CampaignManagerAnalysisResult | null = null;
  try {
    if (countyAgentRuntime) {
      campaignManagerAnalysis = runCampaignManagerAnalysisAgent(countyAgentRuntime);
    }
  } catch {
    campaignManagerAnalysis = null;
  }

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
    roleCopilots,
    countyAgentRuntime,
    campaignManagerAnalysis,
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
