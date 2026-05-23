/**
 * Deterministic orchestration reasoning V1 — diagnosis without LLM.
 */

import type {
  CampaignState,
  CampaignBlocker,
  CampaignOpportunity,
  CampaignDomainId,
  CampaignHealthBand,
} from "./campaign-state-types";

export type OrchestrationTopMove = {
  rank: number;
  title: string;
  whyThisMatters: string;
  route?: string;
  urgency: "P0" | "P1" | "P2";
  domainId: CampaignDomainId;
  confidence: "high" | "medium" | "low";
};

export type OrchestrationDomainDiagnosis = {
  domainId: CampaignDomainId;
  summary: string;
  band: CampaignHealthBand;
  score: number;
};

export type OrchestrationDiagnosis = {
  headline: string;
  executiveSummary: string;
  campaignDiagnosis: string;
  confidenceLevel: "high" | "medium" | "low";
  topBlockers: CampaignBlocker[];
  topOpportunities: CampaignOpportunity[];
  topRisks: string[];
  topMoves: OrchestrationTopMove[];
  perDomainDiagnosis: OrchestrationDomainDiagnosis[];
  workflowRecommendations: string[];
  communicationsNeeds: string[];
  volunteerNeeds: string[];
  countyPriorities: string[];
  trainingGaps: string[];
  toolBuildGaps: string[];
  dashboardSimplifications: string[];
};

function severityRank(s: CampaignBlocker["severity"]): number {
  return s === "P0" ? 0 : s === "P1" ? 1 : 2;
}

export function runOrchestrationReasoning(state: CampaignState): OrchestrationDiagnosis {
  const topBlockers = [...state.activeBlockers].sort((a, b) => severityRank(a.severity) - severityRank(b.severity)).slice(0, 8);

  const topOpportunities = state.activeOpportunities.slice(0, 5);
  const topRisks: string[] = [];

  if (state.systemRisk === "high") {
    topRisks.push("System risk elevated — review human gates before any send or calendar write.");
  }
  if (state.reimbursementReadiness.score < 60) {
    topRisks.push("Reimbursement packet may be incomplete for current period.");
  }
  if (state.countyHealth.band === "weak" || state.countyHealth.band === "critical") {
    topRisks.push("County field posture weak — prioritize Power of 5 and event density.");
  }
  if (state.commsReadiness.massEmailBlocked === false) {
    topRisks.push("Mass email guard not confirmed blocked — verify ECC gates before any broadcast.");
  }
  if (state.calendarEventPressure.syncStale) {
    topRisks.push("Calendar sync stale — event truth may diverge from operator expectations.");
  }
  if (state.financeComplianceWarnings.length > 0) {
    topRisks.push(state.financeComplianceWarnings[0]);
  }

  const workflowRecommendations: string[] = ["campaign-manager-daily"];

  if (state.reimbursementReadiness.score < 80 || state.reimbursementReadiness.band !== "strong") {
    workflowRecommendations.push("close-month-reimbursement");
  }
  if (state.countyHealth.band !== "strong" || state.countyIntelligenceSummary.weakCountyCount > 0) {
    workflowRecommendations.push("activate-weak-county");
  }
  if (state.volunteerHealth.band !== "strong" || state.commsReadiness.volunteerAtRisk > 0) {
    workflowRecommendations.push("launch-volunteer-push");
  }
  if (state.eventReadiness.score < 75 || state.calendarEventPressure.pendingApprovals > 0) {
    workflowRecommendations.push("prepare-county-visit");
  }
  if (state.domainStatuses.host.score < 65) {
    workflowRecommendations.push("run-house-party-program");
  }

  const topMoves: OrchestrationTopMove[] = [];
  const addMove = (title: string, why: string, route: string | undefined, urgency: OrchestrationTopMove["urgency"], domainId: CampaignDomainId) => {
    if (topMoves.length >= 3) return;
    topMoves.push({
      rank: topMoves.length + 1,
      title,
      whyThisMatters: why,
      route,
      urgency,
      domainId,
      confidence: state.confidenceLevel,
    });
  };

  for (const b of topBlockers.filter((x) => x.severity === "P0" || x.severity === "P1").slice(0, 2)) {
    const relatedGap = state.knowledge.knowledgeGaps.find((g) => g.domains.includes(b.domainId));
    const why = relatedGap
      ? `${relatedGap.summary} — clearing this blocker restores cross-domain rhythm.`
      : "Clearing this blocker restores cross-domain operating rhythm.";
    addMove(b.message, why, b.suggestedRoute, b.severity, b.domainId);
  }
  for (const a of state.urgentActions.slice(0, 1)) {
    addMove(a.title, "OS control flagged this as urgent for the current period.", a.route, a.priority, a.domainId);
  }
  for (const c of state.countyActions.slice(0, 1)) {
    addMove(c.title, "County intelligence recommends statewide field attention here.", c.route, "P1", "county");
  }
  for (const c of state.communicationActions.slice(0, 1)) {
    addMove(c.title, "Communications graph shows follow-up or fatigue risk without action.", c.route, "P1", "communications");
  }
  if (topMoves.length < 3 && state.calendarEventPressure.pendingApprovals > 0) {
    addMove(
      `Clear ${state.calendarEventPressure.pendingApprovals} pending approval(s)`,
      "Held approvals block event readiness and downstream volunteer/comms planning.",
      "/admin/campaign-events/review",
      "P1",
      "approvals",
    );
  }

  for (const gap of state.knowledge.knowledgeGaps.slice(0, 1)) {
    if (topMoves.length >= 3) break;
    addMove(
      gap.title,
      gap.whyItMatters,
      gap.domains.includes("county") ? "/admin/county-intelligence" : "/admin/orchestration",
      "P1",
      gap.domains[0] ?? "campaign_management",
    );
  }

  for (const lesson of state.knowledge.recurringBlockers.slice(0, 1)) {
    if (topMoves.length >= 3) break;
    addMove(
      lesson.title,
      lesson.whyItMatters,
      "/admin/orchestration",
      "P1",
      lesson.domains[0] ?? "campaign_management",
    );
  }

  if (state.knowledge.graphHealth.missingSources.length > 0 && topMoves.length < 3) {
    addMove(
      `Restore degraded signal sources (${state.knowledge.graphHealth.missingSources.length})`,
      state.knowledge.knowledgeGaps[0]?.summary ?? "Knowledge graph has blind spots from missing sources.",
      "/admin/orchestration",
      "P1",
      "campaign_management",
    );
  }

  const perDomainDiagnosis: OrchestrationDomainDiagnosis[] = Object.values(state.domainStatuses).map((d) => ({
    domainId: d.domainId,
    summary: d.summary,
    band: d.band,
    score: d.score,
  }));

  if (topMoves.length < 3 && state.agentTooling?.bestNextToolForCampaignState) {
    const best = state.agentTooling.bestNextToolForCampaignState;
    addMove(
      `Run tool: ${best.title}`,
      best.whyNow,
      undefined,
      best.urgency,
      best.domain,
    );
  }

  const executiveSummary = [
    state.executiveSummary,
    topBlockers.length ? `${topBlockers.length} active blocker(s).` : "No P0/P1 blockers.",
    state.knowledge.graphHealth.lessonCount ? `${state.knowledge.graphHealth.lessonCount} campaign lesson(s) in memory.` : "",
    topMoves.length ? `Top move: ${topMoves[0].title}.` : "Review workflow recommendations.",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    headline:
      state.overallHealth === "strong"
        ? "Campaign operating rhythm is strong — focus on opportunities."
        : state.overallHealth === "stable"
          ? "Campaign is stable with targeted blockers to clear."
          : "Campaign needs coordinated cross-domain recovery.",
    executiveSummary,
    campaignDiagnosis: `${state.observationSummary} CM readiness ${state.campaignManagerReadiness}% · ops ${state.operationalReadiness}% · mode ${state.operatingMode}.`,
    confidenceLevel: state.confidenceLevel,
    topBlockers,
    topOpportunities,
    topRisks,
    topMoves: topMoves.slice(0, 3),
    perDomainDiagnosis,
    workflowRecommendations: [...new Set(workflowRecommendations)],
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
