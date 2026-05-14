export type GotvCommitmentAllocationAssumptions = {
  statewideCommitmentGoal: number;
  relationalPowerOfFive: number;
  housePartyAverageAttendance: number;
  usableCommitmentRateFromHouseParty: number;
  phoneBankContactsPerHour: number;
  postcardBatchPerVolunteerHour: number;
  textConversationsPerVolunteerHour: number;
  minimumPerCounty: number;
  priorityCountyMinimum: number;
  highOpportunityCountyMinimum: number;
};

export const DEFAULT_GOTV_COMMITMENT_ASSUMPTIONS: GotvCommitmentAllocationAssumptions = {
  statewideCommitmentGoal: 5000,
  relationalPowerOfFive: 5,
  housePartyAverageAttendance: 10,
  usableCommitmentRateFromHouseParty: 0.5,
  phoneBankContactsPerHour: 20,
  postcardBatchPerVolunteerHour: 40,
  textConversationsPerVolunteerHour: 60,
  minimumPerCounty: 10,
  priorityCountyMinimum: 25,
  highOpportunityCountyMinimum: 50,
};

export type GotvCommitmentAllocationRow = {
  county: string;
  volunteerCommitmentTarget: number;
  currentCommitments?: number;
  commitmentGap: number;

  targetVotes?: number;
  targetVoteGain?: number;
  registrationGoal?: number;
  turnoutHeadroom?: number;
  opportunityLoadScore: number;
  localInfrastructureGapScore: number;
  accessSupportNeedScore: number;
  countyVolunteerNeedWeight: number;
  countyVolunteerNeedPct: number;
  countyVolunteerNeedFormula: string;

  housePartyGoal: number;
  estimatedRelationalCoverage: number;
  phoneBankCapacityHours: number;
  postcardCapacityEstimate: number;
  textVolunteerCapacityHours: number;

  eventStaffingNeed: number;
  localGuideNeed: number;
  followUpVolunteerNeed: number;

  fundraisingSupportGoal?: number;
  confidence: "high" | "medium" | "low";
  missingData: string[];
  staffNextActions: string[];
};

export type GotvCommitmentAllocationFile = {
  version: 1;
  generatedAt: string;
  modelNote: string;
  commitmentMessage: "I commit to help 5 people make a plan to vote.";
  assumptions: GotvCommitmentAllocationAssumptions;
  statewide: {
    commitmentGoal: number;
    currentCommitments: number;
    commitmentGap: number;
    estimatedRelationalCoverage: number;
  };
  counties: GotvCommitmentAllocationRow[];
  warnings: string[];
};
