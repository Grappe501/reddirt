import { buildApprovalContext } from "@/lib/calendar/build-approval-context";
import type { CampaignCalendarItem } from "@/lib/calendar/campaign-calendar-item";
import { CAMPAIGN_EVENT_REIMBURSEMENT_RATE_USD_PER_MILE } from "../constants";
import { resolveDefaultTravelOrigin } from "../travel-origin";
import type { EventReviewFormState } from "../review-form";

export type MileageInferenceAssist = {
  originLabel: string;
  originCity: string;
  destinationCity: string;
  rate: number;
  estimatedRoundTripMiles: number | null;
  estimatedReimbursement: number | null;
  oneWayMiles: number | null;
  driveMinutesOneWay: number | null;
  source: string;
  canEstimate: boolean;
  ruleNote: string;
};

export function buildMileageInferenceAssist(
  calendar: CampaignCalendarItem,
  allCalendar: CampaignCalendarItem[],
  form: EventReviewFormState,
): MileageInferenceAssist {
  const travelOrigin = resolveDefaultTravelOrigin(calendar);
  const destination =
    form.destinationOverrideCity?.trim() ||
    form.destinationCity?.trim() ||
    form.city?.trim() ||
    calendar.city?.trim() ||
    "";

  const rate = form.reimbursementRate ? Number(form.reimbursementRate) || CAMPAIGN_EVENT_REIMBURSEMENT_RATE_USD_PER_MILE : CAMPAIGN_EVENT_REIMBURSEMENT_RATE_USD_PER_MILE;

  if (!destination) {
    return {
      originLabel: travelOrigin.originLabel,
      originCity: travelOrigin.originCity,
      destinationCity: "",
      rate,
      estimatedRoundTripMiles: null,
      estimatedReimbursement: null,
      oneWayMiles: null,
      driveMinutesOneWay: null,
      source: "Add destination city first",
      canEstimate: false,
      ruleNote: travelOrigin.note,
    };
  }

  const ctx = buildApprovalContext(calendar, allCalendar);
  const oneWay = ctx.estimatedDistanceMiles ?? null;
  const roundTrip = oneWay != null ? Math.round(oneWay * 2 * 10) / 10 : null;
  const reimbursement = roundTrip != null ? Math.round(roundTrip * rate * 100) / 100 : null;

  return {
    originLabel: ctx.travelOriginLabel ?? travelOrigin.originLabel,
    originCity: form.originOverrideCity?.trim() || form.originCity?.trim() || travelOrigin.originCity,
    destinationCity: destination,
    rate,
    estimatedRoundTripMiles: roundTrip,
    estimatedReimbursement: reimbursement,
    oneWayMiles: oneWay,
    driveMinutesOneWay: ctx.estimatedDriveMinutes ?? null,
    source: oneWay != null ? `City-level haversine (~${oneWay} mi one-way × 2 round trip)` : "Distance unavailable",
    canEstimate: roundTrip != null && roundTrip > 0,
    ruleNote: travelOrigin.note,
  };
}
