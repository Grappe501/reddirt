"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Team } from "@/types/dashboard";
import { resolveTeamDashboardLabel } from "@/lib/dashboard/dashboard-labels";
import { fieldDirectorHref } from "@/lib/field-structure/field-dashboard-paths";
import { TeamDashboardHero } from "@/components/dashboard/vos/TeamDashboardHero";
import { DashboardCompactFooter } from "@/components/dashboard/vos/DashboardCompactFooter";

type TabItem = { href: string; label: string };

export function TeamDashboardChrome({
  team,
  teamSlug,
  viewerUserId,
  children,
}: {
  team: Team;
  teamSlug: string;
  viewerUserId?: string | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const base = `/dashboard/team/${teamSlug}`;

  const tabs: TabItem[] = [
    { href: base, label: "Overview" },
    { href: `${base}/social-media`, label: "Social media" },
    { href: `${base}/events`, label: "Events" },
    { href: `${base}/power-of-5`, label: "Power of 5 / VR" },
    { href: `${base}/youth-outreach`, label: "Youth (P5/VR)" },
    { href: `${base}/metrics`, label: "Metrics" },
    { href: `${base}/training`, label: "Training" },
    { href: `${base}/resources`, label: "Resources" },
    { href: `${base}/messages`, label: "Messages" },
  ];

  const tabIsActive = (href: string) => {
    if (href === base) return pathname === base || pathname === `${base}/`;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const dashboardLabel = resolveTeamDashboardLabel(pathname, teamSlug);

  return (
    <div className="flex min-h-screen flex-col bg-kelly-page">
      <header className="border-b border-kelly-text/10 bg-kelly-fog/30 shadow-[var(--shadow-soft)]">
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-6">
          <TeamDashboardHero
            team={team}
            teamSlug={teamSlug}
            dashboardLabel={dashboardLabel}
            viewerUserId={viewerUserId}
          />
          <nav aria-label="Team sections" className="-mb-px flex gap-1 overflow-x-auto border-t border-kelly-text/10 pt-4">
            {tabs.map((t) => {
              const active = tabIsActive(t.href);
              return (
                <Link
                  key={t.href}
                  href={t.href}
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
          <p className="font-body text-xs text-kelly-text/65">
            <Link href={fieldDirectorHref()} className="font-semibold text-kelly-navy underline-offset-2 hover:underline">
              Field command center
            </Link>{" "}
            — statewide director, regional boards, and county drill-down (preview).
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8 md:px-6">{children}</main>
      <DashboardCompactFooter />
    </div>
  );
}
