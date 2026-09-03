"use client";

import Link from "next/link";
import type { CalendarSurfaceRow } from "@/lib/campaign-events/load-campaign-calendar-events";
import { buildCountyEventLinkBundle } from "@/lib/county/county-workbench-event-links";
import { cal } from "./calendar-ui/calendar-design-tokens";

const ALERT_TONE: Record<string, string> = {
  red: "bg-red-100 text-red-800",
  yellow: "bg-yellow-400 text-yellow-950",
  amber: "bg-amber-100 text-amber-900",
  orange: "bg-orange-100 text-orange-800",
  blue: "bg-sky-100 text-sky-900",
  green: "bg-emerald-100 text-emerald-800",
  slate: "bg-zinc-100 text-zinc-700",
  navy: "bg-kelly-navy/10 text-kelly-navy",
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
  const typeStyle = cal.eventType[row.classification] ?? cal.eventType.default;
  const countyBundle = buildCountyEventLinkBundle(row.county);
  const boardStyle = row.hasConflictWarning
    ? "border-yellow-500 bg-yellow-400"
    : row.surface.isTentative
      ? "border-orange-300 bg-orange-100"
      : typeStyle;

  const inner = (
    <div
      className={`group/chip rounded-lg border border-l-[3px] px-2 py-1.5 font-body shadow-sm transition hover:-translate-y-px hover:shadow-md ${boardStyle} ${compact ? "text-[10px]" : "text-xs"} ${row.surface.isPast ? "opacity-65" : ""}`}
    >
      <div className="flex flex-wrap items-center gap-1">
        {!compact ? <span className="font-bold tabular-nums text-kelly-navy/80">{row.timeLabel}</span> : null}
        <span className="font-semibold text-kelly-navy">{row.calendar.title}</span>
        {row.surface.isTentative ? (
          <span className="rounded-full bg-white/80 px-1.5 py-0.5 text-[9px] font-bold uppercase text-kelly-muted">Tentative</span>
        ) : null}
      </div>
      {!compact && row.likelyCity ? (
        <p className="mt-0.5 text-[10px] text-kelly-muted">{row.travelLine}</p>
      ) : null}
      {countyBundle ? (
        <p className="text-[10px] text-kelly-muted">
          <Link href={countyBundle.adminBridgeHref} className="font-semibold text-kelly-navy underline" onClick={(e) => e.stopPropagation()}>
            {countyBundle.displayName}
          </Link>
        </p>
      ) : null}
      {row.surface.alerts.length ? (
        <div className="mt-1 flex flex-wrap gap-0.5">
          {row.surface.alerts.slice(0, 3).map((a) => (
            <span key={a.key} className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${ALERT_TONE[a.tone] ?? ALERT_TONE.slate}`}>
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
