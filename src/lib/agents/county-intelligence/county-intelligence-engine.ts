import {
  listCountyWorkbenchCounties,
  loadCountyKpis,
  loadStatewideCountySummary,
} from "./county-workbench-adapter";
import type {
  CountyActionPlan,
  CountyIntelligenceSummary,
  CountyNormalizedKpi,
  StatewideCountyIntelligence,
} from "./county-kpi-types";

export function buildCountyIntelligenceSummary(countySlug: string): CountyIntelligenceSummary | null {
  const county = loadCountyKpis(countySlug);
  if (!county) return null;

  return {
    county,
    whyHere: [
      `Campaign event in ${county.countyName} — align to county registration and relational goals.`,
      county.topOpportunities[0] ? `Opportunity: ${county.topOpportunities[0]}` : "Build county opportunity narrative from hot wash.",
      county.goalSource === "planning-estimate"
        ? "Goals use planning-estimate proxy until governance sheet connects in countyWorkbench."
        : "Verify goals in countyWorkbench intelligence tab before paid media.",
    ],
    eventGoals: [
      county.registrationGoal != null ? `Advance registration planning target (~${county.registrationGoal.toLocaleString()} contacts)` : "Clarify registration goal with county lead",
      county.powerOfFiveGoal != null ? `Power of 5 relational goal ~${county.powerOfFiveGoal.toLocaleString()}` : "Set relational targets with field manager",
      "Capture leader names and volunteer signups in hot wash",
    ],
    outreachFocus: [
      "House parties and community gatherings in verified venues",
      "Lawful voter registration assistance where trained",
      "Follow up with hosts within 48 hours",
    ],
    followUpActions: county.recommendedActions,
    kellyTalkingPoints: [
      `Why ${county.countyName}: ${county.topOpportunities[0] ?? "expand organizing footprint"}`,
      county.topWeaknesses[0] ? `Address gap: ${county.topWeaknesses[0]}` : "Listen first — county-specific concerns",
      "Close with concrete ask: volunteer shift, host, or registration action",
    ],
    recruitTargets: [
      "County volunteers for check-in and photos",
      "Host helpers for follow-up calls",
      county.fieldStrengthScore >= 40 ? "County leader from workbench profile" : "Identify local leader — verify before outreach",
    ],
  };
}

export function buildCountyActionPlan(countySlug: string): CountyActionPlan | null {
  const county = loadCountyKpis(countySlug);
  if (!county) return null;

  const priority: CountyActionPlan["priority"] =
    county.countyReadinessScore < 25 ? "critical" : county.countyReadinessScore < 45 ? "high" : county.countyReadinessScore < 65 ? "medium" : "low";

  return {
    countySlug: county.countySlug,
    countyName: county.countyName,
    priority,
    actions: county.recommendedActions,
    eventRecommendations: [
      county.eventGoal != null ? `Plan up to ${county.eventGoal} events this quarter` : "Set event cadence with CM",
      "Prioritize population centers with connected profiles",
    ],
    powerOfFiveRecommendations: [
      county.powerOfFiveGoal != null
        ? `Close Power of 5 gap toward ${county.powerOfFiveGoal.toLocaleString()} relational contacts`
        : "Define Power of 5 county target with field manager",
    ],
    volunteerRecommendations: [
      county.volunteerGoal != null ? `Recruit toward ${county.volunteerGoal} active volunteers` : "Staff volunteer coordinator shift",
    ],
    fieldManagerNotes: [
      `Readiness ${county.countyReadinessScore}/100 · Field strength ${county.fieldStrengthScore}/100`,
      ...county.topWeaknesses.slice(0, 2),
    ],
  };
}

export function rankCountyPriorities(): CountyNormalizedKpi[] {
  return listCountyWorkbenchCounties()
    .map((c) => loadCountyKpis(c.countySlug))
    .filter((k): k is CountyNormalizedKpi => k != null)
    .sort((a, b) => {
      const scoreA = 100 - a.countyReadinessScore + a.turnoutRiskScore * 0.4;
      const scoreB = 100 - b.countyReadinessScore + b.turnoutRiskScore * 0.4;
      return scoreB - scoreA;
    });
}

export function identifyWeakCounties(limit = 10): CountyNormalizedKpi[] {
  return rankCountyPriorities()
    .filter((c) => c.countyReadinessScore < 40 || c.topWeaknesses.length >= 2)
    .slice(0, limit);
}

export function identifyMomentumCounties(limit = 10): CountyNormalizedKpi[] {
  return [...rankCountyPriorities()]
    .sort((a, b) => b.fieldStrengthScore + b.persuasionOpportunityScore - (a.fieldStrengthScore + a.persuasionOpportunityScore))
    .slice(0, limit);
}

export function buildStatewideCountyHeatList() {
  return loadStatewideCountySummary().heatList;
}

export function composeCountyDashboardContext(): StatewideCountyIntelligence {
  return loadStatewideCountySummary();
}

export function recommendCountyEventsForPeriod(_period: string, limit = 8): { countySlug: string; countyName: string; reason: string }[] {
  return identifyWeakCounties(limit).map((c) => ({
    countySlug: c.countySlug,
    countyName: c.countyName,
    reason: c.topWeaknesses[0] ?? "Low readiness — event can build capacity",
  }));
}
