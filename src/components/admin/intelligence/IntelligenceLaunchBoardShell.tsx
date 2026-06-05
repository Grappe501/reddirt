"use client";

import type { ReactNode } from "react";
import { adminLogoutAction } from "@/lib/admin/admin-auth-actions";
import { CampaignPaidForBar } from "@/components/layout/CampaignPaidForBar";
import { IntelligenceNavLink } from "@/components/admin/intelligence/IntelligenceNavLink";
import {
  campaignOsNavHrefBase,
  resolveActiveCampaignOsNavHref,
} from "@/lib/dashboard-orchestration/campaign-os-nav-config";
import { buildLaunchSidebarNavGroups } from "@/lib/intelligence/debate-week-nav";

/**
 * Minimal admin chrome for debate launch — grouped sidebar with Phase A command track visible.
 */
export function IntelligenceLaunchBoardShell({
  children,
  currentPathname = "/admin/intelligence",
}: {
  children: ReactNode;
  currentPathname?: string;
}) {
  const path = currentPathname.split("?")[0] ?? "/admin/intelligence";
  const groups = buildLaunchSidebarNavGroups();

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)] text-kelly-text">
      <aside className="flex w-[min(100%,280px)] flex-col border-r border-[var(--border-on-navy)] bg-kelly-text text-kelly-inverse">
        <div className="border-b border-[var(--border-on-navy)] px-4 py-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-kelly-inverse-muted">Debate week</p>
          <p className="mt-2 font-heading text-base font-bold leading-tight">Intelligence workbench</p>
          <p className="mt-2 text-[10px] leading-relaxed text-kelly-inverse-muted">
            Phase A command track pinned at top — diligence, Field Book, dossiers, build progress.
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-3 overflow-y-auto px-2 py-3" aria-label="Debate week">
          {groups.map((group) => {
            const activeHref = resolveActiveCampaignOsNavHref(
              path,
              group.links.map((link) => ({ href: link.href })),
            );
            return (
              <div key={group.id}>
                <p className="px-2 pb-1 text-[9px] font-bold uppercase tracking-[0.18em] text-kelly-inverse-muted">
                  {group.label}
                </p>
                <div className="flex flex-col gap-0.5">
                  {group.links.map((link) => {
                    const base = campaignOsNavHrefBase(link.href);
                    const active = activeHref === base;
                    return (
                      <IntelligenceNavLink
                        key={link.href}
                        href={link.href}
                        variant="sidebar"
                        className={`rounded-md px-3 py-2 font-body text-sm font-medium transition ${
                          active
                            ? "bg-kelly-page/15 text-kelly-page"
                            : "text-kelly-inverse-soft hover:bg-kelly-page/10 hover:text-kelly-page"
                        }`}
                      >
                        {link.label}
                      </IntelligenceNavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
        <div className="border-t border-[var(--border-on-navy)] p-3">
          <form action={adminLogoutAction}>
            <button
              type="submit"
              className="w-full rounded-md border border-[var(--border-on-navy)] px-3 py-2 font-body text-xs font-semibold uppercase tracking-wider text-kelly-inverse transition hover:bg-white/10"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
        <div className="border-t border-kelly-border bg-kelly-wash px-4 py-3 lg:px-8">
          <CampaignPaidForBar variant="light" />
        </div>
      </div>
    </div>
  );
}
