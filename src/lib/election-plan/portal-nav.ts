/** Primary top nav for the Election Plan portal (post-login operator surface). */

export type ElectionPlanPortalNavItem = {
  href: string;
  label: string;
  /** Match only exact path (e.g. War Room home). */
  exact?: boolean;
};

export const ELECTION_PLAN_PORTAL_NAV: ElectionPlanPortalNavItem[] = [
  { href: "/election-plan", label: "Election Plan", exact: true },
  { href: "/election-plan/search", label: "Search" },
  { href: "/election-plan/workbenches", label: "Workbenches" },
  { href: "/election-plan/operators", label: "Operators" },
  { href: "/election-plan/executive-book", label: "Executive Book" },
  { href: "/election-plan/debate-prep", label: "Debate Prep" },
  { href: "/election-plan/opposition-research", label: "Opposition Research" },
];

export function isElectionPlanPortalNavActive(pathname: string, item: ElectionPlanPortalNavItem): boolean {
  const path = pathname.split("?")[0]?.replace(/\/$/, "") || "/election-plan";
  const base = item.href.replace(/\/$/, "") || "/election-plan";
  if (item.exact) return path === base;
  if (base === "/election-plan/debate-prep") {
    return path === base || path.startsWith(`${base}/`);
  }
  if (base === "/election-plan/opposition-research") {
    return path === base || path.startsWith(`${base}/`);
  }
  return path === base || path.startsWith(`${base}/`);
}
