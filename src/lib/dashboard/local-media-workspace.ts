/** Local media / advertising inventory for city and county teams (VOS Social lane, mature work). */

export type LocalMediaOutletType =
  | "newspaper"
  | "radio"
  | "tv"
  | "podcast"
  | "community-newsletter"
  | "chamber-newsletter"
  | "school-publication"
  | "college-publication"
  | "hs-publication-ads"
  | "facebook-group"
  | "event-calendar"
  | "local-ads"
  | "print-shop-bulletin"
  | "other";

export const LOCAL_MEDIA_OUTLET_TYPE_LABELS: Record<LocalMediaOutletType, string> = {
  newspaper: "Local newspaper",
  radio: "Radio station",
  tv: "TV station",
  podcast: "Local podcast",
  "community-newsletter": "Community newsletter",
  "chamber-newsletter": "Chamber newsletter",
  "school-publication": "School publication",
  "college-publication": "College publication",
  "hs-publication-ads": "High school pub (ad space)",
  "facebook-group": "Local Facebook group/page",
  "event-calendar": "Local event calendar",
  "local-ads": "Local ad opportunity",
  "print-shop-bulletin": "Print shop / bulletin board",
  other: "Other",
};

export type TriState = "yes" | "maybe" | "no" | "tbd";

export type LocalMediaOutletRow = {
  id: string;
  outletName: string;
  outletType: LocalMediaOutletType;
  contactPerson?: string;
  phoneOrEmail?: string;
  interviewOpportunity?: TriState;
  advertisingOpportunity?: TriState;
  notes?: string;
};

/** Kelly / Steve (schedule permitting) visit workflow — weekday daytime outreach. */
export type LocalMediaVisitRow = {
  id: string;
  outletName: string;
  contactPerson?: string;
  phoneOrEmail?: string;
  outletType: LocalMediaOutletType;
  interviewOpportunity?: TriState;
  advertisingOpportunity?: TriState;
  visitRequested?: boolean;
  visitScheduled?: string;
  followUpNeeded?: boolean;
};

/** Checklist: every outlet category teams should eventually map (copy into your sheet). */
export const LOCAL_MEDIA_LIST_CHECKLIST: string[] = [
  "Local newspapers",
  "Radio stations",
  "TV stations",
  "Local podcasts",
  "Community newsletters",
  "Chamber newsletters",
  "School publications",
  "College publications",
  "High school publications that sell ad space",
  "Local Facebook groups/pages",
  "Local event calendars",
  "Local ad opportunities",
  "Local print shops / bulletin boards (where appropriate)",
];

export const MOCK_LOCAL_MEDIA_OUTLETS: LocalMediaOutletRow[] = [
  {
    id: "lm-o-1",
    outletName: "Creek County Weekly",
    outletType: "newspaper",
    contactPerson: "News desk",
    phoneOrEmail: "newsroom@example.invalid",
    interviewOpportunity: "maybe",
    advertisingOpportunity: "yes",
    notes: "Ask upstream before paid placement.",
  },
  {
    id: "lm-o-2",
    outletName: "KRKT Community Radio",
    outletType: "radio",
    contactPerson: "Programming",
    interviewOpportunity: "yes",
    advertisingOpportunity: "tbd",
  },
];

export const MOCK_LOCAL_MEDIA_VISITS: LocalMediaVisitRow[] = [
  {
    id: "lm-v-1",
    outletName: "Creek County Weekly",
    outletType: "newspaper",
    contactPerson: "Editor",
    phoneOrEmail: "editor@example.invalid",
    interviewOpportunity: "yes",
    advertisingOpportunity: "maybe",
    visitRequested: true,
    visitScheduled: "TBD — confirm with HQ",
    followUpNeeded: true,
  },
];
