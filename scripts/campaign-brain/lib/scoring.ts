/**
 * Campaign Brain scoring models — event, Kelly time, faith engagement proxy.
 */

import type { CommunityEvent, OpportunityCounty, VciCounty } from "./inputs";

export type EventScore = {
  eventId: string;
  title: string;
  county: string;
  type: string;
  overallScore: number;
  components: {
    vciWeight: number;
    registrationOpportunity: number;
    lane2Opportunity: number;
    lane4Opportunity: number;
    mediaOpportunity: number;
    fundraisingOpportunity: number;
    clerkOpportunity: number;
    calendarQuality: number;
  };
  laneImpact: { lane2: number; lane3: number; lane4: number };
  recommendedAttendance: "YES" | "MAYBE" | "NO";
  candidate: "Kelly" | "Surrogate" | "Volunteer lead" | "County chair" | "Digital only";
  suggestedDurationHours: number;
  kellyTimeScore: number;
  verificationStatus: string;
};

export type KellyAttendance = EventScore["candidate"];

export function scoreEvent(
  event: CommunityEvent,
  opp: OpportunityCounty | undefined,
  vci: VciCounty | undefined,
  cityInfluence: number,
  maxVci: number,
  maxRecovery: number,
  maxReg: number,
  maxRep: number,
): EventScore {
  const recovery = opp?.dropOffRecovery50 ?? 0;
  const reg = opp?.registrationGoal ?? 0;
  const rep = opp?.republicanConversionPotential ?? 0;
  const countyVci = vci?.vci ?? 0;

  const vciWeight = Math.round((countyVci / maxVci) * 30);
  const lane2Opportunity = Math.round((recovery / maxRecovery) * 15);
  const registrationOpportunity = Math.round((reg / maxReg) * 15);
  const lane4Opportunity = Math.round((rep / maxRep) * 15);

  const tags = event.audienceTags ?? [];
  let mediaOpportunity = 0;
  if (tags.includes("persuasion")) mediaOpportunity += 4;
  if (event.campaignValue === "high_value") mediaOpportunity += 6;
  if (event.recommendedCoverage === "kelly") mediaOpportunity += 5;
  mediaOpportunity = Math.min(12, mediaOpportunity);

  const fundraisingOpportunity =
    opp?.tier === "A" && cityInfluence >= 5000 ? 8 : opp?.tier === "B" ? 4 : 2;

  let clerkOpportunity = 5;
  if (event.type === "county_fair") clerkOpportunity = 12;
  if (event.title.toLowerCase().includes("clerk")) clerkOpportunity = 15;

  const calendarQuality = Math.round(((event.score?.total ?? 20) / 50) * 10);

  const overallScore = Math.min(
    100,
    vciWeight +
      registrationOpportunity +
      lane2Opportunity +
      lane4Opportunity +
      mediaOpportunity +
      fundraisingOpportunity +
      clerkOpportunity +
      calendarQuality,
  );

  const laneImpact = {
    lane2: Math.round((lane2Opportunity / 15) * 10),
    lane3: Math.round((registrationOpportunity / 15) * 10),
    lane4: Math.round((lane4Opportunity / 15) * 10),
  };

  const kellyTimeScore = Math.min(
    100,
    Math.round(
      overallScore * 0.45 +
        (countyVci / maxVci) * 25 +
        mediaOpportunity * 2 +
        lane4Opportunity * 1.5 +
        clerkOpportunity * 1.2,
    ),
  );

  const candidate = kellyAttendanceFromScore(kellyTimeScore, overallScore, event.recommendedCoverage);

  const recommendedAttendance: EventScore["recommendedAttendance"] =
    overallScore >= 55 ? "YES" : overallScore >= 35 ? "MAYBE" : "NO";

  const suggestedDurationHours =
    candidate === "Kelly" ? 3 : candidate === "Surrogate" ? 2 : candidate === "Volunteer lead" ? 2 : 1;

  return {
    eventId: event.id,
    title: event.title,
    county: event.county,
    type: event.type,
    overallScore,
    components: {
      vciWeight,
      registrationOpportunity,
      lane2Opportunity,
      lane4Opportunity,
      mediaOpportunity,
      fundraisingOpportunity,
      clerkOpportunity,
      calendarQuality,
    },
    laneImpact,
    recommendedAttendance,
    candidate,
    suggestedDurationHours,
    kellyTimeScore,
    verificationStatus: event.verificationStatus ?? "unknown",
  };
}

export function kellyAttendanceFromScore(
  kellyTimeScore: number,
  overallScore: number,
  recommendedCoverage?: string,
): KellyAttendance {
  if (recommendedCoverage === "kelly" && kellyTimeScore >= 60) return "Kelly";
  if (kellyTimeScore >= 78) return "Kelly";
  if (kellyTimeScore >= 58) return "Surrogate";
  if (kellyTimeScore >= 42 || overallScore >= 50) return "Volunteer lead";
  if (kellyTimeScore >= 28) return "County chair";
  return "Digital only";
}

/** Faith Engagement Index proxy (0–100) until church-count ingest. */
export function faithEngagementIndex(
  county: string,
  opp: OpportunityCounty | undefined,
  population2020: number,
  maxPop: number,
): number {
  const popScore = (population2020 / maxPop) * 35;
  const tierBonus = opp?.tier === "A" ? 15 : opp?.tier === "B" ? 10 : opp?.tier === "C" ? 6 : 3;
  const regScore = ((opp?.registrationGoal ?? 0) / 10_584) * 20;
  const deltaFaithCounties = new Set([
    "Jefferson",
    "Phillips",
    "Lee",
    "St. Francis",
    "Crittenden",
    "Mississippi",
    "Desha",
    "Dallas",
    "Arkansas",
    "Chicot",
    "Pulaski",
  ]);
  const interfaithBonus = deltaFaithCounties.has(county) ? 12 : 6;
  const recoveryBonus = ((opp?.dropOffRecovery50 ?? 0) / 11_241) * 18;

  return Math.min(100, Math.round(popScore + tierBonus + regScore + interfaithBonus + recoveryBonus));
}

export function priorityLabel(remaining: number, potential: number): "HIGH" | "MEDIUM" | "LOW" {
  const ratio = potential > 0 ? remaining / potential : 0;
  if (ratio >= 0.75 && remaining >= 20_000) return "HIGH";
  if (ratio >= 0.4 || remaining >= 10_000) return "MEDIUM";
  return "LOW";
}
