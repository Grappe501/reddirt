"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { CommunityRegionHero } from "@/components/dashboard/community/CommunityRegionHero";
import { DashboardCompactFooter } from "@/components/dashboard/vos/DashboardCompactFooter";
import {
  COUNTY_DEMOCRATS_LIVE_NAV,
  countyDemocratsHref,
  resolveCountyDemocratsDashboardLabel,
} from "@/lib/campaign-ops/county-democrats-dashboard-plan";

export function CountyDemocratsShell({
  countySlug,
  countyDisplayName,
  children,
}: {
  countySlug: string;
  /** e.g. "Pulaski County" */
  countyDisplayName: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const dashboardLabel = resolveCountyDemocratsDashboardLabel(pathname, countySlug);
  const regionTitle = `${countyDisplayName} Democratic Party`;
  const base = countyDemocratsHref(countySlug, "");

  const tabIsActive = (href: string) => {
    if (href === base) return pathname === base || pathname === `${base}/`;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-kelly-page">
      <header className="border-b border-kelly-text/10 bg-kelly-fog/30 shadow-[var(--shadow-soft)]">
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-6">
          <CommunityRegionHero
            dashboardLabel={dashboardLabel}
            displayName={regionTitle}
            geography="Arkansas"
            dashboardBasePath={base}
            reviewBadge="County party organizing · VOS integrated"
          />
          <nav
            aria-label="County party dashboard sections"
            className="-mb-px flex gap-1 overflow-x-auto border-t border-kelly-text/10 pt-4"
          >
            {COUNTY_DEMOCRATS_LIVE_NAV.map((t) => {
              const href = countyDemocratsHref(countySlug, t.segment);
              const active = tabIsActive(href);
              return (
                <Link
                  key={t.segment || "overview"}
                  href={href}
                  className={`whitespace-nowrap rounded-t-lg px-3 py-2 font-body text-xs font-semibold md:text-sm ${
                    active
                      ? "bg-kelly-page text-kelly-navy ring-1 ring-kelly-text/15"
                      : "text-kelly-text/70 hover:bg-kelly-fog/80 hover:text-kelly-navy"
                  }`}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8 md:px-6">{children}</main>
      <DashboardCompactFooter />
    </div>
  );
}
