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
  smallMeeting: { pushCards: 50, fans: 25, volunteers: 1 },
  countyPartyMeeting: { pushCards: 75, fans: 50, volunteers: 2 },
  houseParty: { pushCards: 50, fans: 25, volunteers: 1 },
  fairFestival: { pushCards: 250, fans: 250, volunteers: 4 },
  campusFootballLargeEvent: { pushCards: 200, fans: 200, volunteers: 3 },
} as const;

function idFor(eventId: string): string {
  return `cov_${createHash("sha256").update(eventId).digest("hex").slice(0, 24)}`;
}

function text(event: EventLike): string {
  return [event.title, event.eventType, event.locationName, event.county, event.city].filter(Boolean).join(" ").toLowerCase();
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
  const kellyConfirmed = decision === "confirmed";
  const kellyDeclined = decision === "declined";
  const tableNeeded = kind === "fairFestival" || kind === "campusFootballLargeEvent";
  const volunteersNeeded = kellyConfirmed ? Math.max(2, defaults.volunteers) : Math.max(defaults.volunteers, tableNeeded ? 3 : 1);
  const coverageMode: CampaignEventCoveragePlan["coverageMode"] =
    kellyConfirmed
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
  if (!kellyConfirmed && !kellyDeclined) staffNextActions.add("get Kelly attend/hold/decline decision");
  if (tableNeeded) staffNextActions.add("confirm tabling allowed");
  if (!kellyConfirmed) staffNextActions.add("assign volunteer lead");
  if (!kellyConfirmed) staffNextActions.add("find local host or county contact");
  staffNextActions.add("pack shirts");
  staffNextActions.add("pack push cards/fans");
  if (isPublicEvent(kind)) staffNextActions.add("assign photo person");
  staffNextActions.add("collect post-event notes");

  const status: CampaignEventCoveragePlan["status"] =
    event.status === "CANCELLED" || event.eventWorkflowState === "CANCELED"
      ? "cancelled"
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
    volunteerLeadNeeded: !kellyConfirmed,
    localHostNeeded: !kellyConfirmed,
    volunteersNeeded,
    shirtsNeeded: volunteersNeeded,
    tableNeeded,
    tableStatus: tableNeeded ? "needs_permission" : "not_needed",
    materials: {
      pushCards: defaults.pushCards,
      fans: defaults.fans,
      signupSheets: kind === "houseParty" || isPublicEvent(kind) ? 25 : 10,
      voterRegistrationForms: isPublicEvent(kind) ? 25 : 10,
    },
    logistics: {
      setupMinutes: tableNeeded ? 45 : 20,
      teardownMinutes: tableNeeded ? 30 : 15,
      parkingKnown: false,
      electricityNeeded: tableNeeded ? false : undefined,
      weatherRisk: tableNeeded ? "unknown" : "low",
    },
    followUp: {
      photosNeeded: isPublicEvent(kind) || kellyConfirmed,
      contactCollectionNeeded: isPublicEvent(kind) || kind === "houseParty",
      postEventNotesNeeded: true,
      thankYouNeeded: kind === "houseParty" || kellyConfirmed,
      uploadFolderNeeded: isPublicEvent(kind) || kellyConfirmed,
    },
    status,
    staffNextActions: [...staffNextActions],
    notes: kellyConfirmed
      ? "Kelly coverage plan: candidate attends; staff should still cover materials, volunteers, photos, and follow-up."
      : "Kelly not confirmed; campaign coverage should continue through local volunteers, host, table/materials, or staff follow-up.",
  };
}
