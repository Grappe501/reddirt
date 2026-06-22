"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  ELECTION_PLAN_PORTAL_NAV,
  isElectionPlanPortalNavActive,
} from "@/lib/election-plan/portal-nav";

export function ElectionPlanPortalNav() {
  const pathname = usePathname() ?? "/election-plan";

  return (
    <nav className="ep-portal-nav" aria-label="Election Plan sections">
      {ELECTION_PLAN_PORTAL_NAV.map((item) => {
        const active = isElectionPlanPortalNavActive(pathname, item);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="ep-portal-nav-link"
            data-active={active ? "true" : "false"}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
