import type { CampaignCalendarItem } from "@/lib/calendar/campaign-calendar-item";
import type { PublicSchedulingAssistantResult } from "@/lib/kelly-agent/public-scheduling-agent";
import type { ScheduleCampaignEventBody } from "@/lib/forms/public-schedule-schema";
import { classifyCampaignEvent } from "../classify-event";
import { PUBLIC_SCHEDULE_EVENT_TYPE_LABELS } from "@/lib/forms/public-schedule-schema";

export type IntakeInferenceSnapshot = {
  city: string | null;
  county: string | null;
  zipCode: string | null;
  eventTypeLabel: string;
  likelyTravel: boolean;
  likelyReimbursable: boolean;
  likelyHost: string | null;
  likelyVolunteersNeeded: boolean;
  eventCategory: string;
  candidateSpeakingSlot: boolean;
  travelReason: string | null;
  missingFields: string[];
  confidenceNotes: string[];
};

const ZIP_RE = /\b(\d{5})(?:-\d{4})?\b/;

function extractZip(address: string | null | undefined): string | null {
  if (!address?.trim()) return null;
  const m = address.match(ZIP_RE);
  return m?.[1] ?? null;
}

function inferVolunteers(body: ScheduleCampaignEventBody): boolean {
  if (body.audienceSize != null && body.audienceSize >= 75) return true;
  return ["volunteer_event", "fair_festival", "school_campus"].includes(body.eventType);
}

export function runIntakeInference(input: {
  body: ScheduleCampaignEventBody;
  assistant: PublicSchedulingAssistantResult;
  routeImpactMilesEstimate: number | null;
  syntheticCalendar: CampaignCalendarItem;
}): IntakeInferenceSnapshot {
  const { body, assistant, routeImpactMilesEstimate, syntheticCalendar } = input;
  const { label } = classifyCampaignEvent(syntheticCalendar);
  const city =
    body.city?.trim() ||
    assistant.recommendedTentativeEvent.city?.trim() ||
    syntheticCalendar.city?.trim() ||
    null;
  const county = body.county?.trim() || assistant.recommendedTentativeEvent.county?.trim() || null;
  const zipCode = extractZip(body.address);
  const travelFlag = assistant.privateStaffFlags.some((f) => f.flag === "travel_heavy");
  const likelyTravel =
    travelFlag || (routeImpactMilesEstimate != null && routeImpactMilesEstimate >= 25) || Boolean(body.address?.trim());
  const likelyHost = body.localHostAvailable
    ? body.organization?.trim() || body.requesterName.trim()
    : body.organization?.trim() || null;

  const missingFields: string[] = [];
  if (!city) missingFields.push("city");
  if (!body.preferredDate && body.flexibility === "campaign_suggests") missingFields.push("preferred_date");
  if (!body.address?.trim()) missingFields.push("street_address");
  if (!zipCode) missingFields.push("zip_code");
  if (!assistant.recommendedTentativeEvent.startAt) missingFields.push("confirmed_start_time");

  const confidenceNotes: string[] = [];
  if (body.flexibility !== "exact_date_only") {
    confidenceNotes.push(`Date flexibility: ${body.flexibility.replaceAll("_", " ")}`);
  }
  if (assistant.intakeStatus !== "ready_to_submit") {
    confidenceNotes.push(`Assistant status: ${assistant.intakeStatus}`);
  }

  return {
    city,
    county,
    zipCode,
    eventTypeLabel: label || PUBLIC_SCHEDULE_EVENT_TYPE_LABELS[body.eventType] || body.eventType,
    likelyTravel,
    likelyReimbursable: likelyTravel,
    likelyHost,
    likelyVolunteersNeeded: inferVolunteers(body),
    eventCategory: PUBLIC_SCHEDULE_EVENT_TYPE_LABELS[body.eventType] ?? body.eventType,
    candidateSpeakingSlot: body.speakingRequested,
    travelReason: likelyTravel
      ? routeImpactMilesEstimate != null
        ? `Route estimate ~${Math.round(routeImpactMilesEstimate)} mi`
        : travelFlag
          ? "Staff flagged travel-heavy"
          : "Out-of-area or address provided"
      : null,
    missingFields,
    confidenceNotes,
  };
}

export function buildIntakeSummary(inferred: IntakeInferenceSnapshot, body: ScheduleCampaignEventBody): string {
  const parts = [
    `Website request: ${body.eventTitle}`,
    inferred.county ? `County ${inferred.county}` : null,
    inferred.city ? `City ${inferred.city}` : "City TBD",
    inferred.eventTypeLabel,
    inferred.likelyTravel ? "Likely travel" : "Local / travel TBD",
    inferred.candidateSpeakingSlot ? "Kelly speaking requested" : null,
    inferred.missingFields.length ? `Missing: ${inferred.missingFields.join(", ")}` : null,
  ].filter(Boolean);
  return parts.join(" · ");
}

export function recommendIntakeNextAction(input: {
  inferred: IntakeInferenceSnapshot;
  duplicateRisk: boolean;
  scheduleConflict: boolean;
  assistant: PublicSchedulingAssistantResult;
}): string {
  if (input.scheduleConflict) return "Review schedule conflict before confirming on official calendar.";
  if (input.duplicateRisk) return "Compare with possible duplicate events, then approve or merge.";
  if (input.inferred.missingFields.length > 2) return "Request more location/date detail from requester.";
  if (input.assistant.intakeStatus === "staff_review_required") return "Staff review required — verify county and host.";
  return "Run month review → approve tentative event when facts are complete.";
}
