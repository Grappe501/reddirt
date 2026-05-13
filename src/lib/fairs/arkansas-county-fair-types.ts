/** Normalized Arkansas county fair row (V2 fair audit + routing). */

export type ArkansasCountyFairSourceType =
  | "burt_database"
  | "official_fair_site"
  | "county_extension"
  | "facebook"
  | "chamber"
  | "tourism_calendar"
  | "newspaper"
  | "manual";

export type ArkansasCountyFairVerificationStatus =
  | "verified_2026"
  | "likely_2026"
  | "date_not_posted"
  | "needs_confirmation"
  | "duplicate"
  | "not_county_fair";

export type ArkansasCountyFairCampaignValue =
  | "must_attend"
  | "high_value"
  | "send_local"
  | "combine_with_nearby"
  | "monitor";

export type ArkansasCountyFairRecommendedCoverage =
  | "kelly"
  | "kelly_plus_local_host"
  | "local_surrogate"
  | "staff_only"
  | "press_only";

export type ArkansasCountyFairRow = {
  id: string;
  county: string;
  fairName: string;
  city?: string;
  venue?: string;
  address?: string;
  startDate?: string;
  endDate?: string;
  bestCandidateDate?: string;
  bestCandidateTimeWindow?: string;
  sourceUrl?: string;
  sourceType: ArkansasCountyFairSourceType;
  verificationStatus: ArkansasCountyFairVerificationStatus;
  confidence: number;
  hasCarnival?: boolean;
  hasLivestockAuction?: boolean;
  hasParade?: boolean;
  hasPageant?: boolean;
  hasRodeo?: boolean;
  hasDemolitionDerby?: boolean;
  hasSeniorNight?: boolean;
  hasYouthLivestock?: boolean;
  campaignValue: ArkansasCountyFairCampaignValue;
  recommendedCoverage: ArkansasCountyFairRecommendedCoverage;
  routeCluster?: string;
  nearestPriorStop?: string;
  nearestNextStop?: string;
  distanceFromRoseBudMiles?: number;
  notes?: string;
  /** Filled by `plan-arkansas-county-fair-route.ts` */
  isoWeekKey?: string;
  /** Overlapping Kelly travel calendar item ids */
  kellyCalendarConflictIds?: string[];
};

export type ArkansasCountyFairRawRecord = {
  county: string;
  fairName?: string;
  startAtIso?: string;
  endAtIso?: string;
  sourceUrl?: string;
  sourceType: ArkansasCountyFairSourceType;
  sourceLineage: string[];
  ingestId?: string;
  sourceChannel?: string;
  notes?: string;
  queryTemplates?: string[];
  htmlSnapshotPath?: string;
  latitude?: number;
  longitude?: number;
};
