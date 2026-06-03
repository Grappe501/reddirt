"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  campaignOsNavHrefBase,
  resolveActiveCampaignOsNavHref,
} from "@/lib/dashboard-orchestration/campaign-os-nav-config";
import {
  DEBATE_WEEK_EXTENDED_NAV_ITEMS,
  DEBATE_WEEK_NAV_ITEMS,
  DEBATE_WEEK_PRIMARY_NAV_ITEMS,
} from "@/lib/intelligence/debate-week-nav";

const base =
  "rounded border px-2 py-1 text-xs font-semibold transition sm:px-2.5 sm:py-1.5 whitespace-nowrap";
const activeCls = "border-violet-800/40 bg-violet-50 text-violet-950";
const idleCls = "border-kelly-text/15 bg-white text-kelly-slate hover:border-kelly-text/25";
const activePrimaryCls = "border-violet-900/50 bg-violet-100 text-violet-950";

function NavChip({
  item,
  active,
  primary,
}: {
  item: { href: string; label: string; description?: string };
  active: boolean;
  primary?: boolean;
}) {
  return (
    <Link
      href={item.href}
      title={item.description}
      className={`${base} ${active ? (primary ? activePrimaryCls : activeCls) : idleCls}`}
    >
      {item.label}
    </Link>
  );
}

export function IntelligenceDebateSubnav() {
  const pathname = usePathname() ?? "";
  const activeHref = resolveActiveCampaignOsNavHref(
    pathname,
    DEBATE_WEEK_NAV_ITEMS.map((item) => ({ href: item.href })),
  );

  return (
    <nav className="mb-6 space-y-2 border-b border-kelly-text/10 bg-kelly-page/90 pb-3" aria-label="Debate week intelligence">
      <div>
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-900">Your path</p>
        <div className="flex flex-wrap items-center gap-1.5">
          {DEBATE_WEEK_PRIMARY_NAV_ITEMS.map((item) => {
            const basePath = campaignOsNavHrefBase(item.href);
            return (
              <NavChip key={item.href} item={item} active={activeHref === basePath} primary />
            );
          })}
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-kelly-subtle">All tools</p>
        <div className="flex flex-wrap items-center gap-1.5">
          {DEBATE_WEEK_EXTENDED_NAV_ITEMS.map((item) => {
            const basePath = campaignOsNavHrefBase(item.href);
            return <NavChip key={item.href} item={item} active={activeHref === basePath} />;
          })}
        </div>
      </div>
    </nav>
  );
}
