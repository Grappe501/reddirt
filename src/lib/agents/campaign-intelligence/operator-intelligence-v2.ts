import { analyzeOperatorCognitiveLoad } from "@/lib/dashboard-orchestration/operator-cognitive-load-analyzer";
import { buildWorkflowRouterV1 } from "@/lib/dashboard-orchestration/workflow-router-v1";
import type { UserObservationEntry } from "@/lib/agents/user-intelligence/user-observations";
import type { CampaignEventsDashboardSnapshot } from "@/lib/campaign-events/load-campaign-events-dashboard";

export type OperatorIntelligenceV2 = {
  fatigueScore: number;
  fatigueDetected: boolean;
  specializationHint: string;
  predictedWorkflows: { title: string; href: string }[];
  explanationDepth: "executive" | "standard" | "detailed";
  executiveBriefing: string;
  dailyStrategicBriefing: string;
  proactiveSuggestions: string[];
};

export function buildOperatorIntelligenceV2(input: {
  observations: UserObservationEntry[];
  pathname: string;
  period: string;
  snapshot?: CampaignEventsDashboardSnapshot | null;
  strategicNarrative?: string;
}): OperatorIntelligenceV2 {
  const load = analyzeOperatorCognitiveLoad(input.observations, 8, input.snapshot?.pendingApprovals ?? 0);
  const routes = buildWorkflowRouterV1({
    pathname: input.pathname,
    period: input.period,
    snapshot: input.snapshot,
    observations: input.observations,
  });

  const paletteUses = input.observations.filter((o) => o.event === "ai_command_palette_used").length;
  const reimburseViews = input.observations.filter((o) => o.pathname?.includes("reimbursement")).length;
  const reviewViews = input.observations.filter((o) => o.pathname?.includes("review")).length;

  let specializationHint = "General operator — route via command palette";
  if (reimburseViews > reviewViews && reimburseViews >= 2) specializationHint = "Treasurer-leaning — emphasize finance surfaces";
  else if (reviewViews >= 2) specializationHint = "Approval-leaning — emphasize month review";
  else if (paletteUses >= 3) specializationHint = "AI-first operator — keep executive summaries concise";

  const explanationDepth: OperatorIntelligenceV2["explanationDepth"] = load.calmModeRecommended
    ? "executive"
    : load.score >= 40
      ? "standard"
      : "detailed";

  const executiveBriefing = [
    input.strategicNarrative ?? "Campaign operating picture loading.",
    load.calmModeRecommended ? "Operator fatigue elevated — use focus mode and top 3 actions only." : "Operator load manageable.",
    `Next: ${routes[0]?.title ?? "AI command center"}.`,
  ].join(" ");

  const dailyStrategicBriefing = [
    `## Daily briefing · ${input.period}`,
    executiveBriefing,
    ...routes.slice(0, 3).map((r, i) => `${i + 1}. ${r.title} — ${r.why}`),
  ].join("\n");

  return {
    fatigueScore: load.score,
    fatigueDetected: load.calmModeRecommended,
    specializationHint,
    predictedWorkflows: routes.slice(0, 3).map((r) => ({ title: r.title, href: r.href })),
    explanationDepth,
    executiveBriefing,
    dailyStrategicBriefing,
    proactiveSuggestions: load.signals.flatMap((s) => s.simplifyActions).slice(0, 5),
  };
}
