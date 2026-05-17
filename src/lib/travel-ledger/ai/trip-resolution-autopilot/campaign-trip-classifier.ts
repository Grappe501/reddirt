import type { CampaignTripClassification, PurposeExtraction, TitleCityMatch } from "./autopilot-types";

export function classifyCampaignTrip(input: {
  title: string;
  titleCityMatch: TitleCityMatch;
  purposeExtraction: PurposeExtraction;
  duplicateRisk: boolean;
}): CampaignTripClassification {
  const text = input.title.toLowerCase();

  if (input.duplicateRisk) {
    return {
      likelyCampaignTravel: false,
      classification: "duplicate_possible",
      confidence: "medium",
      firstQuestion: "confirm_duplicate",
      reason: "This item resembles another calendar/travel item close in time.",
    };
  }

  if (/\bzoom|virtual|webinar|online\b/i.test(text) || input.purposeExtraction.classification === "virtual") {
    return {
      likelyCampaignTravel: false,
      classification: "virtual_no_travel",
      confidence: "high",
      firstQuestion: "is_campaign_trip",
      reason: "Title/purpose indicates a virtual event.",
    };
  }

  if (/\bhospital|personal|doctor|medical|prep\b/i.test(text) || input.purposeExtraction.classification === "personal") {
    return {
      likelyCampaignTravel: false,
      classification: "personal_non_reimbursable",
      confidence: "medium",
      firstQuestion: "is_campaign_trip",
      reason: "Title/purpose looks personal or administrative.",
    };
  }

  if (/\badmin|prep|packet|office\b/i.test(text) && !input.titleCityMatch.city) {
    return {
      likelyCampaignTravel: false,
      classification: "admin_no_travel",
      confidence: "medium",
      firstQuestion: "is_campaign_trip",
      reason: "Administrative language without travel city.",
    };
  }

  if (input.titleCityMatch.city && input.titleCityMatch.confidence === "high") {
    return {
      likelyCampaignTravel: true,
      classification: "campaign_reimbursement_trip",
      confidence: "high",
      firstQuestion: "ready_to_review",
      reason: "High-confidence city and campaign-purpose title detected before OpenAI.",
    };
  }

  if (input.titleCityMatch.city) {
    return {
      likelyCampaignTravel: true,
      classification: "campaign_reimbursement_trip",
      confidence: "medium",
      firstQuestion: "confirm_city",
      reason: "City was inferred from alias/county and should be confirmed.",
    };
  }

  return {
    likelyCampaignTravel: false,
    classification: "unknown",
    confidence: "low",
    firstQuestion: "is_campaign_trip",
    reason: "No reliable city or campaign travel signal found.",
  };
}

