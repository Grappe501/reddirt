/**
 * Campaign Impact Score — strategy scores the calendar, not the other way around.
 *
 * County components (100 pts base):
 *   VCI 30% · Lane 2 20% · Registration 15% · GOP 15% · Coverage 10% · Attendance 10%
 */

import { ARKANSAS_COUNTY_POPULATION_2020 } from "../../strategic-plan/data/arkansas-top-40-cities";
import { faithEngagementIndex } from "./scoring";
import type { CommunityEvent, OpportunityCounty, VciCounty } from "./inputs";
import { coverageBonusPoints, coverageNeedScore, type CountyCoverageRow } from "./county-coverage";
import { assignCandidate, detectRoutingFlags, type CampaignAssignee, type RoutingFlags } from "./candidate-routing";
import { classifyCounty, ruralBonusPoints, RURAL_MULTIPLIER, type RuralClass } from "./rural-classification";
import {
  effectiveOpportunityScore,
  type EventVerificationRecord,
  type EventVerificationStatus,
} from "./event-verification";

export type CampaignImpactScore = {
  eventId: string;
  title: string;
  county: string;
  type: string;
  date: string | null;
  dateStatus: "verified" | "tentative" | "historical" | "missing";
  campaignImpactScore: number;
  verificationConfidence: number;
  effectiveScore: number;
  baseScore: number;
  components: {
    countyVci: number;
    lane2Recovery: number;
    registrationGoal: number;
    gopConversion: number;
    countyCoverageNeed: number;
    eventAttendance: number;
  };
  multipliers: {
    ruralStrategy: number;
    ruralBonusPoints: number;
    coverageBonus: number;
  };
  ruralClass: RuralClass;
  assignment: CampaignAssignee;
  assignmentReason: string;
  flags: RoutingFlags;
  verificationStatus: string;
  verification: EventVerificationStatus;
};

function norm(value: number, max: number, weight: number): number {
  if (max <= 0) return 0;
  return Math.round((value / max) * weight);
}

function eventAttendanceScore(event: CommunityEvent): number {
  const type = event.type;
  const calendar = event.score?.total ?? 0;

  if (calendar > 0) return Math.min(10, Math.round((calendar / 110) * 10));

  const typeDefaults: Record<string, number> = {
    county_fair: 9,
    festival: 8,
    chamber: 6,
    rotary: 6,
    lions: 5,
    farm_bureau: 7,
    faith: 7,
    campus_event: 7,
    high_school_football: 8,
    aea_meeting: 6,
  };
  return typeDefaults[type] ?? 5;
}

export function computeCampaignImpactScore(
  event: CommunityEvent,
  opp: OpportunityCounty | undefined,
  vci: VciCounty | undefined,
  coverage: CountyCoverageRow | undefined,
  cityInfluence: number,
  faithIdx: number,
  clerkMeetings: number,
  maxVci: number,
  maxRecovery: number,
  maxReg: number,
  maxRep: number,
  maxPop: number,
  verification: EventVerificationRecord,
): CampaignImpactScore {
  const county = event.county;
  const pop = ARKANSAS_COUNTY_POPULATION_2020[county] ?? 10_000;
  const ruralClass = classifyCounty(county, pop);
  const daysSince = coverage?.daysSinceVisit ?? null;

  const components = {
    countyVci: norm(vci?.vci ?? 0, maxVci, 30),
    lane2Recovery: norm(opp?.dropOffRecovery50 ?? 0, maxRecovery, 20),
    registrationGoal: norm(opp?.registrationGoal ?? 0, maxReg, 15),
    gopConversion: norm(opp?.republicanConversionPotential ?? 0, maxRep, 15),
    countyCoverageNeed: coverageNeedScore(daysSince),
    eventAttendance: eventAttendanceScore(event),
  };

  const baseScore = Object.values(components).reduce((s, v) => s + v, 0);
  const ruralBonus = ruralBonusPoints(ruralClass, event.type, event.title);
  const covBonus = coverageBonusPoints(daysSince);
  const ruralMult = RURAL_MULTIPLIER[ruralClass];

  const campaignImpactScore = Math.min(
    100,
    Math.round((baseScore + ruralBonus + covBonus) * ruralMult),
  );
  const effectiveScore = effectiveOpportunityScore(campaignImpactScore, verification.confidence);

  const flags = detectRoutingFlags({
    eventType: event.type,
    title: event.title,
    county,
    ruralClass,
    tags: event.audienceTags ?? [],
    tier: opp?.tier,
    registrationGoal: opp?.registrationGoal ?? 0,
    maxReg,
    gopPotential: opp?.republicanConversionPotential ?? 0,
    maxGop: maxRep,
    faithIndex: faithIdx,
    cityInfluence,
    clerkMeetings,
  });

  const { assignment, reason } = assignCandidate(campaignImpactScore, flags, ruralClass);

  return {
    eventId: event.id,
    title: event.title,
    county,
    type: event.type,
    date: verification.eventDate,
    dateStatus: verification.status,
    campaignImpactScore,
    verificationConfidence: verification.confidence,
    effectiveScore,
    baseScore,
    components,
    multipliers: {
      ruralStrategy: ruralMult,
      ruralBonusPoints: ruralBonus,
      coverageBonus: covBonus,
    },
    ruralClass,
    assignment,
    assignmentReason: reason,
    flags,
    verificationStatus: event.verificationStatus ?? "unknown",
    verification: verification.status,
  };
}

export function buildFaithIndexByCounty(
  oppMap: Map<string, OpportunityCounty>,
  maxPop: number,
): Map<string, number> {
  const map = new Map<string, number>();
  for (const [county, opp] of oppMap) {
    const pop = ARKANSAS_COUNTY_POPULATION_2020[county] ?? 10_000;
    map.set(county, faithEngagementIndex(county, opp, pop, maxPop));
  }
  return map;
}
