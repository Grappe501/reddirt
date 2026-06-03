"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  campaignOsNavHrefBase,
  resolveActiveCampaignOsNavHref,
} from "@/lib/dashboard-orchestration/campaign-os-nav-config";
import { DEBATE_WEEK_NAV_ITEMS } from "@/lib/intelligence/debate-week-nav";

const base =
  "rounded border px-2 py-1 text-xs font-semibold transition sm:px-2.5 sm:py-1.5 whitespace-nowrap";
const activeCls = "border-violet-800/40 bg-violet-50 text-violet-950";
const idleCls = "border-kelly-text/15 bg-white text-kelly-slate hover:border-kelly-text/25";

export function IntelligenceDebateSubnav() {
  const pathname = usePathname() ?? "";
  const activeHref = resolveActiveCampaignOsNavHref(
    pathname,
    DEBATE_WEEK_NAV_ITEMS.map((item) => ({ href: item.href })),
  );

  return (
    <nav
      className="mb-6 flex flex-wrap items-center gap-1.5 border-b border-kelly-text/10 bg-kelly-page/90 pb-3"
      aria-label="Debate week intelligence"
    >
      {DEBATE_WEEK_NAV_ITEMS.map((item) => {
        const basePath = campaignOsNavHrefBase(item.href);
        const active = activeHref === basePath;
        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.description}
            className={`${base} ${active ? activeCls : idleCls}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
