"use client";

import { usePathname } from "next/navigation";
import { IntelligenceNavLink } from "@/components/admin/intelligence/IntelligenceNavLink";
import {
  campaignOsNavHrefBase,
  resolveActiveCampaignOsNavHref,
} from "@/lib/dashboard-orchestration/campaign-os-nav-config";
import {
  DEBATE_WEEK_EXTENDED_NAV_ITEMS,
  describeDebateWeekRoute,
  getDebateWeekNavItems,
  getDebateWeekPrimaryNavItems,
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
    <IntelligenceNavLink
      href={item.href}
      title={item.description}
      variant="chip"
      className={`${base} ${active ? (primary ? activePrimaryCls : activeCls) : idleCls}`}
    >
      {item.label}
    </IntelligenceNavLink>
  );
}

export function IntelligenceDebateSubnav() {
  const pathname = usePathname() ?? "";
  const primaryItems = getDebateWeekPrimaryNavItems();
  const allNavItems = getDebateWeekNavItems();
  const activeHref = resolveActiveCampaignOsNavHref(
    pathname,
    allNavItems.map((item) => ({ href: item.href })),
  );

  const routeGuide = describeDebateWeekRoute(pathname);

  return (
    <nav className="mb-6 space-y-2 border-b border-kelly-text/10 bg-kelly-page/90 pb-3" aria-label="Debate week intelligence">
      {routeGuide ? (
        <p className="rounded-lg border border-sky-100 bg-sky-50/50 px-3 py-2 text-xs leading-relaxed text-sky-950">
          <span className="font-bold uppercase text-sky-900">This screen: </span>
          {routeGuide}
        </p>
      ) : null}
      <div>
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-900">Your path</p>
        <div className="flex flex-wrap items-center gap-1.5">
          {primaryItems.map((item) => {
            const basePath = campaignOsNavHrefBase(item.href);
            return <NavChip key={item.href} item={item} active={activeHref === basePath} primary />;
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
