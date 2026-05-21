import type { UserObservationEntry, UserUxObservationEvent } from "../user-intelligence/user-observations";

export type AgentMemoryType =
  | "user_preference"
  | "writing_style"
  | "county_pattern"
  | "host_pattern"
  | "venue_pattern"
  | "workflow_friction"
  | "campaign_strategy"
  | "reimbursement_correction"
  | "approval_timing";

export type MemoryWritePlan = {
  memoryCandidate: boolean;
  memoryType: AgentMemoryType | null;
  riskLevel: "low" | "medium" | "high";
  requiresHumanReview: boolean;
  suggestedStorageTarget: string;
  reason: string;
};

const LOW_RISK_EVENTS: UserUxObservationEvent[] = [
  "suggestion_accepted",
  "help_hover_opened",
  "user_collapsed_section",
  "user_expanded_section",
];

const HIGH_RISK_EVENTS: UserUxObservationEvent[] = [
  "approval_decision_made",
  "field_overridden",
  "promotion_attempted",
];

export function planMemoryWrite(input: {
  observation: UserObservationEntry;
  eventRecordId?: string | null;
  countyLabel?: string | null;
  decisionOutcome?: string | null;
}): MemoryWritePlan {
  const { observation: o } = input;
  const ev = o.event;

  if (HIGH_RISK_EVENTS.includes(ev)) {
    return {
      memoryCandidate: true,
      memoryType: ev === "approval_decision_made" ? "approval_timing" : "workflow_friction",
      riskLevel: "high",
      requiresHumanReview: true,
      suggestedStorageTarget: "factCard._aiObservations + operator review queue",
      reason: "High-impact operator decision — never auto-persist without review.",
    };
  }

  if (ev === "suggestion_accepted" && o.toolId?.includes("writing")) {
    return {
      memoryCandidate: true,
      memoryType: "writing_style",
      riskLevel: "low",
      requiresHumanReview: false,
      suggestedStorageTarget: "data/campaign-events/writing-style-observations.json",
      reason: "Accepted writing suggestion — metadata-only style log.",
    };
  }

  if (ev === "field_overridden" || ev === "correction_started") {
    return {
      memoryCandidate: true,
      memoryType: pathnameIncludesTravel(o) ? "reimbursement_correction" : "workflow_friction",
      riskLevel: "medium",
      requiresHumanReview: true,
      suggestedStorageTarget: "data/campaign-events/user-observations.json (pending review)",
      reason: "Field correction pattern may inform future assists.",
    };
  }

  if ((ev === "flow_abandoned" || ev === "abandoned_flow") && o.pathname?.includes("review")) {
    return {
      memoryCandidate: true,
      memoryType: "workflow_friction",
      riskLevel: "medium",
      requiresHumanReview: true,
      suggestedStorageTarget: "operator memory review (future)",
      reason: "Abandoned review queue — UX friction signal.",
    };
  }

  if (input.countyLabel && (ev === "dashboard_card_clicked" || ev === "drilldown_opened")) {
    return {
      memoryCandidate: true,
      memoryType: "county_pattern",
      riskLevel: "low",
      requiresHumanReview: true,
      suggestedStorageTarget: "county workbench bridge notes (future)",
      reason: "County navigation pattern — no PII.",
    };
  }

  if (LOW_RISK_EVENTS.includes(ev)) {
    return {
      memoryCandidate: true,
      memoryType: ev === "suggestion_accepted" ? "user_preference" : "user_preference",
      riskLevel: "low",
      requiresHumanReview: ev !== "suggestion_accepted",
      suggestedStorageTarget: "data/campaign-events/user-observations.json",
      reason: "Low-risk preference signal.",
    };
  }

  return {
    memoryCandidate: false,
    memoryType: null,
    riskLevel: "low",
    requiresHumanReview: false,
    suggestedStorageTarget: "—",
    reason: "Routine telemetry — observation log only.",
  };
}

function pathnameIncludesTravel(o: UserObservationEntry): boolean {
  return Boolean(o.pathname?.includes("travel") || o.pathname?.includes("reimburse"));
}

export function buildMemoryCandidatesFromObservations(
  observations: UserObservationEntry[],
  limit = 8,
): MemoryWritePlan[] {
  return observations
    .slice(-40)
    .map((observation) => planMemoryWrite({ observation }))
    .filter((p) => p.memoryCandidate)
    .slice(-limit);
}
