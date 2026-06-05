"use client";

import { usePathname } from "next/navigation";
import { IntelligenceNavLink } from "@/components/admin/intelligence/IntelligenceNavLink";
import {
  campaignOsNavHrefBase,
  resolveActiveCampaignOsNavHref,
} from "@/lib/dashboard-orchestration/campaign-os-nav-config";
import { describeDebateWeekRoute, getDebateWeekNavItems } from "@/lib/intelligence/debate-week-nav";
import { buildThreeLaneNavGroups, THREE_LANE_NAV, type ThreeLaneId } from "@/lib/intelligence/v4/threeLaneNav";

const base =
  "rounded border px-2 py-1 text-xs font-semibold transition sm:px-2.5 sm:py-1.5 whitespace-nowrap";
const idleCls = "border-kelly-text/15 bg-white text-kelly-slate hover:border-kelly-text/25";

function NavChip({
  item,
  active,
  laneId,
}: {
  item: { href: string; label: string; description?: string };
  active: boolean;
  laneId: ThreeLaneId;
}) {
  const lane = THREE_LANE_NAV[laneId];
  const activeCls = `${lane.chipClass} ring-1 ring-inset ring-black/5 font-bold`;

  return (
    <IntelligenceNavLink
      href={item.href}
      title={item.description}
      variant="chip"
      className={`${base} ${active ? activeCls : idleCls}`}
    >
      {item.label}
    </IntelligenceNavLink>
  );
}

export function IntelligenceDebateSubnav() {
  const pathname = usePathname() ?? "";
  const groups = buildThreeLaneNavGroups();
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
      {groups.map((group) => {
        const laneId = group.id as ThreeLaneId;
        const lane = THREE_LANE_NAV[laneId];
        if (!lane || !group.links.length) return null;
        return (
          <div key={group.id}>
            <p className={`mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] ${lane.chipClass} inline-block rounded px-1.5 py-0.5`}>
              {lane.label}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {group.links.map((link) => {
                const basePath = campaignOsNavHrefBase(link.href);
                return (
                  <NavChip
                    key={link.href}
                    item={{ href: link.href, label: link.label }}
                    active={activeHref === basePath}
                    laneId={laneId}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
