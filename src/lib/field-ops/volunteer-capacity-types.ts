/**
 * Campaign-operations model: volunteer capacity, logistics, community coverage, and access support.
 * Not a voter-persuasion or demographic-targeting engine — human leadership approves field plans.
 */

export type VolunteerCapacityAssumptions = {
  goodVolunteerWeeklyHours: number;
  housePartyAverageAttendance: number;
  housePartyFollowupMultiplier: number;
  eventVolunteerMinimum: number;
  largeEventVolunteerMinimum: number;
  localGuidePerCountyMinimum: number;
  bilingualSupportThresholdPct: number;
  postcardBatchSizePerVolunteerHour: number;
  phoneBankContactsPerHour: number;
};

export const DEFAULT_VOLUNTEER_CAPACITY_ASSUMPTIONS: VolunteerCapacityAssumptions = {
  goodVolunteerWeeklyHours: 3,
  housePartyAverageAttendance: 10,
  housePartyFollowupMultiplier: 3,
  eventVolunteerMinimum: 2,
  largeEventVolunteerMinimum: 4,
  localGuidePerCountyMinimum: 1,
  bilingualSupportThresholdPct: 5,
  postcardBatchSizePerVolunteerHour: 40,
  phoneBankContactsPerHour: 20,
};

export type HispanicCommunityAccessNeed =
  | "none_known"
  | "monitor"
  | "needs_local_partner"
  | "needs_bilingual_materials";

export type CampusYouthAccessNeed = "none_known" | "monitor" | "needs_partner";

export type SeniorCommunityAccessNeed = "none_known" | "monitor" | "needs_partner";

export type CountyVolunteerCapacityRow = {
  county: string;

  targetVotes?: number;
  targetVoteGain?: number;
  registrationGoal?: number;
  touchCountSinceNov1?: number;
  nextScheduledVisit?: string;
  countyVolunteerNeedWeight?: number;
  countyVolunteerNeedPct?: number;
  countyVolunteerNeedFormula?: string;

  currentVolunteerCount?: number;
  activeVolunteerCount?: number;
  trainedVolunteerCount?: number;
  housePartyHostsKnown?: number;
  localGuidesKnown?: number;
  bilingualSupportKnown?: number;

  eventStaffingNeed: number;
  localGuideNeed: number;
  housePartyHostNeed: number;
  followUpVolunteerNeed: number;
  voterRegistrationEducationNeed: number;
  phoneBankCapacityNeedHours: number;
  postcardCapacityNeedEstimate: number;

  hispanicCommunityAccessNeed: HispanicCommunityAccessNeed;
  languageAccessNotes?: string;
  campusYouthAccessNeed?: CampusYouthAccessNeed;
  seniorCommunityAccessNeed?: SeniorCommunityAccessNeed;

  realisticCountyFundraisingGoal?: number;
  fundraisingConfidence: "high" | "medium" | "low" | "needs_data";
  housePartyFundraisingPotential: "high" | "medium" | "low" | "needs_data";

  confidence: "high" | "medium" | "low";
  missingData: string[];
  staffNextActions: string[];
};

export type VolunteerCapacityModelFile = {
  version: 1;
  generatedAt: string;
  modelNote: string;
  assumptions: VolunteerCapacityAssumptions;
  counties: CountyVolunteerCapacityRow[];
  warnings: string[];
};
