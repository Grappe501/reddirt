import source from "../../../data/campaign-brain/fundraising-tracker.json";

export type FundraisingTracker = {
  version: number;
  asOf: string;
  networkGoal: number;
  networkGoalLabel: string;
  workingCampaignGoal: number;
  workingCampaignGoalLabel: string;
  combinedGoal: number;
  raised: number;
  raisedProvisional: boolean;
  raisedNote: string;
  rampUpNote: string;
};

export type WarRoomFundraisingFields = {
  fundraisingRaised: number;
  fundraisingGoal: number;
  fundraisingNote: string;
  fundraisingNetworkGoal?: number;
  fundraisingWorkingCampaignGoal?: number;
  fundraisingCombinedGoal?: number;
  fundraisingRaisedProvisional?: boolean;
  fundraisingRaisedNote?: string;
};

export type FundraisingProgressView = {
  raised: number;
  networkGoal: number;
  workingCampaignGoal: number;
  combinedGoal: number;
  networkPct: number;
  combinedPct: number;
  raisedProvisional: boolean;
  raisedNote: string;
  note: string;
};

const tracker = source as FundraisingTracker;

export function getFundraisingTracker(): FundraisingTracker {
  return tracker;
}

export function buildWarRoomFundraisingFromTracker(): WarRoomFundraisingFields {
  const t = getFundraisingTracker();
  return {
    fundraisingRaised: t.raised,
    fundraisingGoal: t.combinedGoal,
    fundraisingNetworkGoal: t.networkGoal,
    fundraisingWorkingCampaignGoal: t.workingCampaignGoal,
    fundraisingCombinedGoal: t.combinedGoal,
    fundraisingRaisedProvisional: t.raisedProvisional,
    fundraisingRaisedNote: t.raisedNote,
    fundraisingNote: t.rampUpNote,
  };
}

export function fundraisingProgressView(w: WarRoomFundraisingFields): FundraisingProgressView {
  const networkGoal = w.fundraisingNetworkGoal ?? tracker.networkGoal;
  const workingCampaignGoal = w.fundraisingWorkingCampaignGoal ?? tracker.workingCampaignGoal;
  const combinedGoal = w.fundraisingCombinedGoal ?? w.fundraisingGoal ?? networkGoal + workingCampaignGoal;
  const raised = w.fundraisingRaised;

  return {
    raised,
    networkGoal,
    workingCampaignGoal,
    combinedGoal,
    networkPct: networkGoal > 0 ? Math.min(100, (raised / networkGoal) * 100) : 0,
    combinedPct: combinedGoal > 0 ? Math.min(100, (raised / combinedGoal) * 100) : 0,
    raisedProvisional: w.fundraisingRaisedProvisional ?? tracker.raisedProvisional,
    raisedNote: w.fundraisingRaisedNote ?? tracker.raisedNote,
    note: w.fundraisingNote,
  };
}
