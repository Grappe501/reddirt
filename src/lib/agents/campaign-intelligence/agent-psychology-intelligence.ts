import type { UserObservationEntry } from "@/lib/agents/user-intelligence/user-observations";
import type { CognitiveLoadSignal } from "@/lib/dashboard-orchestration/operator-cognitive-load-analyzer";

export type AgentPsychologyAssessment = {
  overwhelmRisk: "low" | "medium" | "high";
  hesitationSignals: number;
  abandonmentSignals: number;
  confidenceLevel: "high" | "medium" | "low";
  operatorConfidenceLine: string;
  uxAdjustments: string[];
};

export function analyzeAgentPsychology(
  observations: UserObservationEntry[],
  cognitiveLoad: { score: number; signals: CognitiveLoadSignal[]; calmModeRecommended: boolean },
): AgentPsychologyAssessment {
  const recent = observations.slice(-40);
  const hesitation = recent.filter(
    (o) => o.event === "user_returned_to_same_page" || o.event === "no_results_search" || o.event === "help_hover_opened",
  ).length;
  const abandonment = recent.filter((o) => o.event === "abandoned_flow" || o.event === "flow_abandoned").length;
  const overwhelm = recent.filter((o) => o.event === "operator_overwhelm_detected" || o.event === "operator_fatigue_detected").length;

  const overwhelmRisk: AgentPsychologyAssessment["overwhelmRisk"] =
    cognitiveLoad.calmModeRecommended || overwhelm >= 2 ? "high" : cognitiveLoad.score >= 45 ? "medium" : "low";

  const confidenceLevel: AgentPsychologyAssessment["confidenceLevel"] =
    abandonment >= 3 || hesitation >= 5 ? "low" : hesitation >= 2 ? "medium" : "high";

  const uxAdjustments: string[] = [];
  if (overwhelmRisk === "high") uxAdjustments.push("Collapse secondary panels", "Executive summary only", "Shorter AI copy");
  if (hesitation >= 3) uxAdjustments.push("Pin current workflow in nav", "Add command palette prompt chips");
  if (abandonment >= 2) uxAdjustments.push("Workflow reentry links in guidance cards");

  return {
    overwhelmRisk,
    hesitationSignals: hesitation,
    abandonmentSignals: abandonment,
    confidenceLevel,
    operatorConfidenceLine:
      confidenceLevel === "high"
        ? "Operator appears confident — standard guidance depth OK."
        : confidenceLevel === "medium"
          ? "Some hesitation detected — simplify next step copy."
          : "Low confidence signals — use executive mode and single CTA.",
    uxAdjustments,
  };
}
