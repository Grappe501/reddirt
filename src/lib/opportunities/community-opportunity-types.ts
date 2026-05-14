/** Statewide “where should Kelly be?” opportunity graph (file-staged; no DB writes). */

export type CommunityOpportunityType =
  | "county_fair"
  | "district_fair"
  | "extension_homemakers"
  | "aea_meeting"
  | "retired_teachers"
  | "campus_event"
  | "high_school_football"
  | "county_party_meeting"
  | "rotary_civic"
  | "chamber_event"
  | "festival"
  | "parade"
  | "house_party"
  | "courthouse_clerk_stop"
  | "local_media"
  | "other_big_gathering";

export type CommunityOpportunitySourceType =
  | "burt_database"
  | "official_site"
  | "county_extension"
  | "school_athletics"
  | "aaa_ahsaa"
  | "aea"
  | "retired_teachers"
  | "campus_calendar"
  | "facebook"
  | "chamber"
  | "tourism"
  | "manual";

export type CommunityOpportunityVerificationStatus =
  | "verified_2026"
  | "likely_2026"
  | "date_not_posted"
  | "needs_confirmation"
  | "duplicate"
  | "not_relevant";

export type CommunityOpportunityCampaignValue = "must_attend" | "high_value" | "good_add_on" | "send_local" | "monitor";

export type CommunityOpportunityRecommendedCoverage =
  | "kelly"
  | "kelly_plus_local_host"
  | "local_surrogate"
  | "staff_only"
  | "press_only";

export type CommunityAudienceTag =
  | "families"
  | "teachers"
  | "retirees"
  | "students"
  | "farm_ag"
  | "labor"
  | "county_officials"
  | "civic_leaders"
  | "sports_crowd"
  | "democratic_base"
  | "persuasion";

export type CommunityOpportunity = {
  id: string;
  type: CommunityOpportunityType;
  title: string;
  county: string;
  city?: string;
  venue?: string;
  address?: string;
  lat?: number;
  lng?: number;
  startAt?: string;
  endAt?: string;
  bestCandidateArrival?: string;
  minimumAppearanceMinutes: number;
  idealAppearanceMinutes: number;
  sourceUrl?: string;
  sourceType: CommunityOpportunitySourceType;
  verificationStatus: CommunityOpportunityVerificationStatus;
  confidence: number;
  campaignValue: CommunityOpportunityCampaignValue;
  recommendedCoverage: CommunityOpportunityRecommendedCoverage;
  audienceTags: CommunityAudienceTag[];
  routeCluster?: string;
  notes?: string;
  /** Deterministic score components (filled in normalize step) */
  score?: OpportunityScore;
};

export type HighSchoolFootballOpportunity = CommunityOpportunity & {
  type: "high_school_football";
  homeTeam?: string;
  awayTeam?: string;
  rivalryName?: string;
  classification?: string;
  stadium?: string;
  estimatedAttendanceTier?: "small" | "medium" | "large" | "very_large";
  recommendedCandidateRole:
    | "coin_toss_if_invited"
    | "tailgate_drop_in"
    | "stands_handshakes"
    | "local_surrogate"
    | "avoid_partisan_visibility";
};

export type OpportunityScore = {
  baseValue: number;
  underTouchedCountyBoost: number;
  fewOpportunitiesBoost: number;
  democraticTurnoutGapBoost: number;
  persuasionUpsideBoost: number;
  routeEfficiencyBoost: number;
  localHostBoost: number;
  countySeatAddOnBoost: number;
  teacherAudienceBoost: number;
  campusYouthBoost: number;
  rivalryCrowdBoost: number;
  conflictPenalty: number;
  travelPenalty: number;
  total: number;
};

export type WeekendRoutePlanOpportunitySlot = {
  opportunityId: string;
  day: "friday" | "saturday" | "sunday" | "monday";
  recommendedArrival: string;
  recommendedDeparture: string;
  appearanceMinutes: number;
  bufferMinutesBefore: number;
  bufferMinutesAfter: number;
  travelFromPreviousMinutes: number;
  travelFromPreviousMiles: number;
  risk: "low" | "medium" | "high";
};

export type WeekendRoutePlanOvernight = {
  city: string;
  night: "friday" | "saturday" | "sunday" | "monday";
  reason: string;
};

export type WeekendRoutePlan = {
  id: string;
  weekStart: string;
  fridayNightOrigin: string;
  homeBase: "Rose Bud, Arkansas";
  startingLocationMode: "rose_bud" | "scheduled_location" | "manual";
  title: string;
  countiesCovered: string[];
  opportunities: WeekendRoutePlanOpportunitySlot[];
  overnightStops: WeekendRoutePlanOvernight[];
  totalDriveMinutes: number;
  totalDriveMiles: number;
  countiesTouched: number;
  mustAttendCount: number;
  routeTightness: "comfortable" | "busy_but_safe" | "too_tight";
  staffRecommendation: "approve" | "modify" | "hold" | "split_with_surrogate";
  aiSummary?: string;
  risks: string[];
};
