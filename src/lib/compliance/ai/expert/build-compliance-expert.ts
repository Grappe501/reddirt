import {
  buildComplianceBrainSnapshot,
  buildComplianceNextActions,
  buildComplianceRiskReport,
} from "../brain/build-compliance-brain";
import { UNSAFE_COMPLIANCE_ACTIONS } from "../brain/compliance-brain-types";
import type { ComplianceExpertSnapshot } from "./compliance-expert-types";
import { buildCompletionProgress } from "./build-completion-progress";
import {
  buildFilingCoach,
  buildOperatorCoach,
  buildReconciliationCoach,
  buildRuleCoach,
} from "./build-coaches";

export async function buildComplianceExpertSnapshot(
  brainSnapshot?: Awaited<ReturnType<typeof buildComplianceBrainSnapshot>>,
): Promise<ComplianceExpertSnapshot> {
  const snapshot = brainSnapshot ?? (await buildComplianceBrainSnapshot());
  const nextActions = buildComplianceNextActions(snapshot);
  const risks = buildComplianceRiskReport(snapshot);
  const progress = buildCompletionProgress(snapshot);
  const operatorCoach = buildOperatorCoach(snapshot);

  const blockerExplanations = snapshot.filing.blockers.map((b) => ({
    id: b.id,
    plainEnglish: `${b.label}: ${b.count} item(s) affected.`,
    whyItBlocks: `Filing stays red until: ${b.greenCondition}`,
    howToClear: b.operatorFixableToday ? `Operator can fix today via ${b.href}` : "Needs Steve/tech or external source.",
    automatable: false,
    owner: b.operatorFixableToday ? "operator" : "steve",
  }));

  const whatWouldMakeFilingGreen = [
    ...snapshot.filing.blockers.map((b) => b.greenCondition),
    "Compliance officer human sign-off (not legal certification)",
    "All hard gates pass in source-backed workflow",
  ];

  const whatWouldImproveLaunch = progress.areas
    .filter((a) => a.launchCriticality === "critical" && a.percentComplete < 100)
    .slice(0, 6)
    .map((a) => `${a.area}: ${a.completionActions[0] ?? "complete area"}`);

  return {
    generatedAt: snapshot.generatedAt,
    commitBase: snapshot.commitBase,
    launchOverall: snapshot.launchReadiness.overall,
    launchReadinessScore: snapshot.launchReadiness.launchReadinessScore,
    top5Now: nextActions.slice(0, 5),
    top5Risks: risks.filter((r) => r.severity === "critical" || r.severity === "high").slice(0, 5),
    nextBestWorkflow: operatorCoach.summary,
    blockerExplanations,
    canAutomate: [
      "Regenerate brain/expert snapshots",
      "Run QA scripts and surface results",
      "Suggest next-best queue item",
      "Bank CSV schema diagnostics (when file present)",
      "Redacted burn-down exports",
    ],
    needsHumanReview: [
      "Every approval decision with initials",
      "Rule topic review on Rules page",
      "Ambiguous bank matches",
      "Filing export and legal reliance",
      "Override reasons when blockers present",
    ],
    needsSourceEvidence: [
      "bank-april-2026.csv",
      "Receipt/check/in-kind images",
      "GoodChange CSV",
      "Official Arkansas rule sources (human-linked)",
    ],
    needsSteveApproval: [
      "DB migration cutover",
      "Production Supabase bucket + RLS verification",
      "Netlify secrets configuration",
    ],
    mustNotDo: [...UNSAFE_COMPLIANCE_ACTIONS],
    whatWouldMakeFilingGreen,
    whatWouldImproveLaunch,
    operatorCoachSummary: operatorCoach.summary,
    recommendedNextHumanAction: snapshot.recommendedNextHumanAction,
    recommendedNextAiAction: "Run compliance:ai-expert and guide operator through operator-coach steps; never auto-approve.",
  };
}

export async function buildComplianceExpertBundle() {
  const brain = await buildComplianceBrainSnapshot();
  const expert = await buildComplianceExpertSnapshot(brain);
  const progress = buildCompletionProgress(brain);
  const operatorCoach = buildOperatorCoach(brain);
  const filingCoach = buildFilingCoach(brain);
  const ruleCoach = buildRuleCoach(brain);
  const reconciliationCoach = buildReconciliationCoach(brain);
  return { brain, expert, progress, operatorCoach, filingCoach, ruleCoach, reconciliationCoach };
}
