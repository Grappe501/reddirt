import { createHash } from "node:crypto";
import type { CampaignEventCoveragePlan } from "@/lib/calendar/event-coverage-types";

type EventLike = {
  id: string;
  title: string;
  eventType?: string | null;
  eventWorkflowState?: string | null;
  status?: string | null;
  county?: string | null;
  city?: string | null;
  locationName?: string | null;
  startAt?: string | Date | null;
  commsStateJson?: unknown;
};

export const materialDefaults = {
  smallMeeting: { pushCards: 50, fans: 25, volunteers: 1, mints: 0 },
  countyPartyMeeting: { pushCards: 75, fans: 50, volunteers: 2, mints: 50 },
  houseParty: { pushCards: 50, fans: 25, volunteers: 1, mints: 50 },
  fairFestival: { pushCards: 250, fans: 250, volunteers: 4, mints: 150 },
  campusFootballLargeEvent: { pushCards: 200, fans: 200, volunteers: 3, mints: 150 },
} as const;

function idFor(eventId: string): string {
  return `cov_${createHash("sha256").update(eventId).digest("hex").slice(0, 24)}`;
}

function text(event: EventLike): string {
  return [event.title, event.eventType, event.locationName, event.county, event.city].filter(Boolean).join(" ").toLowerCase();
}

function isVirtual(event: EventLike): boolean {
  const t = text(event);
  return event.eventType === "virtual_statewide" || /zoom|virtual|webinar|online|https?:\/\//.test(t);
}

function isPersonalOrUnavailable(event: EventLike): boolean {
  const t = text(event);
  return event.eventType === "personal_admin" || /unavailable|pawpaw|paw paw|family|birthday|bday|doctor|dr |appt|appointment|lunch with|dinner at|call /.test(t);
}

function stagedCalendarItemId(event: EventLike): string | undefined {
  const meta = event.commsStateJson && typeof event.commsStateJson === "object" ? event.commsStateJson as { kellyCockpit?: { stagedItemId?: string; calendarItemId?: string } } : {};
  return meta.kellyCockpit?.stagedItemId ?? meta.kellyCockpit?.calendarItemId;
}

function candidateDecision(event: EventLike): CampaignEventCoveragePlan["candidateDecision"] {
  if (event.status === "CANCELLED" || event.eventWorkflowState === "CANCELED") return "declined";
  if (["APPROVED", "PUBLISHED", "COMPLETED"].includes(event.eventWorkflowState ?? "")) return "confirmed";
  if (event.eventWorkflowState === "PENDING_APPROVAL") return "needs_kelly_decision";
  if (event.eventWorkflowState === "DRAFT") return "not_requested";
  return "needs_kelly_decision";
}

function classify(event: EventLike): keyof typeof materialDefaults {
  const t = text(event);
  if (/fair|festival|parade|juneteenth|tomato|farm fest/.test(t)) return "fairFestival";
  if (/campus|football|tailgate|university|college|high school/.test(t)) return "campusFootballLargeEvent";
  if (/house party|house-party|home host|hosted by/.test(t)) return "houseParty";
  if (/county party|dems|democrats|committee|meeting|dpa/.test(t)) return "countyPartyMeeting";
  return "smallMeeting";
}

function isPublicEvent(kind: keyof typeof materialDefaults): boolean {
  return kind === "fairFestival" || kind === "campusFootballLargeEvent";
}

export function buildEventCoveragePlan(event: EventLike): CampaignEventCoveragePlan {
  const kind = classify(event);
  const defaults = materialDefaults[kind];
  const decision = candidateDecision(event);
  const virtual = isVirtual(event);
  const personalOrUnavailable = isPersonalOrUnavailable(event);
  const noFieldCoverage = virtual || personalOrUnavailable;
  const kellyConfirmed = decision === "confirmed";
  const kellyDeclined = decision === "declined";
  const tableNeeded = !noFieldCoverage && (kind === "fairFestival" || kind === "campusFootballLargeEvent");
  const volunteersNeeded = noFieldCoverage ? 0 : kellyConfirmed ? Math.max(2, defaults.volunteers) : Math.max(defaults.volunteers, tableNeeded ? 3 : 1);
  const coverageMode: CampaignEventCoveragePlan["coverageMode"] =
    noFieldCoverage
      ? virtual
        ? "monitor_only"
        : "no_coverage"
      : kellyConfirmed
      ? "kelly_attends_plus_volunteers"
      : kellyDeclined
        ? tableNeeded
          ? "table_if_possible"
          : "local_volunteer_coverage"
        : tableNeeded
          ? "table_if_possible"
          : kind === "countyPartyMeeting"
            ? "county_party_surrogate"
            : "local_volunteer_coverage";

  const staffNextActions = new Set<string>();
  if (noFieldCoverage) {
    staffNextActions.add(virtual ? "monitor virtual event and capture useful follow-up notes" : "confirm no campaign coverage needed");
  } else {
    if (!kellyConfirmed && !kellyDeclined) staffNextActions.add("get Kelly attend/hold/decline decision");
    if (tableNeeded) staffNextActions.add("confirm tabling allowed");
    if (!kellyConfirmed) staffNextActions.add("assign volunteer lead");
    if (!kellyConfirmed) staffNextActions.add("find local host or county contact");
    staffNextActions.add("pack shirts");
    staffNextActions.add("pack push cards/fans/mints");
    if (tableNeeded) staffNextActions.add("pack tablecloth/banner/clipboards/pens/signup sheets");
    if (isPublicEvent(kind)) staffNextActions.add("assign photo person");
    staffNextActions.add("collect post-event notes");
  }

  const status: CampaignEventCoveragePlan["status"] =
    event.status === "CANCELLED" || event.eventWorkflowState === "CANCELED"
      ? "cancelled"
      : personalOrUnavailable
        ? "not_covering"
        : virtual
          ? "ready"
      : !kellyConfirmed && decision === "needs_kelly_decision"
        ? "needs_decision"
        : tableNeeded
          ? "needs_staff_call"
          : !kellyConfirmed
            ? "needs_volunteer_lead"
            : "ready";

  return {
    id: idFor(event.id),
    campaignEventId: event.id,
    calendarItemId: stagedCalendarItemId(event),
    county: event.county ?? undefined,
    city: event.city ?? undefined,
    coverageMode,
    candidateDecision: decision,
    candidatePlan: {
      kellyAttending: kellyConfirmed && !personalOrUnavailable,
      kellySpeaking: kellyConfirmed && !personalOrUnavailable && /forum|debate|speech|meeting|town hall|panel/i.test(text(event)),
      kellyDropIn: kellyConfirmed && !personalOrUnavailable && !/forum|debate|speech|panel/i.test(text(event)),
      kellyUnavailable: personalOrUnavailable || kellyDeclined,
      status: kellyConfirmed
        ? "confirmed"
        : personalOrUnavailable || kellyDeclined
          ? "unavailable"
          : decision === "needs_kelly_decision"
            ? "needs_decision"
            : "local_coverage_needed",
    },
    volunteerLeadNeeded: !noFieldCoverage && !kellyConfirmed,
    localHostNeeded: !noFieldCoverage && !kellyConfirmed,
    volunteersNeeded,
    shirtsNeeded: volunteersNeeded,
    tableNeeded,
    tableStatus: tableNeeded ? "needs_permission" : "not_needed",
    materials: {
      pushCards: noFieldCoverage ? 0 : defaults.pushCards,
      fans: noFieldCoverage ? 0 : defaults.fans,
      shirts: volunteersNeeded,
      brandedMints: noFieldCoverage ? 0 : defaults.mints,
      fourFootTablecloths: tableNeeded ? 1 : 0,
      pullUpBanners: tableNeeded ? 1 : 0,
      signupSheets: noFieldCoverage ? 0 : tableNeeded ? 5 : kind === "houseParty" ? 5 : 2,
      clipboards: noFieldCoverage ? 0 : tableNeeded ? 2 : 1,
      pens: noFieldCoverage ? 0 : tableNeeded ? 10 : 4,
      qrCodeCards: noFieldCoverage ? 0 : tableNeeded ? 50 : 10,
      yardSigns: tableNeeded ? 2 : 0,
      voterRegistrationForms: noFieldCoverage ? 0 : isPublicEvent(kind) ? 25 : 0,
    },
    logistics: {
      setupMinutes: tableNeeded ? 45 : 20,
      teardownMinutes: tableNeeded ? 30 : 15,
      whatToWear: noFieldCoverage ? undefined : "Kelly shirt if available",
      whatToBring: noFieldCoverage ? [] : ["comfortable shoes", "water", "phone", "photo notes after the event"],
      parkingKnown: false,
      electricityNeeded: tableNeeded ? false : undefined,
      weatherRisk: tableNeeded ? "unknown" : "low",
    },
    followUp: {
      photosNeeded: !noFieldCoverage && (isPublicEvent(kind) || kellyConfirmed),
      contactCollectionNeeded: !noFieldCoverage && (isPublicEvent(kind) || kind === "houseParty"),
      postEventNotesNeeded: true,
      thankYouNeeded: !noFieldCoverage && (kind === "houseParty" || kellyConfirmed),
      uploadFolderNeeded: !noFieldCoverage && (isPublicEvent(kind) || kellyConfirmed),
    },
    status,
    staffNextActions: [...staffNextActions],
    notes: kellyConfirmed
      ? "Kelly coverage plan: candidate attends; staff should still cover materials, volunteers, photos, and follow-up."
      : noFieldCoverage
        ? "No field coverage defaulted for this virtual/internal/personal item; staff should monitor or confirm no campaign action."
        : "Kelly not confirmed; campaign coverage should continue through local volunteers, host, table/materials, or staff follow-up.",
  };
}
