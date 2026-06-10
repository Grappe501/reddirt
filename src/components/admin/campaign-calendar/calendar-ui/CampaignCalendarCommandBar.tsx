"use client";

import type { CalendarSurfaceStats } from "./compute-calendar-surface-stats";
import { cal } from "./calendar-design-tokens";

const KPIS: {
  key: keyof CalendarSurfaceStats;
  label: string;
  format: (s: CalendarSurfaceStats) => string;
  alert?: (s: CalendarSurfaceStats) => boolean;
}[] = [
  { key: "upcomingEvents", label: "Upcoming", format: (s) => String(s.upcomingEvents) },
  { key: "needsApproval", label: "Needs approval", format: (s) => String(s.needsApproval), alert: (s) => s.needsApproval > 0 },
  { key: "tentativeEvents", label: "Tentative", format: (s) => String(s.tentativeEvents) },
  { key: "conflictEvents", label: "Conflicts", format: (s) => String(s.conflictEvents), alert: (s) => s.conflictEvents > 0 },
  { key: "uniqueCounties", label: "Counties touched", format: (s) => String(s.uniqueCounties) },
];

export function CampaignCalendarCommandBar({ stats }: { stats: CalendarSurfaceStats }) {
  return (
    <div className={cal.kpiBar} role="group" aria-label="Calendar metrics">
      {KPIS.map((kpi) => {
        const value = kpi.format(stats);
        const isAlert = kpi.alert?.(stats);
        return (
          <div
            key={kpi.key}
            className={`${cal.kpiCard} ${isAlert ? "border-amber-400/40 bg-gradient-to-br from-amber-50/80 to-white" : ""}`}
          >
            <p className={cal.kpiLabel}>{kpi.label}</p>
            <p className={`${cal.kpiValue} ${isAlert ? "text-amber-900" : ""}`}>{value}</p>
          </div>
        );
      })}
    </div>
  );
}
