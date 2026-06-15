"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { ElectionPlanWorkbenchSnapshot } from "@/lib/election-plan/types";
import { fieldEventWorksheetHref, fieldOperationalCalendarHref } from "@/lib/election-plan/field-calendar-links";
import { cn } from "@/lib/utils";

import { FieldOperationalCalendarPanel } from "@/components/election-plan/FieldOperationalCalendarPanel";

type Props = { data: ElectionPlanWorkbenchSnapshot };

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{subtitle}</p> : null}
    </div>
  );
}

export function FieldCalendarPanel({ data }: Props) {
  const cal = data.executiveCalendar;
  const [filter, setFilter] = useState<"all" | "past_visit" | "locked" | "scheduled" | "proposed">("all");

  const filtered = filter === "all" ? cal.entries : cal.entries.filter((e) => e.category === filter);

  const byMonth = useMemo(() => {
    return filtered.reduce<Record<string, typeof filtered>>((acc, e) => {
      const month = e.startDate.slice(0, 7);
      if (!acc[month]) acc[month] = [];
      acc[month].push(e);
      return acc;
    }, {});
  }, [filtered]);

  const categoryLabel: Record<string, string> = {
    past_visit: "Past visit",
    locked: "Locked",
    scheduled: "Scheduled",
    proposed: "Proposed",
  };

  const categoryClass: Record<string, string> = {
    past_visit: "bg-slate-100 text-slate-700",
    locked: "bg-[var(--ep-navy)] text-white",
    scheduled: "bg-emerald-100 text-emerald-800",
    proposed: "bg-amber-100 text-amber-900",
  };

  return (
    <section>
      <SectionTitle
        title="Executive Field Calendar"
        subtitle="Click any entry for full event worksheet — run of day, messaging, activations, logistics"
      />

      <div className="ep-warning mb-8">
        <p className="text-sm font-medium">{cal.disclaimer}</p>
        <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
          Reference date {cal.referenceDate}. Each event opens a field worksheet (saves in browser). Opt-in activations
          flow to the{" "}
          <Link href={fieldOperationalCalendarHref()} className="font-semibold text-[var(--ep-gold)] hover:underline">
            operational calendar
          </Link>
          .
        </p>
      </div>

      <div className="mb-8 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{cal.summary.pastVisitCount}</div>
          <div className="ep-stat-label">Past visits</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{cal.summary.lockedCount}</div>
          <div className="ep-stat-label">Locked backbone</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{cal.summary.scheduledCount}</div>
          <div className="ep-stat-label">Scheduled</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{cal.summary.proposedCount}</div>
          <div className="ep-stat-label">Proposed (Phase C)</div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {(
          [
            ["all", "All"],
            ["past_visit", "Past"],
            ["locked", "Locked"],
            ["scheduled", "Scheduled"],
            ["proposed", "Proposed"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              filter === id
                ? "border-[var(--ep-navy)] bg-[var(--ep-navy)] text-white"
                : "border-[var(--ep-border)] bg-white text-[var(--ep-navy-muted)] hover:border-[var(--ep-navy)]",
            )}
            onClick={() => setFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="ep-card-glass text-sm text-[var(--ep-navy-muted)]">No calendar entries.</div>
      ) : (
        <div className="space-y-8">
          {Object.entries(byMonth)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, rows]) => (
              <div key={month}>
                <h3 className="mb-3 font-heading text-lg font-bold text-[var(--ep-navy)]">
                  {new Date(`${month}-01T12:00:00`).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-[var(--ep-border)] text-xs uppercase text-[var(--ep-navy-muted)]">
                        <th className="py-2 pr-3">Date</th>
                        <th className="py-2 pr-3">Event</th>
                        <th className="py-2 pr-3">County</th>
                        <th className="py-2 pr-3">Type</th>
                        <th className="py-2 pr-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((e) => (
                        <tr key={e.id} className="border-b border-[var(--ep-border)] hover:bg-[var(--ep-cream)]/50">
                          <td className="py-2 pr-3 whitespace-nowrap">
                            <Link href={fieldEventWorksheetHref(e.id)} className="block hover:text-[var(--ep-gold)]">
                              {e.endDate && e.endDate !== e.startDate
                                ? `${e.startDate} → ${e.endDate}`
                                : e.startDate}
                            </Link>
                          </td>
                          <td className="py-2 pr-3">
                            <Link href={fieldEventWorksheetHref(e.id)} className="block font-medium hover:text-[var(--ep-gold)]">
                              {e.label}
                              {e.city ? (
                                <div className="text-xs font-normal text-[var(--ep-navy-muted)]">{e.city}</div>
                              ) : null}
                            </Link>
                          </td>
                          <td className="py-2 pr-3">{e.county.replace(/ County$/i, "")}</td>
                          <td className="py-2 pr-3">
                            <span
                              className={cn(
                                "inline-block rounded px-2 py-0.5 text-xs font-medium",
                                categoryClass[e.category],
                              )}
                            >
                              {categoryLabel[e.category]}
                            </span>
                          </td>
                          <td className="py-2 pr-3 text-xs text-[var(--ep-navy-muted)]">
                            <Link href={fieldEventWorksheetHref(e.id)} className="hover:text-[var(--ep-navy)]">
                              Worksheet →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
        </div>
      )}

      <FieldOperationalCalendarPanel entries={cal.entries} />
    </section>
  );
}
