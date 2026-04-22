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

/** Movement calendar: coverage suggestion vs. human confirmation (fairs & festivals). */
export type FieldAttendance = "unscheduled" | "suggested" | "tentative" | "confirmed";

export type EventType =
  | "Town Hall"
  | "Community Conversation"
  | "House Gathering"
  | "Volunteer Training"
  | "Direct Democracy Briefing"
  | "Fairs and Festivals"
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
  /**
   * Fairs & festivals only. Card + map: default white (`unscheduled`), coverage optimizer → orange (`suggested`),
   * staff intent → blue (`tentative`) or green (`confirmed`). Non-festivals may omit.
   */
  fieldAttendance?: FieldAttendance;
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
