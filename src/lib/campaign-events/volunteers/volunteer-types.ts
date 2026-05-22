/** Campaign OS statewide volunteer management V1 (JSON-backed; bridges Prisma when present). */

export type VolunteerConsentStatus = "explicit" | "implied_signup" | "import_review" | "unknown";

export type VolunteerCommunicationPreference = "email" | "sms" | "phone" | "none";

export type VolunteerSkill =
  | "event_setup"
  | "check_in"
  | "literature"
  | "canvassing"
  | "phone_bank"
  | "text_bank"
  | "house_party"
  | "driving"
  | "social_media"
  | "photography"
  | "data_entry"
  | "finance_helper"
  | "hot_wash_notes"
  | "county_organizing"
  | "voter_registration"
  | "power_of_five";

export type VolunteerAvailabilitySlot = {
  day: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
  period: "morning" | "afternoon" | "evening";
};

export type VolunteerProgressLevel =
  | "helper_l1"
  | "event_volunteer_l2"
  | "outreach_volunteer_l3"
  | "team_captain_l4"
  | "county_leader_l5";

export type VolunteerProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  city?: string;
  county?: string;
  zip?: string;
  source: string;
  consentStatus: VolunteerConsentStatus;
  communicationPreferences: VolunteerCommunicationPreference[];
  skills: VolunteerSkill[];
  interests: string[];
  availability: VolunteerAvailabilitySlot[];
  preferredTasks: string[];
  trainingCompleted: string[];
  trainingNeeded: string[];
  assignedEvents: string[];
  assignedTasks: string[];
  reliabilityScore: number;
  leadershipPotential: "low" | "medium" | "high";
  progressLevel: VolunteerProgressLevel;
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type VolunteerTeam = {
  id: string;
  name: string;
  county?: string;
  slug?: string;
  memberIds: string[];
  captainVolunteerId?: string;
  createdAt: string;
};

export type VolunteerAssignmentStatus = "recommended" | "accepted" | "declined" | "completed" | "no_show";

export type VolunteerAssignment = {
  id: string;
  volunteerId: string;
  eventRecordId: string;
  role: string;
  status: VolunteerAssignmentStatus;
  recommendedBy: "ai" | "operator";
  humanApproved: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type VolunteerTrainingRecord = {
  volunteerId: string;
  moduleId: string;
  status: "not_started" | "in_progress" | "completed";
  startedAt?: string;
  completedAt?: string;
};

export type VolunteerObservation = {
  id: string;
  volunteerId?: string;
  event: string;
  at: string;
  actor: string;
  meta?: Record<string, string | number | boolean | null>;
};

export type VolunteerImportBatch = {
  id: string;
  source: string;
  rowCount: number;
  status: "pending" | "review" | "committed";
  createdAt: string;
};

export type VolunteersStore = {
  version: 1;
  profiles: VolunteerProfile[];
  teams: VolunteerTeam[];
  assignments: VolunteerAssignment[];
  training: VolunteerTrainingRecord[];
  observations: VolunteerObservation[];
  imports: VolunteerImportBatch[];
};

export type VolunteerCommunicationDraft = {
  id: string;
  volunteerId: string;
  workflowType:
    | "welcome"
    | "training_reminder"
    | "event_assignment"
    | "event_reminder"
    | "thank_you"
    | "urgent_need"
    | "power_of_five"
    | "county_ask"
    | "leadership_ask";
  subject: string;
  body: string;
  humanApprovalRequired: true;
  consentWarning?: string;
  suppressionChecked: boolean;
  createdAt: string;
};
