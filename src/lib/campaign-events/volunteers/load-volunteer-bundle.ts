import { composeCountyDashboardContext } from "@/lib/agents/county-intelligence/county-intelligence-engine";
import { buildPowerOfFiveBriefing } from "@/lib/agents/county-intelligence/power-of-five-engine";
import { detectRetentionRisk, detectLeadershipPotential } from "./volunteer-scoring";
import { VOLUNTEER_TRAINING_MODULES } from "./volunteer-training-modules";
import { loadVolunteersStore } from "./volunteer-storage";

export type VolunteerSystemBundle = {
  volunteerCount: number;
  trainingGaps: number;
  countyCoverageGaps: string[];
  eventStaffingGaps: number;
  leadershipProspects: number;
  followUpNeeded: number;
  retentionRisks: number;
  recommendedActions: string[];
  powerOfFiveSummary: string;
  modulesAvailable: number;
};

export function loadVolunteerSystemBundle(): VolunteerSystemBundle {
  const store = loadVolunteersStore();
  const profiles = store.profiles;
  const trainingGaps = profiles.filter((p) => p.trainingNeeded.length > 0 && p.trainingCompleted.length < 2).length;
  const leadershipProspects = profiles.filter((p) => detectLeadershipPotential(p) === "high").length;
  const followUpNeeded = profiles.filter((p) => p.assignedEvents.length === 0 && p.consentStatus !== "unknown").length;
  const retentionRisks = profiles.filter((p) => detectRetentionRisk(p) !== "low").length;

  const countyState = composeCountyDashboardContext();
  const countyCoverageGaps = countyState.counties
    .filter((c) => {
      const volGap = (c.volunteerGoal ?? 0) - (c.volunteerCurrent ?? 0);
      const p5Gap = (c.powerOfFiveGoal ?? 0) - (c.powerOfFiveCurrent ?? 0);
      return volGap > 0 || p5Gap > 0 || c.topWeaknesses.length > 0;
    })
    .map((c) => c.countyName)
    .slice(0, 8);

  const eventStaffingGaps = store.assignments.filter((a) => a.status === "recommended").length;
  const p5 = buildPowerOfFiveBriefing();

  const recommendedActions: string[] = [];
  if (profiles.length === 0) recommendedActions.push("Import or add volunteers in Volunteer Command Center");
  if (trainingGaps > 0) recommendedActions.push(`Review training gaps (${trainingGaps} volunteers)`);
  if (countyCoverageGaps.length > 0) recommendedActions.push(`County coverage: ${countyCoverageGaps.slice(0, 3).join(", ")}`);
  if (retentionRisks > 0) recommendedActions.push(`Retention follow-up needed (${retentionRisks})`);
  recommendedActions.push("All outbound volunteer messages require human approval");

  return {
    volunteerCount: profiles.length,
    trainingGaps,
    countyCoverageGaps,
    eventStaffingGaps,
    leadershipProspects,
    followUpNeeded,
    retentionRisks,
    recommendedActions: recommendedActions.slice(0, 6),
    powerOfFiveSummary: p5.narrative.slice(0, 120),
    modulesAvailable: VOLUNTEER_TRAINING_MODULES.length,
  };
}
