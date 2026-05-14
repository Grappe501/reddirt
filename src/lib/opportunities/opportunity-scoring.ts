import type { CommunityOpportunity, OpportunityScore } from "@/lib/opportunities/community-opportunity-types";

const DEMOCRATIC_BASE_TAGS = new Set(["democratic_base", "teachers", "labor"] as const);
const PERSUASION_TAGS = new Set(["persuasion", "families", "civic_leaders"] as const);

export function scoreOpportunity(o: CommunityOpportunity): OpportunityScore {
  let baseValue = 0;
  switch (o.campaignValue) {
    case "must_attend":
      baseValue = 100;
      break;
    case "high_value":
      baseValue = 75;
      break;
    case "good_add_on":
      baseValue = 50;
      break;
    case "send_local":
      baseValue = 25;
      break;
    case "monitor":
      baseValue = 10;
      break;
    default:
      baseValue = 20;
  }

  const underTouchedCountyBoost = o.routeCluster?.includes("priority") ? 12 : o.notes?.includes("under-touched") ? 15 : 0;
  const fewOpportunitiesBoost = o.verificationStatus === "date_not_posted" ? 5 : 0;
  const democraticTurnoutGapBoost = o.audienceTags.some((t) => DEMOCRATIC_BASE_TAGS.has(t as "democratic_base")) ? 8 : 0;
  const persuasionUpsideBoost = o.audienceTags.some((t) => PERSUASION_TAGS.has(t as "persuasion")) ? 10 : 0;
  const routeEfficiencyBoost = o.routeCluster ? 6 : 0;
  const localHostBoost = o.recommendedCoverage === "kelly_plus_local_host" ? 10 : o.recommendedCoverage === "local_surrogate" ? 4 : 0;
  const countySeatAddOnBoost = o.type === "county_fair" || o.type === "district_fair" ? 8 : 0;
  const teacherAudienceBoost = o.audienceTags.includes("teachers") ? 12 : 0;
  const campusYouthBoost = o.type === "campus_event" || o.audienceTags.includes("students") ? 10 : 0;
  const rivalryCrowdBoost = o.type === "high_school_football" ? 14 : 0;

  let conflictPenalty = 0;
  if (o.verificationStatus === "duplicate") conflictPenalty += 40;
  if (o.verificationStatus === "needs_confirmation") conflictPenalty += 8;
  if (o.verificationStatus === "not_relevant") conflictPenalty += 80;

  const travelPenalty = 0;

  const total =
    baseValue +
    underTouchedCountyBoost +
    fewOpportunitiesBoost +
    democraticTurnoutGapBoost +
    persuasionUpsideBoost +
    routeEfficiencyBoost +
    localHostBoost +
    countySeatAddOnBoost +
    teacherAudienceBoost +
    campusYouthBoost +
    rivalryCrowdBoost -
    conflictPenalty -
    travelPenalty;

  return {
    baseValue,
    underTouchedCountyBoost,
    fewOpportunitiesBoost,
    democraticTurnoutGapBoost,
    persuasionUpsideBoost,
    routeEfficiencyBoost,
    localHostBoost,
    countySeatAddOnBoost,
    teacherAudienceBoost,
    campusYouthBoost,
    rivalryCrowdBoost,
    conflictPenalty,
    travelPenalty,
    total,
  };
}
