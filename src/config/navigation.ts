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

/** Top nav per blueprint: compact groups + Donate as distinct control in header */
export const primaryNavGroups: NavGroup[] = [
  {
    id: "meet",
    label: "Meet Kelly",
    groupLandingHref: "/about",
    items: [
      { label: "About (full story)", href: "/about" },
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
      { label: "Substack (direct)", href: getCampaignBlogUrl() },
    ],
  },
  {
    id: "involved",
    label: "Get Involved",
    items: [
      { label: "Volunteer sign-up", href: getJoinCampaignHref() },
      { label: "Voter registration", href: "/voter-registration" },
      { label: "Stay Connected", href: "/get-involved" },
      { label: "Events", href: "/events" },
      { label: "Election listening sessions", href: "/listening-sessions" },
      { label: "Local organizing", href: "/local-organizing" },
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
    title: "News & act",
    items: [
      ...primaryNavGroups[2].items,
      { label: "Election listening sessions", href: "/listening-sessions" },
      { label: "Get involved", href: "/get-involved" },
      { label: "Donate", href: "/donate" },
    ],
  },
];
