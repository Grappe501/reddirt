import Link from "next/link";

import type { ExecutiveCalendarEntry } from "@/lib/election-plan/field-event-worksheet-storage";
import { fieldEventWorksheetHref } from "@/lib/election-plan/field-calendar-links";
import type {
  LocationCalendarBinding,
  LocationEventApproval,
} from "@/lib/election-plan/location-calendar-binding";
import { eventApprovalsHref } from "@/lib/election-plan/location-links";
import { cn } from "@/lib/utils";

type Props = {
  binding: LocationCalendarBinding;
  locationLabel: string;
  countyName: string;
  cityName?: string;
};

function revisitClass(status: string): string {
  if (status === "locked_planned") return "bg-emerald-100 text-emerald-900";
  if (status === "revisit_unscheduled") return "bg-amber-100 text-amber-900";
  if (status === "needs_schedule") return "bg-red-100 text-red-900";
  return "bg-[var(--ep-cream)] text-[var(--ep-navy-muted)]";
}

function approvalStatusClass(status: string): string {
  if (status === "declined") return "bg-red-100 text-red-900";
  if (status === "verified") return "bg-emerald-100 text-emerald-900";
  if (status === "kelly" || status === "both") return "bg-blue-100 text-blue-900";
  return "bg-[var(--ep-cream)] text-[var(--ep-navy-muted)]";
}

function ApprovalRow({ item, countyName, cityName }: { item: LocationEventApproval; countyName: string; cityName?: string }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--ep-border)] py-2 last:border-0 text-sm">
      <div>
        <p className="font-medium text-[var(--ep-navy)]">{item.title}</p>
        <p className="text-xs text-[var(--ep-navy-muted)]">{item.date}</p>
      </div>
      <span className={cn("rounded px-2 py-0.5 text-[10px] font-bold uppercase", approvalStatusClass(item.status))}>
        {item.status}
      </span>
    </li>
  );
}

function LockedVisitCard({ entry }: { entry: ExecutiveCalendarEntry }) {
  return (
    <div className="rounded-lg border border-[var(--ep-navy)]/20 bg-[var(--ep-cream)]/40 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-gold)]">
        Next {entry.category === "locked" ? "locked" : "scheduled"} visit
      </p>
      <p className="mt-1 font-semibold text-[var(--ep-navy)]">{entry.label}</p>
      <p className="text-sm text-[var(--ep-navy-muted)]">
        {entry.startDate}
        {entry.city && entry.city !== "TBD" ? ` · ${entry.city}` : ""} · {entry.county} County
      </p>
      <Link href={fieldEventWorksheetHref(entry.id)} className="ep-chapter-link mt-2 inline-block text-xs">
        Event worksheet →
      </Link>
    </div>
  );
}

export function LocationCalendarBindingPanel({ binding, locationLabel, countyName, cityName }: Props) {
  const approvalsHref = eventApprovalsHref({ city: cityName, county: countyName });

  return (
    <div className="ep-card mb-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Calendar binding</h2>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
            Locked visits · revisit flags · event approvals · week plan for {locationLabel}
          </p>
        </div>
        <Link href={approvalsHref} className="ep-chapter-link text-sm">
          Event approvals →
        </Link>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {binding.nextLockedVisit ? (
          <LockedVisitCard entry={binding.nextLockedVisit} />
        ) : (
          <div className="rounded-lg border border-dashed border-[var(--ep-border)] p-4 text-sm text-[var(--ep-navy-muted)]">
            No upcoming locked or scheduled visit on the executive calendar for this location.
          </div>
        )}

        {binding.revisit ? (
          <div className="rounded-lg border border-[var(--ep-border)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">Tier 1 revisit</p>
            <span className={cn("mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold", revisitClass(binding.revisit.status))}>
              {binding.revisit.label}
            </span>
            {binding.revisit.nextLockedDate ? (
              <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
                Next locked: {binding.revisit.nextLockedDate} — {binding.revisit.nextLockedEvent}
              </p>
            ) : null}
            {binding.revisit.lastVisitDate ? (
              <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">Last visit: {binding.revisit.lastVisitDate}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      {binding.currentWeekPlan ? (
        <div className="mt-4 rounded-lg border border-[var(--ep-gold)]/40 bg-[var(--ep-cream)]/30 p-4">
          <p className="text-xs font-semibold uppercase text-[var(--ep-gold)]">Current week plan · Week {binding.currentWeekPlan.weekNumber}</p>
          <p className="mt-1 font-semibold text-[var(--ep-navy)]">{binding.currentWeekPlan.cluster}</p>
          <p className="text-sm text-[var(--ep-navy-muted)]">{binding.currentWeekPlan.focus}</p>
          <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{binding.currentWeekPlan.range}</p>
        </div>
      ) : binding.weekPlans.length > 0 ? (
        <div className="mt-4 text-sm text-[var(--ep-navy-muted)]">
          On week plan: {binding.weekPlans.map((w) => `Week ${w.weekNumber}`).join(", ")}
        </div>
      ) : null}

      {binding.eventApprovals.length > 0 ? (
        <div className="mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">Event approvals queue</h3>
          <ul className="mt-2">
            {binding.eventApprovals.map((item) => (
              <ApprovalRow key={item.slug} item={item} countyName={countyName} cityName={cityName} />
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-4 text-sm text-[var(--ep-navy-muted)]">No events in the approval queue for this location this week.</p>
      )}
    </div>
  );
}
