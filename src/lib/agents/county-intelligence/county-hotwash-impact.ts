import { loadCountyKpis } from "./county-workbench-adapter";
import { summarizePowerOfFiveForCounty } from "./power-of-five-engine";
import { buildCountyActionPackage } from "./county-action-package-builder";

export type CountyHotWashImpactAnalysis = {
  countySlug: string;
  countyName: string;
  helpedRegistration: "likely" | "unclear" | "unlikely";
  helpedPowerOfFive: "likely" | "unclear" | "unlikely";
  revealedLeaders: boolean;
  recruitedVolunteers: boolean;
  momentumDelta: "up" | "flat" | "down";
  weaknessesSurfaced: string[];
  scheduleAnotherEvent: boolean;
  followUpActions: string[];
  memoryEnrichmentLines: string[];
};

export type CountyHotWashImpactV2 = CountyHotWashImpactAnalysis & {
  goalAdvanced: string;
  powerOfFiveImpact: string;
  volunteerProspects: string;
  leadersIdentified: string;
  scheduleAnotherEventReason: string;
  recommendedNextCountyAction: string;
};

export function analyzeCountyHotWashImpact(input: {
  countyName?: string | null;
  volunteersRecruited?: number;
  leadersIdentified?: number;
  registrationActions?: number;
  relationalContacts?: number;
  attendeeEstimate?: number;
}): CountyHotWashImpactAnalysis | null {
  const slug = input.countyName
    ?.toLowerCase()
    .replace(/\s+county$/i, "")
    .trim()
    .replace(/[^a-z0-9]+/g, "-");
  if (!slug) return null;

  const kpi = loadCountyKpis(slug);
  if (!kpi) return null;

  const p5 = summarizePowerOfFiveForCounty(slug);
  const vol = (input.volunteersRecruited ?? 0) > 0;
  const leaders = (input.leadersIdentified ?? 0) > 0;
  const reg = (input.registrationActions ?? 0) > 0;
  const rel = (input.relationalContacts ?? 0) > 0;

  const helpedRegistration = reg || (input.attendeeEstimate ?? 0) > 20 ? "likely" : "unclear";
  const helpedPowerOfFive = rel || vol ? "likely" : "unclear";

  return {
    countySlug: kpi.countySlug,
    countyName: kpi.countyName,
    helpedRegistration,
    helpedPowerOfFive,
    revealedLeaders: leaders,
    recruitedVolunteers: vol,
    momentumDelta: vol || leaders || reg ? "up" : "flat",
    weaknessesSurfaced: kpi.topWeaknesses.slice(0, 3),
    scheduleAnotherEvent: kpi.countyReadinessScore < 50 || kpi.turnoutRiskScore > 50,
    followUpActions: [
      ...(reg ? ["Log registration outcomes in county memory"] : []),
      ...(rel ? ["Record Power of 5 contacts from this event"] : []),
      "Compare results to countyWorkbench goals before next event",
      ...(kpi.countyReadinessScore < 40 ? ["Schedule follow-up event within 30 days"] : []),
    ],
    memoryEnrichmentLines: [
      `countyWorkbench readiness ${kpi.countyReadinessScore}/100 at time of hot wash`,
      p5?.goal != null ? `Power of 5 planning goal ${p5.goal.toLocaleString()}` : "Power of 5 goal pending governance connection",
      ...kpi.topOpportunities.slice(0, 1),
    ],
  };
}

export function analyzeCountyHotWashImpactV2(input: Parameters<typeof analyzeCountyHotWashImpact>[0]): CountyHotWashImpactV2 | null {
  const base = analyzeCountyHotWashImpact(input);
  if (!base) return null;
  const pkg = buildCountyActionPackage(base.countySlug, "post_event_followup");
  const regGoal = pkg?.topGoals.find((g) => g.includes("Registration")) ?? "County registration goals";
  const p5Goal = pkg?.powerOfFiveTarget ?? "Power of 5 relational target";

  let goalAdvanced = "Unclear — log outcomes in hot wash";
  if (base.helpedRegistration === "likely") goalAdvanced = `Advanced ${regGoal}`;
  if (base.helpedPowerOfFive === "likely") goalAdvanced += base.helpedRegistration === "likely" ? ` and ${p5Goal}` : p5Goal;

  return {
    ...base,
    goalAdvanced,
    powerOfFiveImpact:
      base.helpedPowerOfFive === "likely"
        ? "Event likely added relational contacts — verify in county memory"
        : "Power of 5 impact unclear — capture contacts in hot wash",
    volunteerProspects: base.recruitedVolunteers
      ? "Volunteer prospects identified — route to coordinator"
      : "Recruit follow-up volunteers for next event",
    leadersIdentified: base.revealedLeaders
      ? "Local leaders surfaced — verify before outreach"
      : "No leaders flagged yet — debrief with county lead",
    scheduleAnotherEventReason: base.scheduleAnotherEvent
      ? `Readiness ${loadCountyKpis(base.countySlug)?.countyReadinessScore ?? "low"}/100 — sustain momentum`
      : "Momentum OK — focus on follow-up before scheduling",
    recommendedNextCountyAction:
      pkg?.followUpPlan[0] ?? buildCountyActionPackage(base.countySlug, "county_recovery")?.eventRecommendation ?? "Open county command center",
  };
}
