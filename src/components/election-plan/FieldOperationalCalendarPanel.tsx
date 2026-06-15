"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { ExecutiveCalendarEntry } from "@/lib/election-plan/field-event-worksheet-storage";
import {
  buildAllOperationalTasks,
  loadAllWorksheets,
} from "@/lib/election-plan/field-event-worksheet-storage";
import { fieldCalendarHref, fieldEventWorksheetHref } from "@/lib/election-plan/field-calendar-links";
import { cn } from "@/lib/utils";

type Props = {
  entries: ExecutiveCalendarEntry[];
};

export function FieldOperationalCalendarPanel({ entries }: Props) {
  const [refresh, setRefresh] = useState(0);

  const tasks = useMemo(() => {
    void refresh;
    const worksheets = loadAllWorksheets();
    const today = new Date().toISOString().slice(0, 10);
    return buildAllOperationalTasks(entries, worksheets).filter((t) => t.date >= today);
  }, [entries, refresh]);

  const byDate = useMemo(() => {
    const map = new Map<string, typeof tasks>();
    for (const t of tasks) {
      const list = map.get(t.date) ?? [];
      list.push(t);
      map.set(t.date, list);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [tasks]);

  return (
    <section className="mt-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Day-to-day operational calendar</h2>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
            Phone banks, postcards, canvassing, and prep tasks from event worksheets where activations are opted in.
          </p>
        </div>
        <button
          type="button"
          className="rounded-md border border-[var(--ep-border)] bg-white px-3 py-2 text-xs font-semibold"
          onClick={() => setRefresh((n) => n + 1)}
        >
          Refresh
        </button>
      </div>

      {byDate.length === 0 ? (
        <div className="ep-card-glass text-sm text-[var(--ep-navy-muted)]">
          No upcoming operational tasks. Open an event worksheet and opt in to phone bank, postcards, or canvassing.
        </div>
      ) : (
        <div className="space-y-6">
          {byDate.map(([date, dayTasks]) => (
            <div key={date} className="ep-card">
              <h3 className="font-heading font-bold text-[var(--ep-navy)]">
                {new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </h3>
              <ul className="mt-3 space-y-2">
                {dayTasks.map((t) => (
                  <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <div>
                      <span
                        className={cn(
                          "mr-2 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase",
                          t.type === "phoneBank" && "bg-blue-100 text-blue-900",
                          t.type === "postcards" && "bg-amber-100 text-amber-900",
                          t.type === "canvassing" && "bg-emerald-100 text-emerald-900",
                          t.type === "prep" && "bg-[var(--ep-cream)] text-[var(--ep-navy-muted)]",
                          t.type === "event_day" && "bg-[var(--ep-navy)] text-white",
                        )}
                      >
                        {t.type.replace(/_/g, " ")}
                      </span>
                      {t.label}
                    </div>
                    <Link href={fieldEventWorksheetHref(t.eventId)} className="text-xs font-semibold text-[var(--ep-gold)]">
                      Worksheet →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <p className="mt-4 text-xs">
        <Link href={fieldCalendarHref()} className="font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
          ← Back to field calendar
        </Link>
      </p>
    </section>
  );
}
