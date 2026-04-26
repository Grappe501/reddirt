import { getCampaignBlogUrl, getJoinCampaignHref } from "@/config/external-campaign";

/** Volunteer form tagged for tabling / representing at third-party local events. */
export const representLocalEventVolunteerHref = "/get-involved?lane=event_representation#volunteer";

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

/**
 * Pass 02 — top nav: Home, About, Priorities, Blog, Counties, Get Involved.
 * “Get Involved” reflects four canonical pathways (volunteer, county, candidate, events) plus shared hubs.
 */
export const primaryNavGroups: NavGroup[] = [
  {
    id: "home",
    label: "Home",
    groupLandingHref: "/",
    items: [{ label: "Home", href: "/" }],
  },
  {
    id: "about",
    label: "About",
    groupLandingHref: "/about",
    items: [
      { label: "Meet Kelly — full story", href: "/about" },
      { label: "Understand the office", href: "/understand" },
      { label: "What we stand for", href: "/what-we-believe" },
    ],
  },
  {
    id: "priorities",
    label: "Priorities",
    groupLandingHref: "/priorities",
    items: [
      { label: "Priorities for the office", href: "/priorities" },
      { label: "Civic depth", href: "/civic-depth" },
      { label: "Ballot access & initiatives", href: "/direct-democracy" },
      { label: "How initiatives reach the ballot", href: "/direct-democracy/ballot-initiative-process" },
      { label: "Resources & toolkits", href: "/resources" },
    ],
  },
  {
    id: "blog",
    label: "Blog",
    groupLandingHref: "/blog",
    items: [
      { label: "Campaign blog", href: "/blog" },
      { label: "Substack (direct)", href: getCampaignBlogUrl() },
      { label: "Stories", href: "/stories" },
      { label: "Editorial", href: "/editorial" },
      { label: "From the Road", href: "/from-the-road" },
      { label: "Press coverage", href: "/press-coverage" },
    ],
  },
  {
    id: "counties",
    label: "Counties",
    groupLandingHref: "/counties",
    items: [
      { label: "All counties", href: "/counties" },
      { label: "Local organizing", href: "/local-organizing" },
      { label: "Start a local team", href: "/start-a-local-team" },
    ],
  },
  {
    id: "involved",
    label: "Get Involved",
    groupLandingHref: "/get-involved",
    items: [
      { label: "Start as a Volunteer", href: getJoinCampaignHref() },
      { label: "Lead in Your County", href: "/local-organizing" },
      { label: "Run for Office — toolkits", href: "/resources" },
      { label: "Events", href: "/events" },
      { label: "Command HQ (all ways in)", href: "/get-involved" },
      { label: "Voter registration", href: "/voter-registration" },
      { label: "Host a gathering", href: "/host-a-gathering" },
      { label: "Listening sessions", href: "/listening-sessions" },
      { label: "Represent at local events", href: representLocalEventVolunteerHref },
    ],
  },
];

export const allPrimaryNavItems: NavItem[] = primaryNavGroups.flatMap((g) => g.items);

/** Footer mirrors primary pathways; compliance block unchanged in SiteFooter. */
export const footerNavGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "About",
    items: [...primaryNavGroups[1].items],
  },
  {
    title: "Priorities & issues",
    items: [...primaryNavGroups[2].items],
  },
  {
    title: "Blog & news",
    items: [
      { label: "Campaign blog", href: "/blog" },
      { label: "Stories", href: "/stories" },
      { label: "Editorial", href: "/editorial" },
      { label: "From the Road", href: "/from-the-road" },
      { label: "Press coverage", href: "/press-coverage" },
      { label: "Substack (direct)", href: getCampaignBlogUrl() },
    ],
  },
  {
    title: "Ways to plug in",
    items: [
      { label: "Start as a Volunteer", href: getJoinCampaignHref() },
      { label: "Lead in Your County", href: "/local-organizing" },
      { label: "Run for Office — toolkits", href: "/resources" },
      { label: "Events", href: "/events" },
      { label: "Counties", href: "/counties" },
      { label: "Donate", href: "/donate" },
    ],
  },
];
