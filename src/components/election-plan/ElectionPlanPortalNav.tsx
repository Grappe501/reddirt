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
    <nav className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1" aria-label="Election Plan sections">
      {ELECTION_PLAN_PORTAL_NAV.map((item, index) => {
        const active = isElectionPlanPortalNavActive(pathname, item);
        return (
          <span key={item.href} className="inline-flex items-center gap-2">
            {index > 0 ? (
              <span className="hidden text-[var(--ep-navy-muted)] sm:inline" aria-hidden>
                ·
              </span>
            ) : null}
            <Link
              href={item.href}
              className={`text-xs font-semibold transition ${
                active
                  ? "text-[var(--ep-navy)] underline decoration-[var(--ep-gold)] decoration-2 underline-offset-4"
                  : "text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]"
              }`}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
