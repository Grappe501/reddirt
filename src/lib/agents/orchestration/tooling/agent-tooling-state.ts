/**
 * Build AgentToolingState for CampaignState and orchestration payload.
 */

import type { CampaignState } from "../campaign-state-types";
import type { OrchestrationSourceHealth } from "../orchestration-source-health";
import type { CampaignUserRole } from "@/lib/agents/user-intelligence/user-personas";
import type { OrchestrationDiagnosis } from "../orchestration-reasoning-engine";
import type { AgentToolingState } from "./agent-tooling-types";
import { emptyAgentToolingState } from "./agent-tooling-types";
import { loadUnifiedAgentToolRegistry, registrySummary, validateRegistryUnderstanding } from "./agent-tool-registry";
import { selectAgentTools } from "./agent-tool-selector";
import { buildAgentToolSequences } from "./agent-tool-sequencer";
import { prepareAgentActions } from "./agent-action-prep";
import { analyzeToolCoverageByDomain } from "./agent-tool-coverage";
import { PROHIBITED_EXECUTION_TYPES } from "./agent-tool-safety";

export function buildAgentToolingState(input: {
  state: CampaignState;
  sourceHealth: OrchestrationSourceHealth[];
  diagnosis: OrchestrationDiagnosis;
  role: CampaignUserRole;
  period: string;
}): AgentToolingState {
  const registry = loadUnifiedAgentToolRegistry();
  const understandingGaps = validateRegistryUnderstanding(registry);
  if (understandingGaps.length > 0) {
    console.warn("[agent-tooling] tools missing improvesCampaignUnderstandingHow:", understandingGaps.slice(0, 5));
  }

  const selection = selectAgentTools({
    state: input.state,
    sourceHealth: input.sourceHealth,
    registry,
    role: input.role,
    period: input.period,
  });

  const sequences = buildAgentToolSequences(input.state, registry);
  const preparedActions = prepareAgentActions({
    state: input.state,
    diagnosis: input.diagnosis,
    topRecommendations: selection.topFive,
  });

  const coverageByDomain = analyzeToolCoverageByDomain(registry);
  const summary = registrySummary(registry);

  const safetySummary = {
    autoExecutionDisabled: true as const,
    prohibitedActionTypes: [...PROHIBITED_EXECUTION_TYPES],
    safeReadCount: registry.filter((t) => t.safetyLevel === "safe_read").length,
    approvalRequiredCount: registry.filter((t) => t.safetyLevel === "approval_required").length,
    prohibitedCount: registry.filter((t) => t.safetyLevel === "prohibited").length,
    humanGateRequired: true as const,
  };

  const bestNext = selection.topFive[0] ?? null;
  const toolingSummary = `${summary.total} tools (${summary.ready} ready) · ${selection.topFive.length} recommended · ${preparedActions.length} prepared actions · execution disabled.`;

  return {
    registryToolCount: registry.length,
    topRecommendedTools: selection.topFive,
    recommendedSequences: sequences.slice(0, 5),
    preparedActions,
    coverageByDomain,
    blockedTools: selection.blocked,
    missingTools: selection.missing,
    safetySummary,
    bestNextToolForCampaignState: bestNext,
    toolingSummary,
  };
}

export { emptyAgentToolingState };
