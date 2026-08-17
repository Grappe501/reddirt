import Link from "next/link";

import type { ExecutiveCalendarEntry } from "@/lib/election-plan/field-event-worksheet-storage";
import { fieldEventWorksheetHref } from "@/lib/election-plan/field-calendar-links";
import {
  buildCitySlugLookup,
  resolveCitySlug,
} from "@/lib/election-plan/location-calendar-integration";
import { cityLocationBriefHref, countyPlaybookHref } from "@/lib/election-plan/location-links";
import type { ElectionPlanCity } from "@/lib/election-plan/types";
import { cn } from "@/lib/utils";
import { CountyPartyOfficerRoster } from "@/components/election-plan/CountyPartyOfficerRoster";
import { getDpaOfficerOrgsForLocation } from "@/lib/election-plan/load-dpa-county-officers";

type Props = {
  title?: string;
  subtitle?: string;
  upcoming: ExecutiveCalendarEntry[];
  recent?: ExecutiveCalendarEntry[];
  cities: ElectionPlanCity[];
  countyName: string;
  countySlug: string;
  showCountyLink?: boolean;
};

const categoryClass: Record<string, string> = {
  past_visit: "bg-slate-100 text-slate-700",
  locked: "bg-[var(--ep-navy)] text-white",
  scheduled: "bg-emerald-100 text-emerald-800",
  proposed: "bg-amber-100 text-amber-900",
};

function EventRow({
  entry,
  cityLookup,
  countySlug,
}: {
  entry: ExecutiveCalendarEntry;
  cityLookup: Map<string, string>;
  countySlug: string;
}) {
  const citySlug = resolveCitySlug(entry.city, cityLookup);
  return (
    <li className="flex flex-wrap items-start justify-between gap-2 border-b border-[var(--ep-border)] py-3 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-[var(--ep-gold)]">{entry.startDate}</p>
        <Link href={fieldEventWorksheetHref(entry.id)} className="font-medium text-[var(--ep-navy)] hover:text-[var(--ep-gold)]">
          {entry.label}
        </Link>
        {entry.city && entry.city !== "TBD" ? (
          <p className="text-xs text-[var(--ep-navy-muted)]">{entry.city}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "rounded px-2 py-0.5 text-[10px] font-semibold uppercase",
            categoryClass[entry.category] ?? "bg-[var(--ep-cream)]",
          )}
        >
          {entry.category.replace(/_/g, " ")}
        </span>
        {citySlug ? (
          <Link href={cityLocationBriefHref(citySlug)} className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
            City brief →
          </Link>
        ) : null}
        <Link
          href={fieldEventWorksheetHref(entry.id)}
          className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]"
        >
          Worksheet →
        </Link>
      </div>
    </li>
  );
}

export function LocationFieldEventsPanel({
  title = "Field calendar",
  subtitle,
  upcoming,
  recent = [],
  cities,
  countyName,
  countySlug,
  showCountyLink = true,
}: Props) {
  const cityLookup = buildCitySlugLookup(cities);
  const officerOrgs = getDpaOfficerOrgsForLocation({ countySlug });

  if (upcoming.length === 0 && recent.length === 0) {
    return (
      <div className="ep-card">
        <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">{title}</h2>
        <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">No field calendar entries for this location yet.</p>
        {officerOrgs.length > 0 ? (
          <div className="mt-3">
            <CountyPartyOfficerRoster orgs={officerOrgs} variant="compact" />
          </div>
        ) : null}
        {showCountyLink ? (
          <Link href={countyPlaybookHref(countyName, countySlug)} className="ep-chapter-link mt-3 inline-block text-sm">
            {countyName} County playbook →
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <div className="ep-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{subtitle}</p> : null}
          {officerOrgs.length > 0 ? (
            <div className="mt-2">
              <CountyPartyOfficerRoster orgs={officerOrgs} variant="compact" />
            </div>
          ) : null}
        </div>
        <Link href="/election-plan?tab=fieldCalendar" className="ep-chapter-link text-sm">
          Full field calendar →
        </Link>
      </div>

      {upcoming.length > 0 ? (
        <div className="mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">Upcoming</h3>
          <ul className="mt-1">
            {upcoming.map((e) => (
              <EventRow key={e.id} entry={e} cityLookup={cityLookup} countySlug={countySlug} />
            ))}
          </ul>
        </div>
      ) : null}

      {recent.length > 0 ? (
        <div className="mt-4 border-t border-[var(--ep-border)] pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">Recent visits</h3>
          <ul className="mt-1">
            {recent.map((e) => (
              <EventRow key={e.id} entry={e} cityLookup={cityLookup} countySlug={countySlug} />
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
