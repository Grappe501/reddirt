import type { CampaignEventType, Prisma } from "@prisma/client";

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
  eventType: CampaignEventType;
  eventTypeLabel: string;
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
};

export type PublicEventRangePreset = "all_upcoming" | "this_week" | "this_month";

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
  eventType: true,
  county: { select: { displayName: true, slug: true } },
} as const;

export type PublicCampaignEventRow = Prisma.CampaignEventGetPayload<{
  select: typeof publicCampaignEventSelect;
}>;
