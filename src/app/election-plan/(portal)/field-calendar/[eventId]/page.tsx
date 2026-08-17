import { notFound } from "next/navigation";

import { FieldEventWorksheetPanel } from "@/components/election-plan/FieldEventWorksheetPanel";
import { CountyPartyOfficerRoster } from "@/components/election-plan/CountyPartyOfficerRoster";
import {
  findForwardMotionMatch,
  getExecutiveCalendarEntry,
  getSourceWorksheetOverrides,
} from "@/lib/election-plan/load-field-event";
import {
  buildCitySlugLookup,
  resolveCitySlug,
} from "@/lib/election-plan/location-calendar-integration";
import { cityLocationBriefHref } from "@/lib/election-plan/location-links";
import { getCountyByName } from "@/lib/election-plan/load-county";
import { loadElectionPlanSnapshot } from "@/lib/election-plan/electionPlanSnapshot";
import { getDpaOfficerOrgsForLocation } from "@/lib/election-plan/load-dpa-county-officers";

type Props = { params: Promise<{ eventId: string }> };

export function generateStaticParams() {
  const data = loadElectionPlanSnapshot();
  return data.executiveCalendar.entries.map((e) => ({ eventId: e.id }));
}

export async function generateMetadata({ params }: Props) {
  const { eventId } = await params;
  const decoded = decodeURIComponent(eventId);
  const data = loadElectionPlanSnapshot();
  const entry = getExecutiveCalendarEntry(data, decoded);
  if (!entry) return { title: "Event not found" };
  return {
    title: `${entry.label} | Field worksheet`,
    description: `Run of day, messaging, volunteers, and logistics for ${entry.label}`,
    robots: { index: false, follow: false },
  };
}

export default async function FieldEventWorksheetPage({ params }: Props) {
  const { eventId } = await params;
  const decoded = decodeURIComponent(eventId);
  const data = loadElectionPlanSnapshot();
  const entry = getExecutiveCalendarEntry(data, decoded);
  if (!entry) notFound();

  const sourceOverrides = getSourceWorksheetOverrides(decoded);
  const forwardMotion = findForwardMotionMatch(data, entry);
  const cityLookup = buildCitySlugLookup(data.cities);
  const citySlug = resolveCitySlug(entry.city, cityLookup);
  const cityBriefHref = citySlug ? cityLocationBriefHref(citySlug) : undefined;
  const countyRecord = getCountyByName(data, entry.county);
  const countySlug = countyRecord?.slug;
  const officerOrgs = getDpaOfficerOrgsForLocation({
    countySlug,
    city: entry.city,
    eventSlug: entry.label,
  });

  return (
    <>
      <div className="ep-classification">Internal · Field calendar · Event worksheet</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-4xl">
          {officerOrgs.length > 0 ? (
            <div className="mb-8">
              <CountyPartyOfficerRoster orgs={officerOrgs} variant="full" title="County party officers for this stop" />
            </div>
          ) : null}
          <FieldEventWorksheetPanel
            entry={entry}
            sourceOverrides={sourceOverrides}
            forwardMotion={forwardMotion}
            cityBriefHref={cityBriefHref}
            countySlug={countySlug}
          />
        </div>
      </div>
    </>
  );
}
