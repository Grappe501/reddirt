import type { CampaignEventAttendanceType, CampaignEventType } from "@prisma/client";
import type { EventType } from "@/content/types";

export type PublicEventLane = "community" | "civic" | "campaign";

const TYPE_LABEL: Partial<Record<CampaignEventType, string>> = {
  RALLY: "Community Event",
  APPEARANCE: "Speaking Engagement",
  TRAINING: "Volunteer Training",
  MEETING: "Community Event",
  CANVASS: "Civic/Voter Registration",
  PHONE_BANK: "Civic/Voter Registration",
  FUNDRAISER: "Fundraiser",
  PRESS: "Speaking Engagement",
  DEADLINE: "Civic/Voter Registration",
  ORIENTATION: "Volunteer Training",
  FESTIVAL: "Festival/Fair",
  OTHER: "Community Event",
};

export function formatPublicEventKind(t: CampaignEventType): string {
  return TYPE_LABEL[t] ?? "Event";
}

export function publicLaneForCampaignType(t: CampaignEventType): PublicEventLane {
  switch (t) {
    case "TRAINING":
    case "ORIENTATION":
    case "DEADLINE":
    case "CANVASS":
    case "PHONE_BANK":
      return "civic";
    case "FUNDRAISER":
    case "PRESS":
    case "FESTIVAL":
      return "campaign";
    default:
      return "community";
  }
}

export function publicLaneForMovementType(t: EventType): PublicEventLane {
  switch (t) {
    case "Listening Session":
    case "Direct Democracy Briefing":
    case "Volunteer Training":
      return "civic";
    case "Town Hall":
    case "Immersion":
    case "Labor / Worker Roundtable":
    case "Youth Civic Session":
    case "Fairs and Festivals":
      return "campaign";
    default:
      return "community";
  }
}

export function attendanceCtaLabel(kind: CampaignEventAttendanceType | string | undefined): string {
  switch (kind) {
    case "PUBLIC_OPEN":
    case "PUBLIC_REGISTRATION":
      return "Get Details";
    case "INVITATION":
      return "Invitation details";
    case "PRIVATE":
      return "Details";
    default:
      return "Get Details";
  }
}

export function eventCardTitleHref(event: {
  slug: string;
  detailHref?: string;
  primaryHref?: string;
  linkCardToPrimary?: boolean;
}): string {
  if (event.linkCardToPrimary && event.primaryHref) return event.primaryHref;
  return event.detailHref ?? `/events/${event.slug}`;
}

export function eventCardActionHref(event: {
  slug: string;
  detailHref?: string;
  primaryHref?: string;
}): string {
  return event.primaryHref ?? event.detailHref ?? `/events/${event.slug}`;
}

export function isKellyNotAttending(event: { fieldAttendance?: string }): boolean {
  return event.fieldAttendance === "surrogate";
}

export function isCautionHold(event: { fieldAttendance?: string }): boolean {
  return event.fieldAttendance === "caution";
}

/** Public line for red-border stops: Kelly is not going; send someone if we can. */
export const KELLY_NOT_ATTENDING_COPY =
  "Kelly will not attend. If we can send someone, we will. This is not a speaking engagement.";

/** Public line for caution holds: date is on the calendar; details are incomplete. */
export const CAUTION_HOLD_COPY = "Caution — we need more information before this is a locked stop.";

/** Public line for bright-yellow conflict cards: more than one Kelly stop that day. */
export const SCHEDULE_CONFLICT_COPY =
  "This date has more than one public stop. Confirm which one Kelly is making.";

/** Border + fill for the public event board. Conflict (bright yellow) beats tentative (light orange). */
export function eventBoardChromeClass(
  event: {
    fieldAttendance?: string;
    featured?: boolean;
  },
  scheduleConflict = false,
): string {
  if (event.fieldAttendance === "surrogate") {
    return "border-2 border-red-600 bg-[var(--color-surface-elevated)]";
  }
  if (scheduleConflict) {
    return "border-2 border-yellow-500 bg-yellow-400";
  }
  if (event.fieldAttendance === "tentative") {
    return "border-2 border-orange-300 bg-orange-100";
  }
  if (event.fieldAttendance === "caution") {
    return "border-2 border-amber-500 bg-amber-50";
  }
  if (event.featured) {
    return "border-2 border-kelly-gold/55 bg-[var(--color-surface-elevated)]";
  }
  return "border border-kelly-text/10 bg-[var(--color-surface-elevated)]";
}

export function eventCardCtaLabel(event: {
  primaryCtaLabel?: string;
  statewideVirtual?: boolean;
  fieldAttendance?: string;
  attendanceType?: string;
}): string {
  if (event.primaryCtaLabel) return event.primaryCtaLabel;
  if (event.fieldAttendance === "surrogate") return "View details";
  if (event.fieldAttendance === "caution") return "Need more information";
  if (event.fieldAttendance === "tentative") return "View tentative date";
  return attendanceCtaLabel(event.attendanceType);
}

export function attendanceIsOpenInvite(kind: CampaignEventAttendanceType | string | undefined): boolean {
  return kind === "PUBLIC_OPEN" || kind === "PUBLIC_REGISTRATION";
}

export function attendanceDetailCopy(
  kind: CampaignEventAttendanceType | string | undefined,
  city: string,
): { headline: string; rsvpLabel: string | null; note: string | null } {
  if (kind === "PUBLIC_OPEN" || kind === "PUBLIC_REGISTRATION") {
    return {
      headline: "Come meet Kelly",
      rsvpLabel: kind === "PUBLIC_REGISTRATION" ? "Register" : "Come meet Kelly",
      note: null,
    };
  }
  if (kind === "INVITATION") {
    return {
      headline: `Kelly will be in ${city}`,
      rsvpLabel: null,
      note: "This stop is by invitation. Details for invited guests are on this page when the host publishes them.",
    };
  }
  if (kind === "PRIVATE") {
    return {
      headline: `Kelly will be in ${city}`,
      rsvpLabel: null,
      note: "This is not an open public event.",
    };
  }
  return {
    headline: `Kelly will be in ${city}`,
    rsvpLabel: null,
    note: `Kelly will be in ${city}. This listing is so neighbors can see where the campaign is — it is not an open invite.`,
  };
}
