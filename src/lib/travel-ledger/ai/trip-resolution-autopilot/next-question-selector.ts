import type {
  CampaignTripClassification,
  CityMileageValidation,
  NextQuestionSelection,
  PurposeExtraction,
  TitleCityMatch,
} from "./autopilot-types";

export function selectNextQuestion(input: {
  titleCityMatch: TitleCityMatch;
  purposeExtraction: PurposeExtraction;
  classification: CampaignTripClassification;
  mileageValidation?: CityMileageValidation;
}): NextQuestionSelection {
  if (!input.classification.likelyCampaignTravel) {
    return {
      question: "Is this campaign reimbursement travel?",
      answerType: "yes_no",
      choices: ["Yes, campaign travel", "No, deny/exclude", "Virtual / no travel", "Personal", "Duplicate"],
      reason: input.classification.reason,
    };
  }

  if (!input.titleCityMatch.city) {
    return {
      question: "I could not find a city in the title. What city did Kelly travel to?",
      answerType: "city_input",
      reason: "No title, alias, county, memory, location, or description city was resolved.",
    };
  }

  if (input.titleCityMatch.needsHumanConfirmation) {
    return {
      question: `I think this should be ${input.titleCityMatch.city} based on "${input.titleCityMatch.matchedText}". Is that right?`,
      answerType: "city_confirm",
      choices: [`Yes, use ${input.titleCityMatch.city}`, "Change city", "Not a campaign trip"],
      reason: input.titleCityMatch.reason,
    };
  }

  if (!input.mileageValidation || input.mileageValidation.totalReimbursableMiles <= 0) {
    return {
      question: `I found ${input.titleCityMatch.city} in the event title. Confirm mileage or change city?`,
      answerType: "city_confirm",
      choices: [`Yes, use ${input.titleCityMatch.city}`, "Change city", "Not a campaign trip"],
      reason: "City was resolved but mileage validation is incomplete.",
    };
  }

  if (input.purposeExtraction.needsHumanEdit) {
    return {
      question: "Review the drafted campaign purpose, then approve or edit.",
      answerType: "decision",
      choices: ["Approve", "Edit purpose", "Deny / exclude"],
      reason: "Purpose was drafted from title but needs human review.",
    };
  }

  return {
    question: "Ready to approve this reimbursement item?",
    answerType: "decision",
    choices: ["Approve", "Change city", "Deny / exclude"],
    reason: "Autopilot resolved city, mileage, and purpose before asking.",
  };
}

