"use client";

import Link from "next/link";
import { isCampaignOsNavLinkActive } from "@/lib/dashboard-orchestration/campaign-os-nav-config";
import { CAMPAIGN_MANAGER_WORKBENCH_NAME } from "@/lib/admin/campaign-manager-workbench-labels";
import { ADMIN_ELECTION_PLAN_HREF } from "@/lib/election-plan/admin-election-plan-catalog";

/** Primary Campaign Manager shortcuts — Path to Victory near the top of the sidebar. */
const PRIMARY_LINKS = [
  { href: "/admin/ai-command-center", label: CAMPAIGN_MANAGER_WORKBENCH_NAME },
  { href: "/admin/mission-brief", label: "Path to Victory" },
  { href: ADMIN_ELECTION_PLAN_HREF, label: "Election Plan OS" },
] as const;

export function AdminPrimaryNav({ pathname }: { pathname: string }) {
  return (
    <div className="mb-3 border-b border-[var(--border-on-navy)] pb-4">
      <p className="os-nav-group-label px-3 pb-1">Command</p>
      <div className="flex flex-col gap-0.5 px-0">
        {PRIMARY_LINKS.map((link) => {
          const active = isCampaignOsNavLinkActive(pathname, link.href);
          const isPathToVictory = link.href === "/admin/mission-brief";
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`mx-3 flex items-center rounded-lg px-3 py-2.5 font-body text-sm transition ${
                active
                  ? "os-nav-link-active"
                  : isPathToVictory
                    ? "border border-kelly-gold/30 bg-kelly-gold/10 font-semibold text-kelly-inverse hover:bg-kelly-gold/15"
                    : "os-nav-link font-semibold"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export const PATH_TO_VICTORY_ADMIN_HREF = "/admin/mission-brief" as const;
