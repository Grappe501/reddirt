import type { CrossDomainLearningHook, CrossDomainPlaybook, CampaignSectionId } from "./cross-domain-orchestrator-types";

function hook(
  playbookId: string,
  sectionId: CampaignSectionId,
  prompt: string,
  partial?: Partial<CrossDomainLearningHook>,
): CrossDomainLearningHook {
  return {
    id: `hook:${playbookId}:${sectionId}`.replace(/[^a-zA-Z0-9:_-]/g, "_"),
    playbookId,
    sectionId,
    prompt,
    expectedObservationType: partial?.expectedObservationType ?? "recommendation_feedback",
    suggestedLessonType: partial?.suggestedLessonType ?? "workflow_learning",
    requiresApproval: partial?.requiresApproval ?? true,
    sensitivity: partial?.sensitivity ?? "internal",
    updatesCampaignStateFields: partial?.updatesCampaignStateFields ?? ["feedbackLoop", "knowledge"],
  };
}

export function buildLearningHooksForPlaybook(playbook: Pick<CrossDomainPlaybook, "id" | "sections">): CrossDomainLearningHook[] {
  if (playbook.id === "county-activation") {
    return [
      hook("county-activation", "county_intelligence", "Did the county activation packet improve county confidence or reveal a new blocker?", {
        suggestedLessonType: "county_learning",
        updatesCampaignStateFields: ["countyIntelligenceSummary", "knowledge", "feedbackLoop"],
      }),
      hook("county-activation", "volunteer_field", "Did the county event prep improve volunteer activation or expose staffing gaps?", {
        expectedObservationType: "workflow_outcome",
        suggestedLessonType: "what_worked",
        updatesCampaignStateFields: ["volunteerHealth", "volunteerActions"],
      }),
      hook("county-activation", "communications", "Did comms prep create useful local observations or audience corrections?", {
        suggestedLessonType: "message_learning",
        updatesCampaignStateFields: ["communicationsHealth", "commsReadiness"],
      }),
    ];
  }
  if (playbook.id === "comms-to-field-mobilization") {
    return [
      hook("comms-to-field-mobilization", "communications", "Did the message/audience prep lead to better volunteer or event follow-up?", {
        suggestedLessonType: "message_learning",
        updatesCampaignStateFields: ["communicationActions", "feedbackLoop"],
      }),
      hook("comms-to-field-mobilization", "email_os_ecc", "Were ECC gates clear, blocked, or corrected by human review?", {
        suggestedLessonType: "what_failed",
        updatesCampaignStateFields: ["emailEccReadiness", "commsReadiness"],
      }),
    ];
  }
  if (playbook.id === "event-intelligence") {
    return [
      hook("event-intelligence", "events_calendar", "What changed before and after the event, and what should be repeated?", {
        expectedObservationType: "event_hot_wash",
        suggestedLessonType: "emerging_pattern",
        updatesCampaignStateFields: ["eventReadiness", "knowledge"],
      }),
      hook("event-intelligence", "memory_observations", "Which hot wash items should become suggested lessons requiring approval?", {
        expectedObservationType: "event_hot_wash",
        suggestedLessonType: "workflow_learning",
        sensitivity: "strategic",
      }),
    ];
  }
  if (playbook.id === "campaign-manager-daily-command") {
    return [
      hook("campaign-manager-daily-command", "executive_command", "Did the daily packet identify the actual highest-leverage campaign section?", {
        suggestedLessonType: "what_worked",
        updatesCampaignStateFields: ["overallHealth", "activeBlockers", "feedbackLoop"],
      }),
      hook("campaign-manager-daily-command", "tool_builder", "Did any blocked decision require a new tool or data source?", {
        expectedObservationType: "tool_usage_signal",
        suggestedLessonType: "knowledge_gap",
        updatesCampaignStateFields: ["toolBuildActions", "agentTooling.coverageByDomain"],
      }),
    ];
  }
  if (playbook.id === "compliance-safe-operations") {
    return [
      hook("compliance-safe-operations", "finance_reimbursement", "Which documentation was missing and did human review clear the packet?", {
        suggestedLessonType: "what_failed",
        sensitivity: "strategic",
        updatesCampaignStateFields: ["financeHealth", "reimbursementReadiness"],
      }),
      hook("compliance-safe-operations", "compliance", "Did compliance review block, approve, or revise the operational plan?", {
        expectedObservationType: "human_decision",
        suggestedLessonType: "workflow_learning",
        sensitivity: "strategic",
        updatesCampaignStateFields: ["complianceReadiness", "systemRisk"],
      }),
    ];
  }
  if (playbook.id === "deployment-readiness") {
    return [
      hook("deployment-readiness", "deployment_readiness", "Did tests/build/migrations/docs prove the campaign OS is safe to ship?", {
        expectedObservationType: "tool_usage_signal",
        suggestedLessonType: "workflow_learning",
        updatesCampaignStateFields: ["signalLoadErrors", "agentTooling.safetySummary"],
      }),
    ];
  }
  return playbook.sections.map((sectionId) => hook(playbook.id, sectionId, `What did ${sectionId.replaceAll("_", " ")} teach CampaignState after this packet?`));
}

export function attachPacketIdsToHooks(hooks: CrossDomainLearningHook[], packetId: string): CrossDomainLearningHook[] {
  return hooks.map((h) => ({ ...h, packetId }));
}
