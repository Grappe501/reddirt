"use client";

import type { ReactNode } from "react";
import { adminLogoutAction } from "@/lib/admin/admin-auth-actions";
import { CampaignPaidForBar } from "@/components/layout/CampaignPaidForBar";
import { IntelligenceNavLink } from "@/components/admin/intelligence/IntelligenceNavLink";
import { NavNewLinksBanner } from "@/components/admin/intelligence/NavNewLinksBanner";
import { IntelligencePrepSearchBar } from "@/components/admin/intelligence/IntelligencePrepSearchBar";
import { isCandidateIpadMode } from "@/lib/intelligence/candidateIpadMode";
import {
  campaignOsNavHrefBase,
  resolveActiveCampaignOsNavHref,
} from "@/lib/dashboard-orchestration/campaign-os-nav-config";
import { AdminPrimaryNav } from "@/components/admin/navigation/AdminPrimaryNav";
import { buildThreeLaneNavGroups, THREE_LANE_NAV, type ThreeLaneId } from "@/lib/intelligence/v4/threeLaneNav";

/**
 * Minimal admin chrome for debate launch — three-lane sidebar with teal new-link tracking.
 */
export function IntelligenceLaunchBoardShell({
  children,
  currentPathname = "/admin/intelligence",
}: {
  children: ReactNode;
  currentPathname?: string;
}) {
  const path = currentPathname.split("?")[0] ?? "/admin/intelligence";
  const groups = buildThreeLaneNavGroups();
  const candidateIpad = isCandidateIpadMode();

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)] text-kelly-text">
      <aside className="flex w-[min(100%,280px)] flex-col border-r border-[var(--border-on-navy)] bg-kelly-text text-kelly-inverse">
        <div className="border-b border-[var(--border-on-navy)] px-4 py-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-kelly-inverse-muted">Debate week</p>
          <p className="mt-2 font-heading text-base font-bold leading-tight">Intelligence workbench</p>
          <p className="mt-2 text-[10px] leading-relaxed text-kelly-inverse-muted">
            Phase D · three lanes — teal = new this deploy until visited.
          </p>
        </div>
        <div className="border-b border-[var(--border-on-navy)] px-3 py-3">
          {candidateIpad ? (
            <p className="rounded-md border border-emerald-400/40 bg-emerald-500/10 px-2.5 py-2 text-[10px] font-semibold leading-relaxed text-emerald-100">
              Search is in the main panel — indigo bar under the header, or tap Search · Ctrl+K
            </p>
          ) : (
            <IntelligencePrepSearchBar variant="sidebar" />
          )}
        </div>
        <div className="border-b border-[var(--border-on-navy)] px-2 py-2">
          <NavNewLinksBanner compact />
        </div>
        <nav className="flex flex-1 flex-col gap-3 overflow-y-auto px-2 py-3" aria-label="Debate week">
          <AdminPrimaryNav pathname={path} />
          {groups.map((group) => {
            const laneMeta = THREE_LANE_NAV[group.id as ThreeLaneId];
            const activeHref = resolveActiveCampaignOsNavHref(
              path,
              group.links.map((link) => ({ href: link.href })),
            );
            return (
              <div key={group.id}>
                <p
                  className={`px-2 pb-1 text-[9px] font-bold uppercase tracking-[0.18em] ${laneMeta?.sidebarLabelClass ?? "text-kelly-inverse-muted"}`}
                >
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
