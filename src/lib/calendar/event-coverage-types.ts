export type CampaignEventCoverageMode =
  | "kelly_attends"
  | "kelly_attends_plus_volunteers"
  | "local_volunteer_coverage"
  | "county_party_surrogate"
  | "table_if_possible"
  | "materials_drop"
  | "staff_followup_only"
  | "monitor_only"
  | "no_coverage"
  | "needs_decision";

export type CampaignEventCoveragePlan = {
  id: string;
  campaignEventId: string;
  calendarItemId?: string;
  county?: string;
  city?: string;

  coverageMode: CampaignEventCoverageMode;
  candidateDecision: "confirmed" | "declined" | "hold" | "needs_kelly_decision" | "not_requested";

  volunteerLeadNeeded: boolean;
  volunteerLeadName?: string;
  localHostNeeded: boolean;
  localHostName?: string;

  volunteersNeeded: number;
  shirtsNeeded: number;
  tableNeeded: boolean;
  tableStatus: "not_needed" | "needs_permission" | "permission_requested" | "approved" | "not_allowed" | "unknown";

  materials: {
    pushCards: number;
    fans: number;
    stickers?: number;
    signupSheets?: number;
    voterRegistrationForms?: number;
    yardSigns?: number;
  };

  logistics: {
    arrivalTime?: string;
    setupMinutes: number;
    teardownMinutes: number;
    parkingKnown: boolean;
    boothFee?: number;
    electricityNeeded?: boolean;
    weatherRisk?: "low" | "medium" | "high" | "unknown";
  };

  followUp: {
    photosNeeded: boolean;
    contactCollectionNeeded: boolean;
    postEventNotesNeeded: boolean;
    thankYouNeeded: boolean;
    uploadFolderNeeded: boolean;
  };

  status:
    | "needs_decision"
    | "needs_staff_call"
    | "needs_volunteer_lead"
    | "ready"
    | "covered"
    | "cancelled"
    | "not_covering";

  staffNextActions: string[];
  notes?: string;
};

export type EventCoveragePlansFile = {
  version: 1;
  generatedAt: string;
  source: "campaign_event_db";
  stats: {
    total: number;
    needsLocalCoverage: number;
    needsVolunteerLead: number;
    needsTablePermission: number;
    ready: number;
    notCovering: number;
    materials: {
      pushCards: number;
      fans: number;
      shirts: number;
    };
  };
  plans: CampaignEventCoveragePlan[];
};

export type EventCoveragePlanToolOutput = {
  eventId: string;
  recommendedCoverageMode: CampaignEventCoverageMode;
  reason: string;
  volunteersNeeded: number;
  materialsNeeded: {
    pushCards: number;
    fans: number;
    shirts: number;
  };
  tablingRecommendation: "table_if_possible" | "ask_permission" | "not_needed" | "not_appropriate" | "unknown";
  staffNextActions: string[];
  humanDecisionRequired: boolean;
};
