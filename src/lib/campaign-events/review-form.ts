import type { CampaignEventFactCardData } from "./fact-card-data";
import type { KellyAttendanceModeValue } from "./fact-card-data";

/** Flat form used in the per-event review modal (serializable). */
export type EventReviewFormState = {
  eventType: string;
  reviewStatus: string;
  eventStatus: string;
  city: string;
  county: string;
  zipCode: string;
  address: string;
  venueName: string;
  arrivalTime: string;
  setupTime: string;
  departureTime: string;
  materialsNeeded: string;
  hostName: string;
  hostOrganization: string;
  campaignPurpose: string;
  candidateRole: string;
  kellyAttendanceMode: KellyAttendanceModeValue;
  speakingSlot: string;
  marketingTable: string;
  volunteersNeeded: string;
  volunteerCount: string;
  campaignPointPerson: string;
  originCity: string;
  destinationCity: string;
  originOverrideCity: string;
  destinationOverrideCity: string;
  travelTimeMinutes: string;
  roundTripMiles: string;
  reimbursementRate: string;
  reimbursementAmount: string;
  operatorNotes: string;
};

export function factCardToReviewForm(
  data: CampaignEventFactCardData,
  operatorNotes?: string,
  reviewStatus?: string,
  eventStatus?: string,
): EventReviewFormState {
  return {
    eventType: data.why.eventType ?? "",
    reviewStatus: reviewStatus ?? "IN_PROGRESS",
    eventStatus: eventStatus ?? "NEEDS_REVIEW",
    city: data.where.city ?? "",
    county: data.where.county ?? "",
    zipCode: data.where.zipCode ?? "",
    address: data.where.address ?? "",
    venueName: data.where.venueName ?? "",
    arrivalTime: data.when.arrivalTime ?? "",
    setupTime: data.when.setupTime ?? "",
    departureTime: data.when.departureTime ?? "",
    materialsNeeded: data.what.materialsNeeded ?? "",
    hostName: data.who.hostName ?? "",
    hostOrganization: data.who.hostOrganization ?? "",
    campaignPurpose: data.why.campaignPurpose ?? "",
    candidateRole: data.what.candidateRole ?? "",
    kellyAttendanceMode: data.who.kellyAttendanceMode ?? "unknown",
    speakingSlot: data.what.speakingSlot ?? "",
    marketingTable: data.what.marketingTable ?? "",
    volunteersNeeded: data.who.volunteersNeeded ?? "",
    volunteerCount: data.who.volunteerCount ?? "",
    campaignPointPerson: data.who.campaignPointPerson ?? "",
    originCity: data.travel.assumedOriginCity ?? "",
    destinationCity: data.travel.assumedDestinationCity ?? "",
    originOverrideCity: data.travel.originOverrideCity ?? "",
    destinationOverrideCity: data.travel.destinationOverrideCity ?? "",
    travelTimeMinutes: data.travel.travelTimeMinutes != null ? String(data.travel.travelTimeMinutes) : "",
    roundTripMiles: data.travel.roundTripMiles != null ? String(data.travel.roundTripMiles) : "",
    reimbursementRate: data.travel.reimbursementRate != null ? String(data.travel.reimbursementRate) : "0.7",
    reimbursementAmount: data.travel.reimbursementAmount != null ? String(data.travel.reimbursementAmount) : "",
    operatorNotes: operatorNotes ?? "",
  };
}

export function reviewFormToFactCard(form: EventReviewFormState): CampaignEventFactCardData {
  return {
    where: {
      venueName: form.venueName || undefined,
      address: form.address || undefined,
      city: form.city || undefined,
      county: form.county || undefined,
      zipCode: form.zipCode || undefined,
    },
    when: {
      arrivalTime: form.arrivalTime || undefined,
      setupTime: form.setupTime || undefined,
      departureTime: form.departureTime || undefined,
    },
    why: {
      eventType: form.eventType || undefined,
      campaignPurpose: form.campaignPurpose || undefined,
    },
    who: {
      hostName: form.hostName || undefined,
      hostOrganization: form.hostOrganization || undefined,
      campaignPointPerson: form.campaignPointPerson || undefined,
      kellyAttendanceMode: form.kellyAttendanceMode,
      volunteersNeeded: form.volunteersNeeded || undefined,
      volunteerCount: form.volunteerCount || undefined,
    },
    what: {
      candidateRole: form.candidateRole || undefined,
      speakingSlot: form.speakingSlot || undefined,
      marketingTable: form.marketingTable || undefined,
      materialsNeeded: form.materialsNeeded || undefined,
    },
    travel: {
      assumedOriginCity: form.originCity || undefined,
      assumedDestinationCity: form.destinationCity || undefined,
      originOverrideCity: form.originOverrideCity || undefined,
      destinationOverrideCity: form.destinationOverrideCity || undefined,
      originOverrideAllowed: true,
      destinationOverrideAllowed: true,
      travelTimeMinutes: form.travelTimeMinutes ? Number(form.travelTimeMinutes) : undefined,
      roundTripMiles: form.roundTripMiles ? Number(form.roundTripMiles) : undefined,
      reimbursementRate: form.reimbursementRate ? Number(form.reimbursementRate) : undefined,
      reimbursementAmount: form.reimbursementAmount ? Number(form.reimbursementAmount) : undefined,
      reimbursementStatus: "reviewed",
    },
  };
}

export function mergeFormWithAiPrefill(
  existing: EventReviewFormState,
  prefill: CampaignEventFactCardData,
): EventReviewFormState {
  const ai = factCardToReviewForm(prefill);
  const pick = (current: string, inferred: string) => (current.trim() ? current : inferred);
  return {
    ...existing,
    eventType: pick(existing.eventType, ai.eventType),
    city: pick(existing.city, ai.city),
    county: pick(existing.county, ai.county),
    zipCode: pick(existing.zipCode, ai.zipCode),
    address: pick(existing.address, ai.address),
    venueName: pick(existing.venueName, ai.venueName),
    arrivalTime: pick(existing.arrivalTime, ai.arrivalTime),
    setupTime: pick(existing.setupTime, ai.setupTime),
    materialsNeeded: pick(existing.materialsNeeded, ai.materialsNeeded),
    hostName: pick(existing.hostName, ai.hostName),
    hostOrganization: pick(existing.hostOrganization, ai.hostOrganization),
    campaignPurpose: pick(existing.campaignPurpose, ai.campaignPurpose),
    candidateRole: pick(existing.candidateRole, ai.candidateRole),
    kellyAttendanceMode: existing.kellyAttendanceMode !== "unknown" ? existing.kellyAttendanceMode : ai.kellyAttendanceMode,
    speakingSlot: pick(existing.speakingSlot, ai.speakingSlot),
    marketingTable: pick(existing.marketingTable, ai.marketingTable),
    volunteersNeeded: pick(existing.volunteersNeeded, ai.volunteersNeeded),
    campaignPointPerson: pick(existing.campaignPointPerson, ai.campaignPointPerson),
    originCity: pick(existing.originCity, ai.originCity),
    destinationCity: pick(existing.destinationCity, ai.destinationCity),
    travelTimeMinutes: pick(existing.travelTimeMinutes, ai.travelTimeMinutes),
  };
}
