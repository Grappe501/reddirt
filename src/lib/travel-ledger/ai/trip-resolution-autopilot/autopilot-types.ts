import type { TravelCity, TravelLedgerItem } from "@/lib/travel-ledger/types";

export type Confidence = "high" | "medium" | "low" | "none";

export type CityResolutionSource =
  | "human_override"
  | "title_exact_city_match"
  | "title_alias_match"
  | "title_county_to_city_match"
  | "reviewer_memory"
  | "calendar_location_field"
  | "calendar_description"
  | "google_maps_validation"
  | "openai_inference"
  | "ask_human"
  | "none";

export const cityResolutionOrder: CityResolutionSource[] = [
  "human_override",
  "title_exact_city_match",
  "title_alias_match",
  "title_county_to_city_match",
  "reviewer_memory",
  "calendar_location_field",
  "calendar_description",
  "google_maps_validation",
  "openai_inference",
  "ask_human",
];

export type TitleCityMatch = {
  city?: string;
  state?: string;
  county?: string;
  cities?: TravelCity[];
  confidence: Confidence;
  matchedText?: string;
  source: "title_exact_city_match" | "title_alias_match" | "title_county_to_city_match" | "none";
  needsHumanConfirmation: boolean;
  reason: string;
};

export type PurposeExtraction = {
  businessPurpose: string;
  classification:
    | "campaign_meeting"
    | "rotary"
    | "house_party"
    | "county_party"
    | "festival"
    | "fundraiser"
    | "admin"
    | "virtual"
    | "personal"
    | "unknown";
  confidence: "high" | "medium" | "low";
  needsHumanEdit: boolean;
};

export type CampaignTripClassification = {
  likelyCampaignTravel: boolean;
  classification:
    | "campaign_reimbursement_trip"
    | "not_campaign_travel"
    | "virtual_no_travel"
    | "personal_non_reimbursable"
    | "duplicate_possible"
    | "admin_no_travel"
    | "unknown";
  confidence: "high" | "medium" | "low";
  firstQuestion: "is_campaign_trip" | "confirm_city" | "confirm_duplicate" | "ready_to_review";
  reason: string;
};

export type CityMileageValidation = {
  city: string;
  state: string;
  routeText: string;
  baseMiles: number;
  totalReimbursableMiles: number;
  source: "google_maps" | "cache" | "fallback";
  confidence: "high" | "medium" | "low";
  warnings: string[];
};

export type NextQuestionSelection = {
  question: string;
  answerType: "yes_no" | "city_confirm" | "city_input" | "multiple_choice" | "decision";
  choices?: string[];
  reason: string;
};

export type TripResolutionReadiness =
  | "ready_to_approve"
  | "needs_city_confirmation"
  | "needs_city_input"
  | "likely_exclude"
  | "duplicate_review"
  | "needs_human_review";

export type TripResolutionAutopilotResult = {
  itemId: string;
  title: string;
  date: string;
  titleCityMatch?: TitleCityMatch;
  purposeExtraction?: PurposeExtraction;
  classification: CampaignTripClassification;
  mileageValidation?: CityMileageValidation;
  preparedFields: {
    city?: string;
    state?: string;
    routeText?: string;
    totalReimbursableMiles?: number;
    reimbursementAmount?: number;
    businessPurpose?: string;
  };
  readiness: TripResolutionReadiness;
  nextQuestion: NextQuestionSelection;
  warnings: string[];
  humanApprovalRequired: true;
};

export type TripResolutionContext = {
  item: TravelLedgerItem;
  title: string;
  locationText: string;
  descriptionText: string;
  priorApprovedItems: TravelLedgerItem[];
  duplicateCandidates: TravelLedgerItem[];
  blankDayContext: {
    previousItem?: TravelLedgerItem;
    nextItem?: TravelLedgerItem;
  };
};

