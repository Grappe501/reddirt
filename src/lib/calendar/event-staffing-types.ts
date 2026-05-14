export type EventStaffAssignmentRole =
  | "volunteer_lead"
  | "table_captain"
  | "materials_captain"
  | "photographer_social"
  | "local_host"
  | "county_party_contact"
  | "general_volunteer"
  | "driver"
  | "staff_owner";

export type EventStaffAssignmentStatus =
  | "needed"
  | "invited"
  | "confirmed"
  | "declined"
  | "maybe"
  | "needs_follow_up"
  | "checked_in";

export type EventStaffAssignment = {
  id: string;
  campaignEventId: string;
  personId?: string;
  name?: string;
  email?: string;
  phone?: string;
  role: EventStaffAssignmentRole;
  status: EventStaffAssignmentStatus;
  arrivalTime?: string;
  notes?: string;
};

export type EventStaffingPlan = {
  id: string;
  campaignEventId: string;
  title: string;
  county?: string;
  city?: string;
  volunteerLeadNeeded: boolean;
  volunteerLead?: string;
  assignedVolunteers: EventStaffAssignment[];
  volunteersNeeded: number;
  volunteersConfirmed: number;
  staffingGap: number;
  arrivalTime?: string;
  setupMinutes: number;
  teardownMinutes: number;
  whatToWear: string[];
  whatToBring: string[];
  notes?: string;
  status:
    | "needs_plan"
    | "needs_volunteer_lead"
    | "needs_callout"
    | "partially_staffed"
    | "fully_staffed"
    | "cancelled";
};

export type EventStaffingPlansFile = {
  version: 1;
  generatedAt: string;
  source: "event_coverage_plans";
  stats: {
    total: number;
    needsVolunteerLead: number;
    needsCallout: number;
    fullyStaffed: number;
    totalStaffingGap: number;
  };
  plans: EventStaffingPlan[];
};

export type EventStaffAssignmentsFile = {
  version: 1;
  generatedAt: string;
  source: "event_staffing_plans";
  assignments: EventStaffAssignment[];
};
