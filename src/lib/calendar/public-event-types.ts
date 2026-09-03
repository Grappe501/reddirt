import type { CampaignEventAttendanceType, CampaignEventType, Prisma } from "@prisma/client";

/** Default display grouping for the public site (Arkansas field program). */
export const PUBLIC_CALENDAR_DEFAULT_TZ = "America/Chicago";

export type PublicVenueMode = "virtual" | "in_person" | "unspecified";

/**
 * Public-safe event payload for the website. No internal staff fields.
 * Source of truth: CampaignOS (Prisma) with gating in query layer.
 */
export type PublicCampaignEvent = {
  id: string;
  slug: string;
  title: string;
  publicSummary: string | null;
  startAt: Date;
  endAt: Date;
  timezone: string;
  locationName: string | null;
  address: string | null;
  city: string | null;
  attendanceType: CampaignEventAttendanceType;
  eventType: CampaignEventType;
  /** Public-facing kind (Community Event, Festival/Fair, …) — never staff purpose. */
  eventTypeLabel: string;
  publicKindLabel: string;
  county: { displayName: string; slug: string } | null;
  venueMode: PublicVenueMode;
  /** Reserved for a future public tag field; currently empty. */
  publicTags: string[];
  detailHref: string;
  joinCampaignHref: string;
  /** “RSVP / details” — always the canonical public detail page for this slice. */
  primaryAction: { label: string; href: string };
  /** “Volunteer / join” — campaign-wide join touchpoint. */
  secondaryAction: { label: string; href: string };
  publicFieldAttendance?: string | null;
  publicKellyRole?: string | null;
  publicTabling?: string | null;
  publicVolunteers?: string | null;
  publicMobilize?: string | null;
  publicMobilizeHref?: string | null;
  publicVolunteerHref?: string | null;
};

export type PublicEventRangePreset = "all_upcoming" | "this_week" | "this_month" | "all";

export type PublicEventListFilters = {
  countySlug?: string | null;
  eventType?: CampaignEventType | null;
  range?: PublicEventRangePreset | null;
  /** Inclusive, ISO YYYY-MM-DD in `PUBLIC_CALENDAR_DEFAULT_TZ` (interpreted by query helpers). */
  dateFrom?: string | null;
  dateTo?: string | null;
  venueMode?: PublicVenueMode | "all" | null;
  /** 1–12 + year for month view overlap filter */
  monthYear?: { year: number; month: number } | null;
};

/**
 * Prisma `select` shape for public list/detail — add fields here only if public-safe.
 */
export const publicCampaignEventSelect = {
  id: true,
  slug: true,
  title: true,
  publicSummary: true,
  startAt: true,
  endAt: true,
  timezone: true,
  locationName: true,
  address: true,
  city: true,
  attendanceType: true,
  eventType: true,
  county: { select: { displayName: true, slug: true } },
  publicFieldAttendance: true,
  publicKellyRole: true,
  publicTabling: true,
  publicVolunteers: true,
  publicMobilize: true,
  publicMobilizeHref: true,
  publicVolunteerHref: true,
} as const;

export type PublicCampaignEventRow = Prisma.CampaignEventGetPayload<{
  select: typeof publicCampaignEventSelect;
}>;
