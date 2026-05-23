/**
 * Safe action preparation — prepare only, never execute by default.
 */

import type { CampaignState } from "../campaign-state-types";
import type { AgentToolRecommendation, PreparedAgentAction } from "./agent-tooling-types";
import type { OrchestrationDiagnosis } from "../orchestration-reasoning-engine";

export function prepareAgentActions(input: {
  state: CampaignState;
  diagnosis: OrchestrationDiagnosis;
  topRecommendations: AgentToolRecommendation[];
}): PreparedAgentAction[] {
  const { state, diagnosis, topRecommendations } = input;
  const now = new Date().toISOString();
  const actions: PreparedAgentAction[] = [];

  for (const move of diagnosis.topMoves.slice(0, 3)) {
    actions.push({
      id: `prep:move:${move.rank}`,
      title: move.title,
      description: move.whyThisMatters,
      actionType: "orchestration_top_move",
      domain: move.domainId,
      preparedByToolId: "orchestration-reasoning-engine",
      suggestedPayload: { route: move.route ?? "", urgency: move.urgency },
      humanApprovalRequired: true,
      approvalPrompt: "Verify this move aligns with current campaign priorities before acting.",
      restrictedExecution: true,
      canExecuteNow: false,
      safetyNotes: ["Execution disabled", "Human must act via linked route"],
      dataSources: ["CampaignState", "orchestration-reasoning-engine"],
      teachesCampaignIfCompleted: "Operator feedback on top moves improves recommendation loop.",
      createdAt: now,
    });
  }

  if (state.commsReadiness.massEmailBlocked) {
    actions.push({
      id: "prep:comms:draft-checklist",
      title: "Comms draft review checklist",
      description: "Prepare sandbox/test send checklist — no mass email execution.",
      actionType: "comms_draft_prepare",
      domain: "communications",
      preparedByToolId: "communications-priority-orchestrator",
      suggestedPayload: { massSendBlocked: true, sendEnabled: state.emailEccReadiness.sendEnabled },
      humanApprovalRequired: true,
      approvalPrompt: "Confirm ECC send gates before any broadcast.",
      restrictedExecution: true,
      canExecuteNow: false,
      safetyNotes: ["No auto_send_email", "Draft and checklist only"],
      dataSources: ["emailEccReadiness", "commsReadiness"],
      teachesCampaignIfCompleted: "Records which comms prep steps cleared send gates.",
      createdAt: now,
    });
  }

  if (state.knowledge.knowledgeGaps.length > 0) {
    actions.push({
      id: "prep:knowledge:gap-review",
      title: "Knowledge gap review prompt",
      description: state.knowledge.knowledgeGaps[0]!.summary,
      actionType: "knowledge_gap_review",
      domain: state.knowledge.knowledgeGaps[0]!.domains[0] ?? "memory",
      preparedByToolId: "campaign-knowledge-memory-synthesizer",
      suggestedPayload: { gapCount: state.knowledge.knowledgeGaps.length },
      humanApprovalRequired: true,
      approvalPrompt: "Review knowledge gaps and log observations to fill blind spots.",
      restrictedExecution: true,
      canExecuteNow: false,
      safetyNotes: ["No sensitive_memory_auto_store"],
      dataSources: ["knowledge.knowledgeGaps", "sourceHealth"],
      teachesCampaignIfCompleted: "Filled gaps improve graph confidence and lesson quality.",
      createdAt: now,
    });
  }

  for (const rec of topRecommendations.slice(0, 2)) {
    if (rec.requiredHumanApproval) {
      actions.push({
        id: `prep:tool:${rec.toolId}`,
        title: `Prepare: ${rec.title}`,
        description: rec.summary,
        actionType: "tool_recommendation_prepare",
        domain: rec.domain,
        preparedByToolId: rec.toolId,
        suggestedPayload: rec.suggestedInputs,
        humanApprovalRequired: true,
        approvalPrompt: rec.doneWhen,
        restrictedExecution: true,
        canExecuteNow: false,
        safetyNotes: [`Safety: ${rec.safety}`, "Execution disabled"],
        dataSources: rec.sourceEvidence,
        teachesCampaignIfCompleted: rec.expectedKnowledgeGraphImprovement,
        createdAt: now,
      });
    }
  }

  if (state.financeComplianceWarnings.length > 0) {
    actions.push({
      id: "prep:finance:compliance-review",
      title: "Finance/compliance review checklist",
      description: state.financeComplianceWarnings.join("; "),
      actionType: "finance_compliance_review",
      domain: "finance",
      preparedByToolId: "campaign-risk-detector",
      suggestedPayload: { warningCount: state.financeComplianceWarnings.length },
      humanApprovalRequired: true,
      approvalPrompt: "Treasurer must verify — no auto finance post or reimbursement submit.",
      restrictedExecution: true,
      canExecuteNow: false,
      safetyNotes: ["No finance_post", "No reimbursement_submit"],
      dataSources: ["financeComplianceWarnings"],
      teachesCampaignIfCompleted: "Compliance reviews become recurring lessons when patterns repeat.",
      createdAt: now,
    });
  }

  return actions.slice(0, 8);
}
