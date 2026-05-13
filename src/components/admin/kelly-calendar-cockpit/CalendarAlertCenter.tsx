"use client";

import { markCalendarAlertRead } from "@/app/admin/calendar-command-center/cockpit-actions";
import type { CalendarAlertDto } from "@/lib/calendar/kelly-cockpit-types";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

type Props = { alerts: CalendarAlertDto[] };

export function CalendarAlertCenter({ alerts }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="mt-4 rounded-lg border border-kelly-text/12 bg-white shadow-sm">
      <p className="border-b border-kelly-text/10 px-3 py-2 font-heading text-[10px] font-bold uppercase tracking-wider text-kelly-text/50">
        Alerts
      </p>
      <ul className="max-h-64 divide-y divide-kelly-text/8 overflow-auto">
        {alerts.length === 0 ? (
          <li className="px-3 py-3 font-body text-xs text-kelly-text/55">No active alerts.</li>
        ) : (
          alerts.slice(0, 40).map((a) => (
            <li key={a.id} className="px-3 py-2">
              <p className="font-body text-xs font-semibold text-kelly-text">{a.title}</p>
              <p className="mt-0.5 line-clamp-2 font-body text-[10px] text-kelly-text/65">{a.body}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={pending}
                  className="rounded border border-kelly-text/20 px-2 py-0.5 font-body text-[10px] font-semibold"
                  onClick={() =>
                    start(async () => {
                      await markCalendarAlertRead(a.id);
                      router.refresh();
                    })
                  }
                >
                  Dismiss
                </button>
                <a
                  href={`/admin/calendar-command-center/event/${encodeURIComponent(a.calendarItemId)}`}
                  className="rounded border border-kelly-text/20 px-2 py-0.5 font-body text-[10px] font-semibold text-kelly-text"
                >
                  Open
                </a>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
