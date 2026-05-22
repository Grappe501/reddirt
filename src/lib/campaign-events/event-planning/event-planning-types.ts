export type RunOfShowRowStatus = "planned" | "confirmed" | "done" | "skipped";

export type RunOfShowRow = {
  id: string;
  time: string;
  action: string;
  owner: string;
  location: string;
  materials: string;
  notes: string;
  status: RunOfShowRowStatus;
};

export type PackItemStatus = "needed" | "packed" | "not_needed";

export type PackListItemKey =
  | "literature"
  | "signs"
  | "banner"
  | "tablecloth"
  | "donation_qr"
  | "volunteer_signup"
  | "speech_notes"
  | "special_attire"
  | "weather_gear"
  | "custom";

export type PackListItem = {
  id: string;
  key: PackListItemKey;
  label: string;
  status: PackItemStatus;
  notes?: string;
};

export type VolunteerPlan = {
  volunteersNeeded: string;
  numberNeeded: string;
  roles: string;
  volunteerCaptain: string;
  arrivalTime: string;
  meetupLocation: string;
  reminderStatus: string;
};

export type EventContacts = {
  host: string;
  hostPhone: string;
  venue: string;
  campaignPointPerson: string;
  volunteerCaptain: string;
  candidateHandler: string;
  mediaContact: string;
  emergencyContact: string;
};

export type CandidateBrief = {
  summary: string;
  talkingPoints: string;
  peopleToKnow: string;
  strategicPurpose: string;
  travelNotes: string;
  timingNotes: string;
  risks: string;
  generatedAt?: string;
};

export type CampaignManagerBrief = {
  logisticsSummary: string;
  missingItems: string;
  ownerAssignments: string;
  deadlines: string;
  risks: string;
  nextActions: string;
  generatedAt?: string;
};

export type EventBudget = {
  estimatedCosts: string;
  actualCosts: string;
  reimbursementNotes: string;
  receiptsPlaceholder: string;
  notes: string;
};

export type EventPlanningSectionId =
  | "overview"
  | "run_of_show"
  | "materials"
  | "volunteers"
  | "contacts"
  | "candidate_brief"
  | "cm_brief"
  | "budget";

export type EventPlanningData = {
  runOfShow: RunOfShowRow[];
  packList: PackListItem[];
  volunteerPlan: VolunteerPlan;
  contacts: EventContacts;
  candidateBrief: CandidateBrief;
  cmBrief: CampaignManagerBrief;
  budget: EventBudget;
  sectionCompleted: Partial<Record<EventPlanningSectionId, boolean>>;
  updatedAt?: string;
};

export type PlanningReadinessResult = {
  scorePercent: number;
  bandLabel: string;
  blockers: string[];
  missing: string[];
  nextRecommendations: string[];
};
