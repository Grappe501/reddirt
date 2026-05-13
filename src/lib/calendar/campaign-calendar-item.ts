/**
 * Normalized travel / campaign calendar contract (Kelly SOS command center).
 * Used by spreadsheet reconcile exports and `/admin/calendar-command-center`.
 */

export type CampaignCalendarSource =
  | "google_calendar"
  | "spreadsheet"
  | "burt_database"
  | "dpa_county_party"
  | "manual";

export type CampaignCalendarEventType =
  | "county_party_meeting"
  | "fair_festival"
  | "campaign_event"
  | "community_event"
  | "fundraiser"
  | "media"
  | "travel"
  | "overnight"
  | "personal_admin"
  | "virtual_statewide";

export type CampaignCalendarStatus =
  | "confirmed"
  | "tentative"
  | "needs_verification"
  | "recommended"
  | "conflict"
  | "declined";

export type CampaignCalendarPublishStatus =
  | "private_admin_only"
  | "candidate_visible"
  | "ready_for_public_review"
  | "published";

export type CampaignPriorityTier = "Tier 1" | "Tier 2" | "Backseat filler";

export type CampaignCalendarItem = {
  id: string;
  source: CampaignCalendarSource;
  sourceId?: string;
  title: string;
  start: string;
  end?: string;
  allDay: boolean;
  county?: string;
  city?: string;
  location?: string;
  eventType: CampaignCalendarEventType;
  calendarStatus: CampaignCalendarStatus;
  publishStatus: CampaignCalendarPublishStatus;
  countyTouchCounts: boolean;
  priorityTier?: CampaignPriorityTier;
  routeCluster?: string;
  overnightRequired?: boolean;
  overnightCity?: string;
  verificationConfidence: number;
  notes?: string;
  /** When true, row is kept in workbook JSON but omitted from Kelly mobile cockpit bundle (dedupe / superseded imports). */
  excludeFromKellyCockpit?: boolean;
  /** Spreadsheet / ingest extras (host, Kelly role, etc.) */
  drillDown?: {
    /** When true, Tuesday Little Rock daytime rule is treated as waived for this item (admin-flagged). */
    plannedTuesdayWorkException?: boolean;
    /** Admin cockpit only — never surface on public properties. */
    adminLocalGuide?: {
      displayName: string;
      phone?: string;
      notes?: string;
    };
    kellyRole?: string;
    host?: string;
    contacts?: string;
    anchorClassification?: string;
    travelRequirement?: string;
    spreadsheetTab?: string;
    rowHint?: string;
    matchedDb?: {
      kind: "CampaignEvent" | "ArkansasFestivalIngest" | "GoogleCalendarEventRecord";
      id: string;
      matchReason?: string;
    };
  };
};

export type CountyPrioritySnapshotRow = {
  county: string;
  strategicClass?: string;
  pastTouchesSinceNov1: number;
  lastTouch?: string;
  scheduledFutureAnchors?: number;
  nextScheduledAnchor?: string;
  priorityScore?: number;
  tier?: string;
  notes?: string;
  underTouched?: boolean;
  fewOpportunities?: boolean;
  recommendedTierLabel?: CampaignPriorityTier;
};

export type FestivalLeadVerifiedRow = {
  id: string;
  date?: string;
  eventName: string;
  county?: string;
  source?: string;
  spreadsheetNotes?: string;
  reconcileStatus:
    | "verified_in_burt_db"
    | "calendar_only_lead"
    | "web_supplemental_lead"
    | "duplicate"
    | "needs_confirmation"
    | "not_campaign_relevant";
  matchedFestivalIngestId?: string;
  matchConfidence?: number;
};

export type CountyMeetingTentativeRow = {
  county: string;
  meetingStatus?: string;
  observedCalendarNotes?: string;
  calendarPriority?: string;
  tentativeMonthlyDate?: string;
  sourceNextAction?: string;
  meetingCadence?: string;
  nextMeetingBeforeJuly4?: string;
  location?: string;
  contactSource?: string;
  confidence: number;
  kellyAttendance?: "kelly" | "surrogate_volunteer" | "undecided";
  verification: "tentative_placeholder" | "needs_dpa_confirmation" | "partial_from_calendar";
};
