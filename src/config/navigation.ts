import {
  ballotInitiativeProcessHref,
  directDemocracyCommitmentHref,
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
 * Mobile drawer group order (psychology: field activity before news cycle).
 * Desktop primary nav: Meet Kelly → Direct Democracy → The Office → News → Events → Get Involved.
 */
export const primaryNavMobileDrawerGroupOrder = [
  "meet",
  "direct-democracy",
  "office",
  "events",
  "news",
  "involved",
] as const;

/**
 * Top nav — one home per destination (Pathway Nav Simplify).
 * Campaign Videos live under Meet Kelly only. Invite Kelly lives under Events only.
 * News reading set: From the Road + Press (+ Substack in footer).
 */
export const primaryNavGroups: NavGroup[] = [
  {
    id: "meet",
    label: "Meet Kelly",
    groupLandingHref: "/about",
    items: [
      { label: "Meet Kelly", href: "/about" },
      { label: "Kelly Across Arkansas", href: "/about/journey" },
      { label: "Community & Civic Work", href: "/about/community" },
      { label: "Why I'm Running", href: "/about/why-im-running" },
      { label: "Initiatives & petitions", href: kellyInitiativesChapterHref },
      { label: "Campaign Videos", href: "/kelly-speaks" },
      { label: "Campaign Photos", href: "/campaign-photos" },
      { label: "Endorsements", href: "/endorsements" },
      { label: "Priorities", href: "/priorities" },
    ],
  },
  {
    id: "direct-democracy",
    label: "Direct Democracy",
    groupLandingHref: directDemocracyHubHref,
    items: [
      { label: "Direct Democracy hub", href: directDemocracyHubHref },
      { label: "Ballot initiative process", href: ballotInitiativeProcessHref },
      { label: "Commitment network", href: directDemocracyCommitmentHref },
      { label: "Kelly's petition organizing", href: kellyInitiativesChapterHref },
    ],
  },
  {
    id: "office",
    label: "The Office",
    groupLandingHref: "/understand",
    items: [
      { label: "Understand the Office", href: "/understand" },
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
    id: "news",
    label: "News",
    groupLandingHref: "/from-the-road",
    items: [
      { label: "From the Road", href: "/from-the-road" },
      { label: "Press Coverage", href: "/press-coverage" },
    ],
  },
  {
    id: "events",
    label: "Events",
    groupLandingHref: "/events",
    items: [
      { label: "Events", href: "/events" },
      { label: "Arkansas Presence", href: "/arkansas" },
      { label: "Invite Kelly", href: "/events/request" },
      { label: "Suggest a public event", href: "/events#suggest" },
      { label: "Election Integrity Tour", href: "/events/community-election-integrity-tour" },
      { label: "County Fairs", href: "/events/county-fairs" },
      { label: "County Party Meetings", href: "/events/county-party-meetings" },
      { label: "Listening Sessions", href: "/listening-sessions" },
    ],
  },
  {
    id: "involved",
    label: "Get Involved",
    groupLandingHref: "/get-involved",
    items: [
      { label: "Stay connected", href: "/get-involved#join" },
      { label: "Volunteer", href: "/get-involved#volunteer" },
      { label: "Bring 5 Friends", href: "/get-involved/bring-5" },
      { label: "Start a Local Team", href: "/start-a-local-team" },
      { label: "Donate", href: "/donate" },
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
    title: "Direct Democracy",
    items: [...(navGroupById("direct-democracy")?.items ?? [])],
  },
  {
    title: "The Office",
    items: [...(navGroupById("office")?.items ?? [])],
  },
  {
    title: "News & events",
    items: [
      { label: "From the Road", href: "/from-the-road" },
      { label: "Press Coverage", href: "/press-coverage" },
      { label: "Kelly’s Substack", href: getCampaignBlogUrl() },
      { label: "Events", href: "/events" },
      { label: "Invite Kelly", href: "/events/request" },
      { label: "Host a gathering", href: "/host-a-gathering" },
      { label: "Listening sessions", href: "/listening-sessions" },
    ],
  },
  {
    title: "Get involved",
    items: [
      { label: "Stay connected", href: "/get-involved#join" },
      { label: "Volunteer", href: "/get-involved#volunteer" },
      { label: "Bring 5 Friends", href: "/get-involved/bring-5" },
      { label: "Start a Local Team", href: "/start-a-local-team" },
      { label: "Represent at local events", href: representLocalEventVolunteerHref },
      { label: "Donate", href: "/donate" },
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
    ],
  },
];
