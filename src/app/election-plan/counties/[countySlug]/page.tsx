import { notFound } from "next/navigation";

import { CountyPlaybookPanel } from "@/components/election-plan/CountyPlaybookPanel";
import { getCitiesInCounty, getCountyBySlug } from "@/lib/election-plan/load-county";
import { getCountyStrikeTeamBySlug } from "@/lib/election-plan/load-county-strike-team";
import { buildCountyCalendarBinding } from "@/lib/election-plan/location-calendar-binding";
import { fieldEventsForLocation } from "@/lib/election-plan/location-calendar-integration";
import { loadElectionPlanSnapshot } from "@/lib/election-plan/electionPlanSnapshot";

type Props = { params: Promise<{ countySlug: string }> };

export function generateStaticParams() {
  const data = loadElectionPlanSnapshot();
  return data.counties.map((c) => ({ countySlug: c.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { countySlug } = await params;
  const data = loadElectionPlanSnapshot();
  const county = getCountyBySlug(data, countySlug);
  if (!county) return { title: "County not found" };
  return {
    title: `${county.county} County | County playbook`,
    description: `County playbook, strike team, field calendar, and Kelly outreach contacts for ${county.county} County`,
    robots: { index: false, follow: false },
  };
}

export default async function ElectionPlanCountyPage({ params }: Props) {
  const { countySlug } = await params;
  const data = loadElectionPlanSnapshot();
  const county = getCountyBySlug(data, countySlug);
  if (!county) notFound();

  const priorityCities = getCitiesInCounty(data.cities, county.county);
  const strikeTeam = getCountyStrikeTeamBySlug(county.slug);
  const fieldEvents = fieldEventsForLocation(data.executiveCalendar.entries, {
    countyName: county.county,
    referenceDate: data.executiveCalendar.referenceDate,
    limit: 8,
  });
  const countyCalendar = buildCountyCalendarBinding(data, county.county);

  return (
    <>
      <div className="ep-classification">Internal · County playbook · {county.county} County</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <CountyPlaybookPanel
            county={county}
            priorityCities={priorityCities}
            allCities={data.cities}
            strikeTeam={strikeTeam}
            fieldEvents={fieldEvents}
            calendarBinding={{
              nextLockedVisit: countyCalendar.nextLockedVisit,
              revisit: countyCalendar.revisit,
              eventApprovals: countyCalendar.eventApprovals,
              weekPlans: countyCalendar.weekPlans,
              currentWeekPlan: countyCalendar.weekPlans.find((w) => w.isCurrentWeek) ?? null,
            }}
            referenceDate={data.executiveCalendar.referenceDate}
          />
        </div>
      </div>
    </>
  );
}
