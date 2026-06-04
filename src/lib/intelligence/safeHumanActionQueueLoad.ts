import { loadDebateIntelligenceV4HubPacket } from "@/lib/intelligence/v4/debateIntelligenceV4";
import { shouldSkipHumanActionQueueSyncOnRequest } from "@/lib/intelligence/intelligenceLaunchMode";
import { tryIntelligenceLoad } from "@/lib/intelligence/safeIntelligenceLoad";
import {
  groupActionsByActionType,
  groupActionsByCounty,
  groupActionsByNarrative,
  groupActionsByOwnerRole,
  loadHumanActionQueue,
  rankHumanActions,
  summarizePersistedHumanActionQueue,
} from "@/lib/intelligence/strategicDecisionSupport";
import {
  HUMAN_ACTION_GOVERNANCE_LABELS,
  type HumanActionQueueFile,
  type HumanActionQueueSummary,
} from "@/lib/intelligence/types/humanActionQueue";

export type SafeActionQueuePageData = {
  queue: HumanActionQueueFile;
  summary: HumanActionQueueSummary;
  indexUnavailable: boolean;
  usedFastPath: boolean;
  v4RetrievalFallback: Array<{
    id: string;
    priority: string;
    description: string;
    recommendedHumanAction: string;
  }>;
};

export function loadSafeActionQueuePageData(): SafeActionQueuePageData {
  let indexLoaded = false;
  const queue = tryIntelligenceLoad(
    "action-queue-file",
    () => {
      indexLoaded = true;
      return loadHumanActionQueue();
    },
    {
      version: 1,
      generatedAt: new Date().toISOString(),
      purpose: "fallback",
      governanceDefaults: {
        publicationSafety: "NON_PUBLISHABLE",
        humanActionRequired: true,
        labels: HUMAN_ACTION_GOVERNANCE_LABELS,
        autonomousExecution: false,
      },
      items: [],
    } as unknown as HumanActionQueueFile,
  );

  const summary = tryIntelligenceLoad(
    "action-queue-summary",
    () => summarizePersistedHumanActionQueue(),
    {
      generatedAt: queue.generatedAt,
      totalActions: 0,
      recommendedCount: 0,
      urgentCount: 0,
      blockedCount: 0,
      highOpportunityCount: 0,
      byStatus: {},
      byOwnerRole: {},
      byActionType: {},
      topUrgent: [],
      topBlocked: [],
      topOpportunity: [],
      debatePrepActions: [],
      citationReviewActions: [],
      countyBriefingActions: [],
      targetPathwayActions: [],
      candidatePrepActions: [],
      researchActions: [],
      fieldActions: [],
      mediaMonitoringActions: [],
      publicationSafety: "NON_PUBLISHABLE",
      humanActionRequired: true,
      queueHref: "/admin/intelligence/action-queue",
    } as unknown as HumanActionQueueSummary,
  );

  const v4 = tryIntelligenceLoad("action-queue-v4-fallback", () => loadDebateIntelligenceV4HubPacket(), null);

  return {
    queue,
    summary,
    indexUnavailable: !indexLoaded || queue.items.length === 0,
    usedFastPath: shouldSkipHumanActionQueueSyncOnRequest(),
    v4RetrievalFallback: v4?.retrievalQueue?.slice(0, 12) ?? [],
  };
}

export function getActiveHumanActions(queue: HumanActionQueueFile) {
  return queue.items.filter((row) => row.status !== "ARCHIVED" && row.status !== "DISMISSED");
}

export function buildActionQueueViewModel(queue: HumanActionQueueFile) {
  const active = getActiveHumanActions(queue);
  const priorityQueue = rankHumanActions(active);
  return {
    priorityQueue,
    byOwner: groupActionsByOwnerRole(active),
    byCounty: groupActionsByCounty(active),
    byNarrative: groupActionsByNarrative(active),
    byType: groupActionsByActionType(active),
  };
}
