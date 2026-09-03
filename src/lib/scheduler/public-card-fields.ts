import type { EventMarks, FieldAttendance } from "@/content/types";

export const FIELD_ATTENDANCE_VALUES = ["tentative", "confirmed", "surrogate", "caution"] as const;
export const KELLY_ROLE_VALUES = ["speaking", "present", "not_attending", "tba"] as const;
export const TABLING_VALUES = ["yes", "planned", "no"] as const;
export const VOLUNTEERS_VALUES = ["needed", "shifts_open", "none"] as const;
export const MOBILIZE_VALUES = ["live", "needed", "none"] as const;

export type PublicFieldAttendance = (typeof FIELD_ATTENDANCE_VALUES)[number];
export type PublicKellyRole = (typeof KELLY_ROLE_VALUES)[number];
export type PublicTabling = (typeof TABLING_VALUES)[number];
export type PublicVolunteers = (typeof VOLUNTEERS_VALUES)[number];
export type PublicMobilize = (typeof MOBILIZE_VALUES)[number];

export type SchedulerPublicCard = {
  fieldAttendance: PublicFieldAttendance | null;
  kellyRole: PublicKellyRole | null;
  tabling: PublicTabling | null;
  volunteers: PublicVolunteers | null;
  mobilize: PublicMobilize | null;
  mobilizeHref: string | null;
  volunteerHref: string | null;
  needsMoreInfo: boolean;
};

function pick<T extends string>(raw: string | null | undefined, allowed: readonly T[]): T | null {
  if (!raw) return null;
  return (allowed as readonly string[]).includes(raw) ? (raw as T) : null;
}

export function cardFromRow(row: {
  publicFieldAttendance?: string | null;
  publicKellyRole?: string | null;
  publicTabling?: string | null;
  publicVolunteers?: string | null;
  publicMobilize?: string | null;
  publicMobilizeHref?: string | null;
  publicVolunteerHref?: string | null;
  schedulerNeedsMoreInfo?: boolean | null;
}): SchedulerPublicCard {
  return {
    fieldAttendance: pick(row.publicFieldAttendance, FIELD_ATTENDANCE_VALUES),
    kellyRole: pick(row.publicKellyRole, KELLY_ROLE_VALUES),
    tabling: pick(row.publicTabling, TABLING_VALUES),
    volunteers: pick(row.publicVolunteers, VOLUNTEERS_VALUES),
    mobilize: pick(row.publicMobilize, MOBILIZE_VALUES),
    mobilizeHref: row.publicMobilizeHref?.trim() || null,
    volunteerHref: row.publicVolunteerHref?.trim() || null,
    needsMoreInfo: Boolean(row.schedulerNeedsMoreInfo),
  };
}

export function cardToEventMarks(card: SchedulerPublicCard): EventMarks | undefined {
  if (!card.kellyRole && !card.tabling && !card.volunteers && !card.mobilize) return undefined;
  return {
    kellyRole: card.kellyRole ?? undefined,
    tabling: card.tabling ?? undefined,
    volunteers: card.volunteers ?? undefined,
    mobilize: card.mobilize ?? undefined,
    mobilizeHref: card.mobilizeHref ?? undefined,
    volunteerHref: card.volunteerHref ?? undefined,
  };
}

export function cardToFieldAttendance(card: SchedulerPublicCard): FieldAttendance | undefined {
  return card.fieldAttendance ?? undefined;
}

export function emptyCard(): SchedulerPublicCard {
  return {
    fieldAttendance: null,
    kellyRole: null,
    tabling: null,
    volunteers: null,
    mobilize: null,
    mobilizeHref: null,
    volunteerHref: null,
    needsMoreInfo: false,
  };
}

export function parseOptionalHref(raw: string | null | undefined): string | null {
  const v = raw?.trim() ?? "";
  if (!v) return null;
  if (!v.startsWith("https://") && !v.startsWith("http://") && !v.startsWith("/")) return null;
  if (v.startsWith("//")) return null;
  return v.slice(0, 500);
}
