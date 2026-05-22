import type { UserObservationEntry } from "@/lib/agents/user-intelligence/user-observations";

export type CognitiveLoadSignal = {
  type: "panel_overload" | "warning_flood" | "route_bounce" | "abandoned_flow" | "repeated_search" | "overload_detected";
  severity: "low" | "medium" | "high";
  message: string;
  simplifyActions: string[];
};

export function analyzeOperatorCognitiveLoad(
  observations: UserObservationEntry[],
  panelCount = 8,
  warningCount = 0,
): { score: number; signals: CognitiveLoadSignal[]; calmModeRecommended: boolean } {
  const recent = observations.slice(-40);
  const signals: CognitiveLoadSignal[] = [];

  if (panelCount >= 10) {
    signals.push({
      type: "panel_overload",
      severity: "medium",
      message: "Many dashboard panels visible at once.",
      simplifyActions: ["Collapse low-priority sections", "Use focus mode", "Follow top 3 actions only"],
    });
  }

  if (warningCount >= 5) {
    signals.push({
      type: "warning_flood",
      severity: "high",
      message: "Multiple warnings competing for attention.",
      simplifyActions: ["Show executive summary first", "Hide resolved warnings", "Sort by reimbursement impact"],
    });
  }

  const returns = recent.filter((o) => o.event === "user_returned_to_same_page").length;
  if (returns >= 3) {
    signals.push({
      type: "route_bounce",
      severity: "medium",
      message: "Operator returned to the same page repeatedly — possible confusion.",
      simplifyActions: ["Use command palette workflow routing", "Pin current workflow"],
    });
  }

  const abandoned = recent.filter((o) => o.event === "abandoned_flow" || o.event === "flow_abandoned").length;
  if (abandoned >= 2) {
    signals.push({
      type: "abandoned_flow",
      severity: "medium",
      message: "Recent flows were abandoned before completion.",
      simplifyActions: ["Workflow reentry helper", "Surface blockers in executive summary"],
    });
  }

  const overwhelm = recent.filter((o) => o.event === "operator_overwhelm_detected").length;
  if (overwhelm >= 1) {
    signals.push({
      type: "overload_detected",
      severity: "high",
      message: "Overload pattern detected from observations.",
      simplifyActions: ["Enter operator focus mode", "Reduce visible cards to top 3"],
    });
  }

  const noResults = recent.filter((o) => o.event === "no_results_search").length;
  if (noResults >= 2) {
    signals.push({
      type: "repeated_search",
      severity: "low",
      message: "Searches returning no results — navigation friction.",
      simplifyActions: ["Use unified left nav workflow groups", "Try command palette"],
    });
  }

  const score = Math.min(
    100,
    panelCount * 4 +
      warningCount * 6 +
      returns * 8 +
      abandoned * 10 +
      overwhelm * 15 +
      noResults * 4,
  );

  return {
    score,
    signals,
    calmModeRecommended: score >= 55 || signals.some((s) => s.severity === "high"),
  };
}
