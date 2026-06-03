import { loadOppositionArchiveRollup } from "@/lib/opposition/oppositionBriefConfidence";
import { summarizeClaimLedger } from "@/lib/intelligence/claims/claimLedgerSummary";
import {
  summarizeHumanActionQueue,
  summarizePersistedHumanActionQueue,
} from "@/lib/intelligence/strategicDecisionSupport";
import { summarizeDraftReviewQueue } from "@/lib/intelligence/llmDraftGateway";
import { buildLegislativeVideoIntelligenceRollup } from "@/lib/legislature/legislativeVideoIntelligenceRollup";
import { isIntelligenceOppositionDebateLaunchMode } from "@/lib/intelligence/intelligenceLaunchMode";
import { tryIntelligenceLoad } from "@/lib/intelligence/safeIntelligenceLoad";
import type { ClaimLedgerSummary } from "@/lib/intelligence/claims/claimLedgerSummary";
import type { HumanActionQueueSummary } from "@/lib/intelligence/types/humanActionQueue";

export type IntelligenceLaunchHubStats = {
  archive: ReturnType<typeof loadOppositionArchiveRollup> | null;
  claims: ClaimLedgerSummary | null;
  actions: Pick<HumanActionQueueSummary, "totalActions" | "urgentCount"> | null;
  llm: { pendingCount: number } | null;
  legislative: {
    videoCandidatesTotal: number;
    chunkCount: number;
    automationNote: string;
  } | null;
};

export function loadIntelligenceLaunchHubStats(): IntelligenceLaunchHubStats {
  const fast = isIntelligenceOppositionDebateLaunchMode();
  const archive = tryIntelligenceLoad("opposition-archive-rollup", () => loadOppositionArchiveRollup(), null);
  const claims = tryIntelligenceLoad("claim-ledger", () => summarizeClaimLedger(), null);
  const actions = tryIntelligenceLoad(
    "action-queue",
    () => (fast ? summarizePersistedHumanActionQueue() : summarizeHumanActionQueue()),
    null,
  );
  const llm = fast
    ? null
    : tryIntelligenceLoad("llm-queue", () => summarizeDraftReviewQueue(), null);
  const legislative = fast
    ? null
    : tryIntelligenceLoad("legislative-video", () => buildLegislativeVideoIntelligenceRollup(), null);

  return {
    archive,
    claims,
    actions: actions
      ? { totalActions: actions.totalActions, urgentCount: actions.urgentCount }
      : null,
    llm: llm ? { pendingCount: llm.pendingCount } : null,
    legislative: legislative
      ? {
          videoCandidatesTotal: legislative.videoCandidatesTotal,
          chunkCount: legislative.chunkCount,
          automationNote: legislative.automationNote,
        }
      : null,
  };
}
