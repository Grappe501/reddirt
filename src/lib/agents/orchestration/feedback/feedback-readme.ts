export const ORCHESTRATION_FEEDBACK_LOOP_README = {
  id: "orchestration_feedback_loop",
  phase: "3B",
  purpose:
    "Capture human outcomes and lesson approvals so the AI learns which recommendations worked, failed, were ignored, or need correction.",
  storage: {
    recommendationOutcomes: "data/campaign-events/orchestration-feedback/recommendation-outcomes.json",
    lessonApprovals: "data/campaign-events/orchestration-feedback/lesson-approvals.json",
  },
  routes: {
    feedback: "/api/agents/orchestration-feedback",
    lessonApprovals: "/api/agents/lesson-approvals",
  },
  safety: [
    "Feedback routes write only feedback/approval JSON stores",
    "No send/SMS/calendar/finance/export execution",
    "Strategic or sensitive lessons require human reviewer before promotion",
    "Feedback creates observations and lessons for knowledge graph, not autonomous actions",
  ],
} as const;
