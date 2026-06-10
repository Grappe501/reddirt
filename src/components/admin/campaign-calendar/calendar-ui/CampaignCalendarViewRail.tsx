"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CALENDAR_VIEWS, cal } from "./calendar-design-tokens";

export function CampaignCalendarViewRail({ eventCount }: { eventCount: number }) {
  const pathname = usePathname();

  return (
    <nav className={cal.viewRail} aria-label="Calendar views">
      {CALENDAR_VIEWS.map((view) => {
        const active = pathname === view.href || pathname.startsWith(`${view.href}/`);
        return (
          <Link
            key={view.href}
            href={view.href}
            className={active ? cal.viewPillActive : cal.viewPill}
            title={view.desc}
          >
            {view.label}
          </Link>
        );
      })}
      <span className="ml-auto hidden font-body text-[11px] text-kelly-muted sm:inline">
        {eventCount} events · pilot ledger
      </span>
    </nav>
  );
}
