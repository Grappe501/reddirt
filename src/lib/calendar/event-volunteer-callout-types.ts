import type { EventStaffAssignmentRole } from "@/lib/calendar/event-staffing-types";

export type EventVolunteerCallout = {
  id: string;
  campaignEventId: string;
  event: {
    title: string;
    dateTime?: string;
    location?: string;
  };
  county?: string;
  city?: string;
  suggestedRadiusMiles: number;
  volunteersNeeded: number;
  rolesNeeded: EventStaffAssignmentRole[];
  suggestedAudience:
    | "assigned_volunteers"
    | "opted_in_volunteers"
    | "county_volunteers"
    | "local_guides"
    | "house_party_hosts"
    | "staff_test";
  status:
    | "draft"
    | "needs_approval"
    | "approved"
    | "sent";
  messagePurpose:
    | "volunteer_signup"
    | "event_reminder"
    | "staffing_gap"
    | "table_coverage"
    | "local_coverage";
  recommendedSendAt?: string;
  complianceGate: {
    emailOptInRequired: boolean;
    unsubscribeRequired: boolean;
    suppressionCheckRequired: boolean;
    smsDisabled: true;
    humanApprovalRequired: true;
  };
  humanApprovalRequired: true;
  draftSubject?: string;
  draftBody?: string;
  staffNotes?: string;
};

export type EventVolunteerCalloutsFile = {
  version: 1;
  generatedAt: string;
  source: "event_coverage_plans";
  callouts: EventVolunteerCallout[];
};
