import { getCampaignBlogUrl, getJoinCampaignHref } from "@/config/external-campaign";

/** Volunteer form tagged for tabling / representing at third-party local events. */
export const representLocalEventVolunteerHref = "/get-involved?lane=event_representation#volunteer";

/** Volunteer signup with “leadership / captain” interest pre-checked (client-side default only; same `/api/forms` payload shape). */
export const getInvolvedVolunteerCaptainHref = "/get-involved?leadership=1#volunteer";

/** Public Power of 5 onboarding (trust-first relational path). */
export const powerOf5OnboardingHref = "/onboarding/power-of-5";

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

/** Top nav per blueprint: compact groups + Donate as distinct control in header */
export const primaryNavGroups: NavGroup[] = [
  {
    id: "meet",
    label: "Meet Kelly",
    groupLandingHref: "/about",
    items: [
      { label: "About Kelly", href: "/about" },
      { label: "Understand the office", href: "/understand" },
      { label: "What we stand for", href: "/what-we-believe" },
    ],
  },
  {
    id: "office",
    label: "The Office",
    items: [
      { label: "Priorities", href: "/priorities" },
      { label: "Civic depth", href: "/civic-depth" },
      { label: "Ballot access & initiatives", href: "/direct-democracy" },
      { label: "How initiatives reach the ballot", href: "/direct-democracy/ballot-initiative-process" },
      { label: "Resources", href: "/resources" },
    ],
  },
  {
    id: "news",
    label: "News",
    items: [
      { label: "From the Road", href: "/from-the-road" },
      { label: "Press coverage", href: "/press-coverage" },
      { label: "Stories", href: "/stories" },
      { label: "Editorial", href: "/editorial" },
      { label: "Kelly’s Substack", href: getCampaignBlogUrl() },
    ],
  },
  {
    id: "events",
    label: "Events",
    groupLandingHref: "/events",
    items: [
      { label: "Events hub & calendar", href: "/events" },
      { label: "Represent us locally", href: representLocalEventVolunteerHref },
      { label: "Host a gathering", href: "/host-a-gathering" },
      { label: "Election listening sessions", href: "/listening-sessions" },
      { label: "From the Road", href: "/from-the-road" },
      { label: "Suggest a public event", href: "/events#suggest" },
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
      { label: "Events", href: "/events" },
      { label: "Represent at local events", href: representLocalEventVolunteerHref },
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
