/** Volunteer form tagged for tabling / representing at third-party local events. */
export const representLocalEventVolunteerHref = "/get-involved?lane=event_representation#volunteer";

/** Volunteer signup with “leadership / captain” interest pre-checked (client-side default only; same `/api/forms` payload shape). */
export const getInvolvedVolunteerCaptainHref = "/get-involved?leadership=1#volunteer";

/** Seven-way pathway grid on Get Involved. */
export const getInvolvedPathwaysHref = "/get-involved#pathways";

/** Public Power of 5 onboarding (trust-first relational path). */
export const powerOf5OnboardingHref = "/onboarding/power-of-5";

/** Gold-sample county dashboard shell (demo / seed data). */
export const countyDashboardSampleHref = "/county-briefings/pope/v2";

export type NavItem = {
  label: string;
  href: string;
};

export type NavGroup = {
  id: string;
  label: string;
  /**
   * When set with **empty** `items`, `NavDesktop` renders a single top-level link (Pass 1 primary nav).
   * When set with non-empty `items`, label links here and ▾ opens the submenu (legacy mega-nav pattern).
   */
  groupLandingHref?: string;
  /** Submenu entries; may be empty when `groupLandingHref` alone defines the target. */
  items: NavItem[];
};

/**
 * Pass 1 — flat primary nav: routes visitors into organizing intelligence, counties, and relational onboarding.
 * Deeper pages (events, news, resources) remain reachable from in-page content and search.
 */
export const primaryNavGroups: NavGroup[] = [
  { id: "home", label: "Home", groupLandingHref: "/", items: [] },
  { id: "about", label: "About", groupLandingHref: "/about", items: [] },
  { id: "priorities", label: "Priorities", groupLandingHref: "/priorities", items: [] },
  { id: "counties", label: "Counties", groupLandingHref: "/counties", items: [] },
  { id: "organize", label: "Organize", groupLandingHref: "/organizing-intelligence", items: [] },
  {
    id: "conversations",
    label: "Stories & voices",
    groupLandingHref: "/messages",
    items: [],
  },
  { id: "involved", label: "Get Involved", groupLandingHref: "/get-involved", items: [] },
];

/** Flatten primary destinations (sitemaps, tests). */
export const allPrimaryNavItems: NavItem[] = primaryNavGroups.flatMap((g) =>
  g.items.length > 0 ? g.items : g.groupLandingHref ? [{ label: g.label, href: g.groupLandingHref }] : [],
);

export const footerNavGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Movement",
    items: [
      { label: "Statewide organizing", href: "/organizing-intelligence" },
      { label: "Start Power of 5", href: powerOf5OnboardingHref },
      { label: "Stories & voices", href: "/messages" },
      { label: "Volunteer & get involved", href: "/get-involved" },
    ],
  },
  {
    title: "Privacy & trust",
    items: [
      { label: "Trust & organizing data", href: "/privacy-and-trust" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms of use", href: "/terms" },
      { label: "Disclaimer", href: "/disclaimer" },
    ],
  },
];
