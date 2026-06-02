import type { CountyNormalizedKpi } from "./county-kpi-types";

/** Human-readable registration goal line — never conflates vote targets with registration goals. */
export function formatRegistrationGoalLabel(kpi: CountyNormalizedKpi): string {
  if (kpi.canonicalRegistrationGoal != null) {
    return `Campaign registration goal (canonical DB): ${kpi.canonicalRegistrationGoal.toLocaleString()}`;
  }
  if (kpi.canonicalRegistrationGoalStatus === "not_set") {
    return "Campaign registration goal: not set in admin — verify before field use";
  }
  if (kpi.canonicalRegistrationGoalStatus === "db_unavailable") {
    return "Campaign registration goal: unverified (database unavailable in this context)";
  }
  return "Campaign registration goal: unverified — set in /admin/counties/[slug]";
}

export function formatVoteTargetLabel(kpi: CountyNormalizedKpi): string {
  if (kpi.planningVoteTargetProxy != null) {
    return `Planning vote target (2022 Gov share proxy): ${kpi.planningVoteTargetProxy.toLocaleString()} — NOT a registration goal`;
  }
  return "Planning vote target: not connected";
}

export function registrationGoalWarning(kpi: CountyNormalizedKpi): string | null {
  if (kpi.canonicalRegistrationGoal == null && kpi.planningVoteTargetProxy != null) {
    return "WARNING: Only planning vote-target proxy available — do not treat as registration goal.";
  }
  if (kpi.canonicalRegistrationGoalStatus === "not_set") {
    return "WARNING: Canonical registration goal not set in CountyCampaignStats.";
  }
  return null;
}
