"use client";

import Link from "next/link";
import type { CalendarSurfaceRow } from "@/lib/campaign-events/load-campaign-calendar-events";
import { buildCountyEventLinkBundle } from "@/lib/county/county-workbench-event-links";

const TYPE_COLORS: Record<string, string> = {
  house_meet_greet: "bg-violet-100 border-violet-400 text-violet-950",
  campaign_event: "bg-kelly-navy/10 border-kelly-navy/30 text-kelly-navy",
  fair_festival: "bg-amber-50 border-amber-500/40 text-amber-950",
  fundraiser: "bg-emerald-50 border-emerald-600/35 text-emerald-900",
  travel: "bg-slate-100 border-slate-400 text-slate-800",
  default: "bg-kelly-wash border-kelly-text/15 text-kelly-text",
};

export function CalendarEventChip({
  row,
  compact,
  onSelect,
}: {
  row: CalendarSurfaceRow;
  compact?: boolean;
  onSelect?: (recordId: string) => void;
}) {
  const color = TYPE_COLORS[row.classification] ?? TYPE_COLORS.default;
  const countyBundle = buildCountyEventLinkBundle(row.county);
  const inner = (
    <div
      className={`rounded-lg border px-2 py-1 font-body ${color} ${compact ? "text-[10px]" : "text-xs"} ${row.surface.isPast ? "opacity-70" : ""}`}
    >
      <div className="flex flex-wrap items-center gap-1">
        {!compact ? <span className="font-bold">{row.timeLabel}</span> : null}
        <span className="font-semibold">{row.calendar.title}</span>
        {row.surface.isTentative ? (
          <span className="rounded bg-white/60 px-1 text-[9px] font-bold uppercase">Tentative</span>
        ) : null}
      </div>
      {!compact && row.likelyCity ? <p className="text-[10px] opacity-80">{row.travelLine}</p> : null}
      {countyBundle ? (
        <p className="text-[10px] opacity-80">
          <Link href={countyBundle.adminBridgeHref} className="font-semibold underline" onClick={(e) => e.stopPropagation()}>
            {countyBundle.displayName}
          </Link>
        </p>
      ) : null}
      {row.surface.alerts.length ? (
        <div className="mt-1 flex flex-wrap gap-0.5">
          {row.surface.alerts.slice(0, 3).map((a) => (
            <span key={a.key} className="rounded bg-white/50 px-1 text-[9px] font-bold uppercase">
              {a.label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );

  if (onSelect) {
    return (
      <button type="button" className="w-full text-left" onClick={() => onSelect(row.recordId)}>
        {inner}
      </button>
    );
  }

  return (
    <Link href={`/admin/campaign-events/${row.recordId}`} className="block">
      {inner}
    </Link>
  );
}
