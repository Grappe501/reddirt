import {
  ballotInitiativeProcessHref,
  directDemocracyHubHref,
  kellyInitiativesChapterHref,
} from "@/config/direct-democracy-links";
import { getCampaignBlogUrl } from "@/config/external-campaign";

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

/** Public Power of 5 / Bring 5 path (trust-first relational — not a soft redirect to About). */
export const powerOf5OnboardingHref = "/get-involved/bring-5";

/** Voter registration center (citizenship CTA in header + trust-funnel homepage). */
export const voterRegistrationHref = "/voter-registration";

/**
 * Mobile drawer group order.
 * Desktop primary nav: Meet Kelly → My Plan → The Office → The People's Voice → From the Road → Get Involved.
 */
export const primaryNavMobileDrawerGroupOrder = [
  "meet",
  "plan",
  "office",
  "peoples-voice",
  "road",
  "involved",
] as const;

/**
 * Top nav — Kelly Grappe Website Master Direction:
 * Meet Kelly · My Plan · The Office · The People's Voice · From the Road · Get Involved
 */
export const primaryNavGroups: NavGroup[] = [
  {
    id: "meet",
    label: "Meet Kelly",
    groupLandingHref: "/about",
    items: [
      { label: "Meet Kelly", href: "/about" },
      { label: "Professional experience", href: "/about/experience" },
      { label: "Why I'm Running", href: "/about/why-im-running" },
      { label: "Kelly Across Arkansas", href: "/about/journey" },
      { label: "Community & Civic Work", href: "/about/community" },
      { label: "Campaign Videos", href: "/kelly-speaks" },
      { label: "Campaign Photos", href: "/campaign-photos" },
      { label: "Endorsements", href: "/endorsements" },
    ],
  },
  {
    id: "plan",
    label: "My Plan",
    groupLandingHref: "/priorities",
    items: [
      { label: "My Plan", href: "/priorities" },
      { label: "Restore Trust", href: "/priorities#restore-trust" },
      { label: "The People's Constitutional Voice", href: "/priorities#peoples-voice" },
      { label: "Support All 75 Counties", href: "/priorities#counties" },
      { label: "Transparency", href: "/priorities#transparency" },
      { label: "Election Processes", href: "/priorities#election-processes" },
      { label: "A More Engaged Arkansas", href: "/priorities#engagement" },
      { label: "Business Services", href: "/priorities#business" },
    ],
  },
  {
    id: "office",
    label: "The Office",
    groupLandingHref: "/understand",
    items: [
      { label: "What the Office Does", href: "/understand" },
      { label: "Elections", href: "/office/elections" },
      { label: "Business & Filings", href: "/office/business" },
      { label: "Notaries", href: "/office/notaries" },
      { label: "Transparency & Records", href: "/office/records" },
      { label: "Capitol & Public Safety", href: "/office/capitol" },
      { label: "Why This Race Matters", href: "/office/why-this-race-matters" },
      { label: "Explainers", href: "/explainers" },
    ],
  },
  {
    id: "peoples-voice",
    label: "The People's Voice",
    groupLandingHref: directDemocracyHubHref,
    items: [
      { label: "Learn How Direct Democracy Works", href: ballotInitiativeProcessHref },
      { label: "The People's Voice hub", href: directDemocracyHubHref },
      { label: "Kelly's petition organizing", href: kellyInitiativesChapterHref },
    ],
  },
  {
    id: "road",
    label: "From the Road",
    groupLandingHref: "/from-the-road",
    items: [
      { label: "From the Road", href: "/from-the-road" },
      { label: "Press Coverage", href: "/press-coverage" },
      { label: "Events", href: "/events" },
      { label: "Across Arkansas", href: "/arkansas-visits" },
      { label: "Invite Kelly", href: "/events/request" },
      { label: "Listening Sessions", href: "/listening-sessions" },
    ],
  },
  {
    id: "involved",
    label: "Get Involved",
    groupLandingHref: "/get-involved",
    items: [
      { label: "Power of 5", href: "/get-involved/bring-5" },
      { label: "Power of 5 Workshop Materials", href: "/volunteer/resources/power-of-5-workshop" },
      { label: "Volunteer", href: "/get-involved#volunteer" },
      { label: "Host Kelly", href: "/events/request" },
      { label: "Stay connected", href: "/get-involved#join" },
      { label: "Start a Local Team", href: "/start-a-local-team" },
      { label: "Donate", href: "/donate" },
      { label: "Register / Check Registration", href: voterRegistrationHref },
    ],
  },
];

export const allPrimaryNavItems: NavItem[] = primaryNavGroups.flatMap((g) => g.items);

const navGroupById = (id: string) => primaryNavGroups.find((g) => g.id === id);

export const footerNavGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Meet Kelly",
    items: [...(navGroupById("meet")?.items ?? [])],
  },
  {
    title: "The People's Voice",
    items: [...(navGroupById("peoples-voice")?.items ?? [])],
  },
  {
    title: "The Office",
    items: [...(navGroupById("office")?.items ?? [])],
  },
  {
    title: "From the Road",
    items: [
      { label: "From the Road", href: "/from-the-road" },
      { label: "Press Coverage", href: "/press-coverage" },
      { label: "Kelly’s Substack", href: getCampaignBlogUrl() },
      { label: "Events", href: "/events" },
      { label: "Across Arkansas", href: "/arkansas-visits" },
      { label: "Invite Kelly", href: "/events/request" },
      { label: "Host a gathering", href: "/host-a-gathering" },
      { label: "Listening sessions", href: "/listening-sessions" },
    ],
  },
  {
    title: "Get involved",
    items: [
      { label: "Power of 5", href: "/get-involved/bring-5" },
      { label: "Power of 5 Workshop Materials", href: "/volunteer/resources/power-of-5-workshop" },
      { label: "Stay connected", href: "/get-involved#join" },
      { label: "Volunteer", href: "/get-involved#volunteer" },
      { label: "Host Kelly", href: "/events/request" },
      { label: "Start a Local Team", href: "/start-a-local-team" },
      { label: "Represent at local events", href: representLocalEventVolunteerHref },
      { label: "Donate", href: "/donate" },
      { label: "Español", href: "/es" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
      { label: "Accessibility", href: "/accessibility" },
      { label: "Terms of use", href: "/terms" },
      { label: "Disclaimer", href: "/disclaimer" },
      { label: "Español", href: "/es" },
    ],
  },
];
