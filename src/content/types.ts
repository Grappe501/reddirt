export type RegionStatus = "active" | "building" | "coming_soon";

export type RegionPage = {
  slug: string;
  name: string;
  /** Broader area label, e.g. "Central Arkansas" */
  region: string;
  status: RegionStatus;
  summary: string;
  hearing: string[];
  priorityIssues: string[];
  /** Event slugs from `src/content/events` */
  upcomingEventSlugs: string[];
  organizingContactNote: string;
  stories: Array<{ quote: string; attribution?: string }>;
  resourceLinks: Array<{ label: string; href: string }>;
  cta: { primary: { label: string; href: string }; secondary?: { label: string; href: string } };
};

export type EventStatus = "upcoming" | "past";

/**
 * Movement calendar: coverage suggestion vs. human confirmation (fairs & festivals).
 * `surrogate` = stay on the public calendar; Kelly will not attend; red border;
 * send someone if we can; not a speaking engagement.
 * `caution` = stay on the public calendar; yellow border; we need more information.
 */
export type FieldAttendance = "unscheduled" | "suggested" | "tentative" | "confirmed" | "surrogate" | "caution";

/**
 * Public card marks. Unset means not reviewed yet — no chip.
 * Copy is attendee-safe; operators still create Mobilize events by hand.
 */
export type EventMarks = {
  kellyRole?: "speaking" | "present" | "not_attending" | "tba";
  tabling?: "yes" | "planned" | "no";
  volunteers?: "needed" | "shifts_open" | "none";
  mobilize?: "live" | "needed" | "none";
  mobilizeHref?: string;
  volunteerHref?: string;
};

export type EventType =
  | "Town Hall"
  | "Community Conversation"
  | "House Gathering"
  | "Volunteer Training"
  | "Direct Democracy Briefing"
  | "Fairs and Festivals"
  /** Multi-day, overnight stay: deep local time (library hours, county clerk, meals, planning evenings). */
  | "Immersion"
  | "Labor / Worker Roundtable"
  | "Youth Civic Session"
  | "Listening Session";

export type EventItem = {
  slug: string;
  title: string;
  type: EventType;
  /** Must match a label from `listMovementEventRegionFilterLabels()` in `content/arkansas-movement-regions`. */
  region: string;
  /** County slug when tied to a region page, optional */
  countySlug?: string;
  status: EventStatus;
  startsAt: string; // ISO
  endsAt?: string;
  timezone: string;
  locationLabel: string;
  /** City line for public cards when it is shorter than `locationLabel`. */
  city?: string;
  addressLine?: string;
  summary: string;
  description: string;
  whatToExpect: string[];
  whoItsFor: string;
  organizerNote: string;
  /** Future: Mobilize URL — see `src/lib/integrations/mobilize.ts` */
  rsvpHref?: string;
  audienceTags?: string[];
  relatedEventSlugs: string[];
  relatedResourceHrefs: Array<{ label: string; href: string }>;
  /** Approximate map point (usually city center) for the movement /events map. */
  mapCoordinates?: { lat: number; lng: number };
  /** How precise the pin is — calendar fallbacks often use region centroids. */
  mapPinQuality?: "exact" | "region";
  /**
   * Fairs & festivals research / coverage path only (operator). Not used on the public map/cards (Phase 2).
   */
  fieldAttendance?: FieldAttendance;
  /** Default `/events/{slug}`. */
  detailHref?: string;
  primaryHref?: string;
  primaryCtaLabel?: string;
  linkCardToPrimary?: boolean;
  /** CampaignOS attendance kind when merged from the public calendar. */
  attendanceType?: string;
  featured?: boolean;
  featuredLabel?: string;
  featuredSummary?: string;
  statewideVirtual?: boolean;
  qualifiesAsVisit?: boolean;
  campaignTrail?: boolean;
  /** `calendar` when merged from CampaignOS public query; omit for static movement content. */
  eventSource?: "movement" | "calendar";
  /** Prefer Unknown flags — public cards may show Location TBA when coords/county are missing. */
  opsFlags?: {
    missingPublicSummary?: boolean;
    missingCounty?: boolean;
    missingCoordinates?: boolean;
    timeTbd?: boolean;
  };
  /**
   * When true, this event is listed on `/listening-sessions` under “Events planned,” alongside every
   * event whose `type` is `Listening Session`. Set on partner or special-format stops that match the
   * election & ballot-access tour but use another `type` (e.g. Town Hall).
   */
  listeningSessionSeries?: boolean;
  /** Public Mobilize / table / volunteer / Kelly-role chips. Omit until reviewed. */
  marks?: EventMarks;
  /** Collapse weekly series to the next occurrence on Movement lists. */
  recurringSeriesId?: string;
};

export type ResourceItem = {
  slug: string;
  title: string;
  description: string;
  href: string;
  tag?: string;
  /** TODO: wire to CMS or static asset downloads in Script 5 */
  comingSoon?: boolean;
};
