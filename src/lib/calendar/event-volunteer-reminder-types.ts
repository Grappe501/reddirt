export type EventVolunteerReminder = {
  id: string;
  campaignEventId: string;
  staffAssignmentId?: string;
  channel: "email";
  event: {
    title: string;
    dateTime?: string;
    location?: string;
    arrivalTime?: string;
    pointOfContact?: string;
  };
  timing:
    | "on_assignment"
    | "one_week_before"
    | "72_hours_before"
    | "day_before"
    | "morning_of"
    | "post_event";
  status:
    | "draft"
    | "needs_approval"
    | "approved"
    | "sent"
    | "cancelled";
  subject: string;
  body: string;
  materialsIncluded: {
    pushCards: boolean;
    fans: boolean;
    brandedMints: boolean;
    tablecloth: boolean;
    pullUpBanner: boolean;
  };
  includes: {
    arrivalTime: boolean;
    location: boolean;
    whatToWear: boolean;
    whatToBring: boolean;
    contactPerson: boolean;
    parkingNotes: boolean;
    weatherNotes: boolean;
    postEventUploadLink: boolean;
  };
  humanApprovalRequired: true;
};

export type EventVolunteerRemindersFile = {
  version: 1;
  generatedAt: string;
  source: "event_staff_assignments";
  reminders: EventVolunteerReminder[];
};
