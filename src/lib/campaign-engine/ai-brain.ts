/**
 * BRAIN-1: Shared vocabulary for the digital Campaign Manager "brain" integration.
 * No runtime orchestration, no model calls — naming only. See docs/ai-agent-brain-map.md
 */

export const BRAIN1_PACKET = "BRAIN-1" as const;

/** Where a brain-derived suggestion could surface in the unified engine. */
export type CampaignBrainTouchpoint =
  | "public_search"
  | "public_assistant"
  | "form_intake_classify"
  | "comms_thread_summary"
  | "comms_draft_assist"
  | "email_workflow_interpretation"
  | "workbench_orchestration_card"
  | "unified_incoming_list"
  | "media_monitor_ingest"
  | "planning_suggest_dates"
  | "talent_recommendation"
  | "content_review_queue"
  | "ops_lms_future";

/** Kinds of machine output — all advisory until product explicitly approves an action. */
export type BrainRecommendationKind =
  | "answer_grounded"
  | "classify_structured"
  | "summarize_thread"
  | "suggest_next_action"
  | "draft_outreach_copy"
  | "refine_mention"
  | "suggest_event_dates"
  | "heuristic_email_workflow"
  | "llm_email_enrichment_pending_e3"
  | "narrate_metrics"
  | "suggest_training_module";

/**
 * What must always stay in human/operator control (policy, not a runtime check in BRAIN-1).
 * Mirrors docs: sends, PII, compliance, talent promotion, etc.
 */
export const HumanGovernanceBoundary = {
  OUTBOUND_SEND: "outbound_send",
  VOTER_PII_EXPORT: "voter_pii_export",
  COMPLIANCE_CLAIM: "compliance_sensitive_claim",
  SEAT_OR_ROLE_CHANGE: "seat_or_role_change",
  TALENT_PROMOTION: "talent_promotion",
  BROADCAST_TIER2_APPROVAL: "broadcast_approval",
  QUEUE_FIRST_EMAIL_BYPASS: "queue_first_bypass",
} as const;

export type HumanGovernanceBoundaryId =
  (typeof HumanGovernanceBoundary)[keyof typeof HumanGovernanceBoundary];
