/**
 * Deterministic orchestration reasoning V1 — diagnosis without LLM.
 */

import type { CampaignState, CampaignBlocker, CampaignOpportunity } from "./campaign-state-types";

export type OrchestrationDiagnosis = {
  headline: string;
  campaignDiagnosis: string;
  topBlockers: CampaignBlocker[];
  topOpportunities: CampaignOpportunity[];
  topRisks: string[];
  workflowRecommendations: string[];
  communicationsNeeds: string[];
  volunteerNeeds: string[];
  countyPriorities: string[];
  trainingGaps: string[];
  toolBuildGaps: string[];
  dashboardSimplifications: string[];
};

export function runOrchestrationReasoning(state: CampaignState): OrchestrationDiagnosis {
  const topBlockers = [...state.activeBlockers]
    .sort((a, b) => (a.severity === "P0" ? 0 : a.severity === "P1" ? 1 : 2) - (b.severity === "P0" ? 0 : b.severity === "P1" ? 1 : 2))
    .slice(0, 5);

  const topOpportunities = state.activeOpportunities.slice(0, 5);
  const topRisks: string[] = [];
  if (state.systemRisk === "high") topRisks.push("System risk elevated — review human gates before any send or calendar write.");
  if (state.reimbursementReadiness.score < 60) topRisks.push("Reimbursement packet may be incomplete for current period.");
  if (state.countyHealth.band === "weak" || state.countyHealth.band === "critical") {
    topRisks.push("County field posture weak — prioritize Power of 5 and event density.");
  }

  const workflowRecommendations: string[] = [];
  if (state.reimbursementReadiness.score < 80) workflowRecommendations.push("close-month-reimbursement");
  if (state.countyHealth.band !== "strong") workflowRecommendations.push("activate-weak-county");
  if (state.volunteerHealth.band !== "strong") workflowRecommendations.push("launch-volunteer-push");
  if (state.eventReadiness.score < 70) workflowRecommendations.push("prepare-county-visit");

  return {
    headline:
      state.overallHealth === "strong"
        ? "Campaign operating rhythm is strong — focus on opportunities."
        : state.overallHealth === "stable"
          ? "Campaign is stable with targeted blockers to clear."
          : "Campaign needs coordinated cross-domain recovery.",
    campaignDiagnosis: `${state.observationSummary} Readiness CM ${state.campaignManagerReadiness}% · ops ${state.operationalReadiness}%.`,
    topBlockers,
    topOpportunities,
    topRisks,
    workflowRecommendations,
    communicationsNeeds: state.communicationActions.length
      ? state.communicationActions.map((a) => a.title)
      : ["Review comms intelligence for follow-up gaps and fatigue."],
    volunteerNeeds: state.volunteerActions.length
      ? state.volunteerActions.map((a) => a.title)
      : ["Balance volunteer workload against open events."],
    countyPriorities: state.countyActions.length
      ? state.countyActions.map((a) => a.title)
      : state.weakDomains.includes("county")
        ? ["Run county gap analysis and Power of 5 outreach."]
        : [],
    trainingGaps: state.trainingActions.length
      ? state.trainingActions.map((a) => a.title)
      : ["Check role training paths for unlock gaps."],
    toolBuildGaps: state.toolBuildActions.length
      ? state.toolBuildActions.map((a) => a.title)
      : ["Review tool-builder queue for friction-derived tickets."],
    dashboardSimplifications:
      state.dashboardHealth.score < 70
        ? ["Reduce dashboard blocks to role-critical modules only."]
        : ["Dashboard posture acceptable — no simplification required."],
  };
}
