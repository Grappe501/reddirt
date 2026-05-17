import type { TripResolutionAutopilotResult, TripResolutionReadiness } from "./autopilot-types";

export function computeReadiness(result: Pick<TripResolutionAutopilotResult, "classification" | "titleCityMatch" | "mileageValidation" | "purposeExtraction">): TripResolutionReadiness {
  if (result.classification.classification === "duplicate_possible") return "duplicate_review";
  if (!result.classification.likelyCampaignTravel) return "likely_exclude";
  if (!result.titleCityMatch?.city) return "needs_city_input";
  if (result.titleCityMatch.needsHumanConfirmation) return "needs_city_confirmation";
  if (!result.mileageValidation || result.mileageValidation.totalReimbursableMiles <= 0) return "needs_human_review";
  if (result.purposeExtraction?.needsHumanEdit) return "needs_human_review";
  return "ready_to_approve";
}

