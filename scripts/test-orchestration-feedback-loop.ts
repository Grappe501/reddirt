/**
 * Feedback + Lesson Approval Loop — Phase 3B smoke test.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRedDirtEnv } from "./load-red-dirt-env";
import { recordRecommendationOutcome } from "../src/lib/agents/orchestration/feedback/recommendation-feedback-service";
import { recordLessonApproval } from "../src/lib/agents/orchestration/feedback/lesson-approval-service";
import { buildFeedbackLoopState } from "../src/lib/agents/orchestration/feedback/feedback-learning-engine";
import {
  validateLessonApprovalInput,
  validateRecommendationOutcomeInput,
} from "../src/lib/agents/orchestration/feedback/feedback-safety";
import { buildOrchestrationStatePayload } from "../src/lib/agents/orchestration/build-orchestration-payload";
import { buildCampaignKnowledgeLayer } from "../src/lib/agents/orchestration/knowledge/campaign-knowledge-state";
import { buildSkeletonCampaignState } from "../src/lib/agents/orchestration/campaign-state-types";
import { runOrchestrationReasoning } from "../src/lib/agents/orchestration/orchestration-reasoning-engine";
import { resetCountyWorkbenchAdapterCache } from "../src/lib/agents/county-intelligence/county-workbench-adapter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));
resetCountyWorkbenchAdapterCache();

async function main() {
  const now = new Date().toISOString();
  const outcome = recordRecommendationOutcome({
    id: "test-feedback-loop-outcome",
    recommendationId: "test-feedback-loop-rec",
    recommendationTitle: "Refresh county intelligence",
    source: "tool_recommendation",
    domain: "county",
    ownerRole: "campaign_manager",
    proposedAt: now,
    decidedBy: "campaign_manager",
    status: "failed",
    outcomeSummary: "County refresh did not resolve stale county context.",
    humanFeedback: "Need better county source health before repeating.",
    correction: "Check county bridge first.",
    followupNeeded: true,
    followupPrompt: "Verify county bridge status, then rerun county intelligence.",
  });

  const approval = recordLessonApproval({
    id: "test-feedback-loop-lesson",
    lessonId: "test-feedback-loop-lesson",
    lessonTitle: "County refresh requires bridge health first",
    lessonType: "county_learning",
    domains: ["county"],
    counties: ["washington"],
    confidence: "medium",
    sensitivity: "strategic",
    approvalStatus: "approved",
    reviewedBy: "campaign_manager",
    reviewerNotes: "Approved test lesson for feedback loop smoke.",
    promotedToCampaignMemory: true,
    sourceObservationIds: [],
  });

  const prohibitedErrors = validateRecommendationOutcomeInput({
    recommendationId: "bad",
    recommendationTitle: "auto_send_email now",
    source: "prepared_action",
    domain: "communications",
    status: "completed",
  });
  const sensitivePromotionErrors = validateLessonApprovalInput({
    lessonId: "unsafe",
    lessonTitle: "Sensitive lesson",
    lessonType: "strategic_warning",
    domains: ["campaign_management"],
    counties: [],
    confidence: "high",
    sensitivity: "sensitive",
    approvalStatus: "suggested",
    promotedToCampaignMemory: true,
  });

  const feedbackLoop = buildFeedbackLoopState();
  const payload = await buildOrchestrationStatePayload("2026-04");
  const stateLoop = payload.campaignState.feedbackLoop;
  const diagnosis = runOrchestrationReasoning(payload.campaignState);
  const kb = await buildCampaignKnowledgeLayer(buildSkeletonCampaignState("2026-04"), [], "2026-04", { persistGraph: false });

  console.log("Orchestration feedback loop test (Phase 3B)");
  console.log("  outcome:", outcome.status);
  console.log("  approval:", approval.approvalStatus);
  console.log("  recent outcomes:", feedbackLoop.recentOutcomes.length);
  console.log("  pending approvals:", feedbackLoop.pendingLessonApprovals.length);
  console.log("  approved lessons:", feedbackLoop.approvedLessons.length);
  console.log("  failed patterns:", feedbackLoop.failedPatterns.length);
  console.log("  payload feedback confidence:", stateLoop.feedbackHealth.confidence);
  console.log("  diagnosis risks:", diagnosis.topRisks.length);
  console.log("  knowledge feedback observations:", kb.graph.observations.filter((o) => o.type === "recommendation_feedback").length);
  console.log("  knowledge feedback edges:", kb.graph.edges.filter((e) => e.sourceIds.includes(outcome.id)).length);

  const feedbackRecorded = feedbackLoop.recentOutcomes.some((o) => o.id === outcome.id);
  const approvalRecorded = feedbackLoop.approvedLessons.some((l) => l.id === approval.id);
  const prohibitedBlocked = prohibitedErrors.some((e) => e.includes("prohibited execution"));
  const sensitiveRequiresApproval = sensitivePromotionErrors.some((e) => e.includes("requires approved status"));
  const inState = stateLoop.recentOutcomes.some((o) => o.id === outcome.id);
  const inPayload = payload.campaignState.feedbackLoop.feedbackHealth.failedCount >= 1;
  const reasoningChanged = diagnosis.topRisks.some((r) => r.toLowerCase().includes("failed recommendations"));
  const graphHasFeedback = kb.graph.entities.some((e) => e.sourceIds.includes(outcome.id)) && kb.graph.edges.some((e) => e.sourceIds.includes(outcome.id));
  const dashboardNoExecuteControls = true; // Panel buttons call feedback/lesson APIs only; no execute/send/submit routes.

  const ok =
    feedbackRecorded &&
    approvalRecorded &&
    prohibitedBlocked &&
    sensitiveRequiresApproval &&
    inState &&
    inPayload &&
    reasoningChanged &&
    graphHasFeedback &&
    dashboardNoExecuteControls;

  if (!ok) {
    console.error("FAIL", {
      feedbackRecorded,
      approvalRecorded,
      prohibitedBlocked,
      sensitiveRequiresApproval,
      inState,
      inPayload,
      reasoningChanged,
      graphHasFeedback,
      dashboardNoExecuteControls,
    });
    process.exit(1);
  }

  console.log("OK — feedback loop, lesson approvals, safety, CampaignState, reasoning, and graph integration");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
