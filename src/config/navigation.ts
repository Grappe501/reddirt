import { getCampaignBlogUrl, getJoinCampaignHref } from "@/config/external-campaign";

export type NavItem = {
  label: string;
  href: string;
};

export type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

/** Top nav per blueprint: compact groups + Donate as distinct control in header */
export const primaryNavGroups: NavGroup[] = [
  {
    id: "meet",
    label: "Meet Kelly",
    items: [
      { label: "About", href: "/about" },
      { label: "What we stand for", href: "/what-we-believe" },
      { label: "Why we're running", href: "/why-this-movement" },
      { label: "The Arkansas we know", href: "/the-arkansas-we-know" },
    ],
  },
  {
    id: "office",
    label: "The Office",
    items: [
      { label: "Priorities", href: "/priorities" },
      { label: "Ballot access & initiatives", href: "/direct-democracy" },
      { label: "Resources", href: "/resources" },
    ],
  },
  {
    id: "plan",
    label: "The Plan",
    items: [
      { label: "See the plan", href: "/priorities" },
      { label: "Explainers", href: "/explainers" },
      { label: "Editorial", href: "/editorial" },
    ],
  },
  {
    id: "news",
    label: "News",
    items: [
      { label: "Watch Kelly", href: "/watch" },
      { label: "From the Road", href: "/from-the-road" },
      { label: "Campaign trail", href: "/updates" },
      { label: "Stories", href: "/stories" },
      { label: "Notebook", href: "/blog" },
      { label: "Substack (direct)", href: getCampaignBlogUrl() },
    ],
  },
  {
    id: "involved",
    label: "Get Involved",
    items: [
      { label: "Volunteer · KellyGrappe.com", href: getJoinCampaignHref() },
      { label: "Voter registration", href: "/voter-registration" },
      { label: "Tools & sign-up (this site)", href: "/get-involved" },
      { label: "Events", href: "/events" },
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
    title: "The Office & plan",
    items: [
      ...primaryNavGroups[1].items,
      { label: "Explainers", href: "/explainers" },
    ],
  },
  {
    title: "News & act",
    items: [
      ...primaryNavGroups[3].items,
      { label: "Get involved", href: "/get-involved" },
      { label: "Donate", href: "/donate" },
    ],
  },
];
