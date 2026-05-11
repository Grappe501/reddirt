"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { CommunityRegionHero } from "@/components/dashboard/community/CommunityRegionHero";
import { DashboardCompactFooter } from "@/components/dashboard/vos/DashboardCompactFooter";
import {
  MUSLIM_COMMUNITY_DASHBOARD_BASE,
  MUSLIM_LIVE_DASHBOARD_NAV,
  muslimDashboardHref,
  resolveMuslimDashboardLabel,
} from "@/lib/campaign-ops/muslim-community-dashboard-plan";

export function CommunityRegionMuslimShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const dashboardLabel = resolveMuslimDashboardLabel(pathname);

  const tabIsActive = (href: string) => {
    if (href === MUSLIM_COMMUNITY_DASHBOARD_BASE) {
      return pathname === href || pathname === `${href}/`;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-kelly-page">
      <header className="border-b border-kelly-text/10 bg-kelly-fog/30 shadow-[var(--shadow-soft)]">
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-6">
          <CommunityRegionHero
            dashboardLabel={dashboardLabel}
            displayName="Muslim Community Region"
            geography="Arkansas"
            dashboardBasePath={MUSLIM_COMMUNITY_DASHBOARD_BASE}
          />
          <nav aria-label="Community region sections" className="-mb-px flex gap-1 overflow-x-auto border-t border-kelly-text/10 pt-4">
            {MUSLIM_LIVE_DASHBOARD_NAV.map((t) => {
              const href = muslimDashboardHref(t.segment);
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
