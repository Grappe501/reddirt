/** Phase 16 — Voter Contact & GOTV Operating System types. */

export type VoterContactTrackId = "lane2Reactivation" | "lane3Registration" | "lane4Persuasion";

export type HumanContactIndexComponents = {
  phoneCalls: number;
  postcards: number;
  doorsKnocked: number;
  housePartyAttendees: number;
  powerOf5Conversations: number;
  volunteerRecruits: number;
  eventAttendees: number;
};

export type HumanContactIndex = {
  total: number;
  components: HumanContactIndexComponents;
  /** Planning heartbeat target for final 20 weeks — leadership adjusts. */
  goal: number;
  completionPct: number;
};

export type Lane2Track = {
  contacted: number;
  engaged: number;
  committed: number;
  turnoutTarget: number;
  completionPct: number;
};

export type Lane3Track = {
  registrationsStarted: number;
  registrationsCompleted: number;
  registrationEvents: number;
  volunteerRegistrars: number;
  goal: number;
  completionPct: number;
};

export type Lane4Track = {
  conversations: number;
  followUps: number;
  eventAttendance: number;
  endorsementsGenerated: number;
};

export type VoterContactFunnel = {
  volunteersActive: number;
  voterContacts: number;
  commitments: number;
  turnoutTargets: number;
};

export type ChannelDashboard = {
  id: string;
  label: string;
  primaryMetric: number;
  goal: number;
  completionPct: number;
  detail: string;
};

export type VoterContactSummary = {
  version: number;
  generatedAt: string;
  heroLine: string;
  doctrine: string;
  humanContactIndex: HumanContactIndex;
  tracks: {
    lane2Reactivation: Lane2Track;
    lane3Registration: Lane3Track;
    lane4Persuasion: Lane4Track;
  };
  funnel: VoterContactFunnel;
  channels: ChannelDashboard[];
};
