/** Mature Events-lane tracker: speaking slots for Kelly (not day-one onboarding). */

export type SpeakingVenueKind =
  | "rotary-civic"
  | "chamber"
  | "dem-club"
  | "county-party"
  | "school-campus"
  | "faith-community"
  | "business"
  | "nonprofit"
  | "issue-focused"
  | "town-hall"
  | "community-forum"
  | "other";

export const SPEAKING_VENUE_LABELS: Record<SpeakingVenueKind, string> = {
  "rotary-civic": "Rotary / civic club",
  chamber: "Chamber meeting",
  "dem-club": "Local Democratic club",
  "county-party": "County party meeting",
  "school-campus": "School / campus group",
  "faith-community": "Faith / community group",
  business: "Business group",
  nonprofit: "Nonprofit",
  "issue-focused": "Issue-focused group",
  "town-hall": "Town hall",
  "community-forum": "Community forum",
  other: "Other",
};

export type SpeakingOpportunityRow = {
  id: string;
  groupName: string;
  venueKind: SpeakingVenueKind;
  contact?: string;
  meetingDate?: string;
  audienceSize?: string;
  speakingFormat?: string;
  kellyRequested?: boolean;
  scheduled?: boolean;
  followUpNeeded?: boolean;
};

export const SPEAKING_OPPORTUNITY_TRACKING_HINTS: string[] = [
  "Rotary / civic clubs",
  "Chamber meetings",
  "Local Democratic clubs",
  "County party meetings",
  "School/campus groups",
  "Faith/community groups",
  "Business groups",
  "Nonprofit groups",
  "Issue-focused groups",
  "Town halls",
  "Community forums",
];

export const MOCK_SPEAKING_OPPORTUNITIES: SpeakingOpportunityRow[] = [
  {
    id: "sp-1",
    groupName: "Sapulpa Rotary Club",
    venueKind: "rotary-civic",
    contact: "Programs chair · example.invalid",
    meetingDate: "First Tuesday · breakfast",
    audienceSize: "~40",
    speakingFormat: "15 min + Q&A",
    kellyRequested: true,
    scheduled: false,
    followUpNeeded: true,
  },
  {
    id: "sp-2",
    groupName: "Creek County Democrats central committee",
    venueKind: "county-party",
    contact: "Chair · example.invalid",
    meetingDate: "Monthly",
    audienceSize: "Varies",
    speakingFormat: "Remarks + meet-and-greet",
    kellyRequested: false,
    scheduled: false,
    followUpNeeded: true,
  },
];
