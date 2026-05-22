"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const VIEWS = [
  ["Timeline", "/admin/campaign-calendar/timeline"],
  ["Month", "/admin/campaign-calendar/month"],
  ["Week", "/admin/campaign-calendar/week"],
  ["Day", "/admin/campaign-calendar/day"],
  ["Agenda", "/admin/campaign-calendar/agenda"],
] as const;

export function CampaignCalendarNav({ eventCount }: { eventCount: number }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap items-center gap-2 rounded-2xl border border-kelly-text/10 bg-kelly-wash p-3" aria-label="Campaign calendar views">
      {VIEWS.map(([label, href]) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={`rounded-full px-3 py-1.5 font-body text-xs font-bold transition ${
              active ? "border border-kelly-navy bg-kelly-navy text-white" : "border border-kelly-text/10 bg-kelly-page text-kelly-text/75 hover:border-kelly-navy/30"
            }`}
          >
            {label}
          </Link>
        );
      })}
      <Link
        href="/admin/campaign-events/travel-report?month=2026-03"
        className="rounded-full border border-kelly-text/10 bg-kelly-page px-3 py-1.5 font-body text-xs font-semibold text-kelly-navy"
      >
        Travel report
      </Link>
      <Link href="/admin/candidate-dashboard" className="rounded-full border border-kelly-text/10 bg-kelly-page px-3 py-1.5 font-body text-xs font-semibold text-kelly-text/75">
        Candidate
      </Link>
      <Link href="/admin/campaign-manager-dashboard" className="rounded-full border border-kelly-text/10 bg-kelly-page px-3 py-1.5 font-body text-xs font-semibold text-kelly-text/75">
        CM
      </Link>
      <span className="ml-auto font-body text-xs text-kelly-subtle">{eventCount} events · pilot data</span>
    </nav>
  );
}
