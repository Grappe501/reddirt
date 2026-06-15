/** Phase 14 — Coalition, Labor & Power Map Activation types. */

export type CoalitionPowerMapSummary = {
  version: number;
  generatedAt: string;
  heroLine: string;
  naacp: {
    branchesTotal: number;
    called: number;
    meetingsRequested: number;
    speakingScheduled: number;
  };
  aea: {
    countiesActive: number;
    teacherSupporters: number;
    meetingsCompleted: number;
  };
  muslim: {
    contactsTotal: number;
    meetingsOpen: number;
    meetingsRequested: number;
  };
  hispanic: {
    frameworkStatus: string;
    lead: string;
    pendingJasmineReview: boolean;
  };
  labor: {
    unionsTotal: number;
    contacted: number;
    meetingsCompleted: number;
    endorsementsInProgress: number;
  };
  electedOfficials: {
    contacted: number;
    total: number;
    meetingsCompleted: number;
    introductionsRequested: number;
  };
  candidates: {
    activePartnerships: number;
    sharedEvents: number;
    jointMobilize: number;
  };
  pastOfficials: {
    engaged: number;
    total: number;
  };
  sherwood: {
    goal: string;
    vipTablesSold: number;
    vipTablesGoal: number;
    ticketsSold: number;
    status: string;
    onTrack: boolean;
  };
  cityForums: {
    planned: number;
    booked: number;
    total: number;
    fortSmithBooked: boolean;
  };
  ruralTownhalls: {
    planned: number;
    total: number;
  };
};
