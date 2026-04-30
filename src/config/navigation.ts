import { getCampaignBlogUrl, getJoinCampaignHref } from "@/config/external-campaign";

export type NavItem = {
  label: string;
  href: string;
};

export type NavGroup = {
  id: string;
  label: string;
  /**
   * When set, the group label is a direct link (e.g. Meet Kelly → /about). The ▾ control still opens the full
   * submenu so “Understand the office” and siblings stay one click away.
   */
  groupLandingHref?: string;
  items: NavItem[];
};

/** Volunteer form tagged for tabling / representing at third-party local events. */
export const representLocalEventVolunteerHref = "/get-involved?lane=event_representation#volunteer";

/** Volunteer signup with “leadership / captain” interest pre-checked (client-side default only; same `/api/forms` payload shape). */
export const getInvolvedVolunteerCaptainHref = "/get-involved?leadership=1#volunteer";

/** Public Power of 5 onboarding (trust-first relational path). */
export const powerOf5OnboardingHref = "/onboarding/power-of-5";

/** Voter registration center (citizenship CTA in header + trust-funnel homepage). */
export const voterRegistrationHref = "/voter-registration";

/**
 * Mobile drawer group order (psychology: field activity before news cycle).
 * Desktop primary nav order stays Meet Kelly → The Office → News → Events → Get Involved.
 */
export const primaryNavMobileDrawerGroupOrder = ["meet", "office", "events", "news", "involved"] as const;

/** Top nav: substance-first mega groups + utility actions (Vote, Volunteer, Donate) in SiteHeader */
export const primaryNavGroups: NavGroup[] = [
  {
    id: "meet",
    label: "Meet Kelly",
    groupLandingHref: "/about",
    items: [
      { label: "Meet Kelly", href: "/about" },
      { label: "Why Kelly", href: "/about/why-kelly" },
      { label: "Her Story", href: "/about/story" },
      { label: "Experience & Leadership", href: "/about/business" },
      { label: "Family & Community", href: "/about/forevermost" },
    ],
  },
  {
    id: "office",
    label: "The Office",
    items: [
      { label: "Understand the Office", href: "/understand" },
      { label: "Elections", href: "/office/elections" },
      { label: "Business & Filings", href: "/office/business" },
      { label: "Transparency & Records", href: "/office/records" },
      { label: "Capitol & Public Safety", href: "/office/capitol" },
      { label: "Why This Race Matters", href: "/office/why-this-race-matters" },
    ],
  },
  {
    id: "news",
    label: "News",
    items: [
      { label: "From the Road", href: "/from-the-road" },
      { label: "Press Coverage", href: "/press-coverage" },
      { label: "Campaign Updates", href: "/updates" },
      { label: "Editorial", href: "/editorial" },
      { label: "Explainers", href: "/explainers" },
    ],
  },
  {
    id: "events",
    label: "Events",
    groupLandingHref: "/events",
    items: [
      { label: "Campaign Calendar", href: "/events" },
      { label: "Request Kelly", href: "/events/request" },
      { label: "County Fairs", href: "/events/county-fairs" },
      { label: "County Party Meetings", href: "/events/county-party-meetings" },
      { label: "Listening Sessions", href: "/listening-sessions" },
    ],
  },
  {
    id: "involved",
    label: "Get Involved",
    items: [
      { label: "Volunteer sign-up", href: getJoinCampaignHref() },
      { label: "Voter registration", href: "/voter-registration" },
      { label: "Stay Connected", href: "/get-involved" },
      { label: "Election listening sessions", href: "/listening-sessions" },
      { label: "Local organizing", href: "/local-organizing" },
      { label: "County planning briefings", href: "/county-briefings" },
      { label: "Host a gathering", href: "/host-a-gathering" },
      { label: "Start a local team", href: "/start-a-local-team" },
    ],
  },
];

export const allPrimaryNavItems: NavItem[] = primaryNavGroups.flatMap((g) => g.items);

export const footerNavGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Meet Kelly",
    items: [...primaryNavGroups[0].items],
  },
  {
    title: "The Office",
    items: [
      ...primaryNavGroups[1].items,
      { label: "Explainers", href: "/explainers" },
    ],
  },
  {
    title: "News & action",
    items: [
      ...primaryNavGroups[2].items,
      { label: "Stories", href: "/stories" },
      { label: "Kelly’s Substack", href: getCampaignBlogUrl() },
      { label: "Events", href: "/events" },
      { label: "Represent at local events", href: representLocalEventVolunteerHref },
      { label: "Host a gathering", href: "/host-a-gathering" },
      { label: "Suggest a public event", href: "/events#suggest" },
      { label: "Election listening sessions", href: "/listening-sessions" },
      { label: "Get involved", href: "/get-involved" },
      { label: "Donate", href: "/donate" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms of use", href: "/terms" },
      { label: "Disclaimer", href: "/disclaimer" },
    ],
  },
];
