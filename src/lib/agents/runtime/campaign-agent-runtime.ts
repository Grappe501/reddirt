import { composeCrossDomainContext } from "../orchestration/cross-domain-context-composer";
import { buildMemoryCandidatesFromObservations } from "../memory/agent-memory-write-planner";
import { loadGlobalUserObservations } from "../user-intelligence/user-observations";
import type { CampaignEventsDashboardSnapshot } from "@/lib/campaign-events/load-campaign-events-dashboard";
import { classifyIntent } from "./intent-classifier";
import { routeToolsForIntent } from "./tool-router";
import { buildToolPlan } from "./tool-planner";
import { buildAgentResponseCopy } from "./agent-response-builder";
import { appendRuntimeAudit } from "./runtime-audit";
import { upsertMemoryCandidate } from "./memory-review-store";
import type { AgentRuntimeRequest, AgentRuntimeResponse } from "./agent-runtime-types";

export type CampaignAgentRuntimeInput = AgentRuntimeRequest & {
  snapshot?: CampaignEventsDashboardSnapshot | null;
  readinessScore?: number | null;
  syncStale?: boolean;
};

export function runCampaignAgentRuntime(input: CampaignAgentRuntimeInput): AgentRuntimeResponse {
  const observations = loadGlobalUserObservations();
  const recent = observations.slice(-24);

  const intent = classifyIntent(input.message, input.pathname, input.period);
  const cross = composeCrossDomainContext({
    role: input.role,
    pathname: input.pathname,
    period: input.period,
    eventRecordId: input.eventRecordId,
    snapshot: input.snapshot,
    recentObservations: recent,
    readinessScore: input.readinessScore ?? null,
    syncStale: input.syncStale ?? Boolean(input.snapshot?.calendarSync?.jsonStale),
  });

  const route = routeToolsForIntent(intent, input.role);
  const blockers = cross.currentBlockers;
  const { proposedPlan, safeActions, blockedActions } = buildToolPlan(intent, route, blockers);
  const { responseCopy, calmSummary, humanControlNote } = buildAgentResponseCopy({
    intent,
    contextSummary: cross.contextSummary,
    blockers,
    route,
    safeActions,
    blockedActions,
  });

  const memoryPlans = buildMemoryCandidatesFromObservations(recent, 4);
  for (const plan of memoryPlans) {
    if (plan.memoryCandidate && plan.memoryType) {
      upsertMemoryCandidate({
        memoryType: plan.memoryType,
        suggestedStorageTarget: plan.suggestedStorageTarget,
        riskLevel: plan.riskLevel,
        reason: plan.reason,
      });
    }
  }

  const audit = appendRuntimeAudit({
    actor: input.actor ?? "admin",
    message: input.message.slice(0, 500),
    intentTask: intent.task,
    intentDomain: intent.domain,
    intentRisk: intent.riskLevel,
    toolsSelected: route.recommended.map((t) => t.id),
    toolsBlocked: route.blocked.map((b) => b.tool.id),
    recommendationsShown: safeActions.map((s) => s.title),
    memoryCandidates: memoryPlans.filter((m) => m.memoryCandidate).length,
    pathname: input.pathname,
    period: input.period,
  });

  return {
    interpretedIntent: intent,
    activeDomain: cross.activeDomain,
    contextSummary: cross.contextSummary,
    blockers,
    selectedTools: route.recommended,
    blockedTools: route.blocked,
    proposedPlan,
    safeActions,
    blockedActions,
    nextLinks: route.actionLinks,
    responseCopy,
    calmSummary,
    observationEvents: ["user_used_plain_language_request"],
    memoryCandidates: memoryPlans,
    auditId: audit.id,
    humanControlNote,
  };
}
