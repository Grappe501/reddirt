import { notFound } from "next/navigation";

import { CountyPlaybookPanel } from "@/components/election-plan/CountyPlaybookPanel";
import { buildCountyWorkbenchV4OperationalView } from "@/lib/election-plan/county-workbench/build-county-v4-operational";
import { loadCountyWorkbenchV3 } from "@/lib/election-plan/county-workbench/load-county-workbench-v3";
import { getCitiesInCounty, getCountyBySlug } from "@/lib/election-plan/load-county";
import { getCountyStrikeTeamBySlug } from "@/lib/election-plan/load-county-strike-team";
import { buildCountyCalendarBinding } from "@/lib/election-plan/location-calendar-binding";
import { fieldEventsForLocation } from "@/lib/election-plan/location-calendar-integration";
import { loadElectionPlanSnapshot } from "@/lib/election-plan/electionPlanSnapshot";
import { loadCurrentElectionPlanOperator } from "@/lib/election-plan/auth/load-current-operator";
import { getFosCountyRollup } from "@/lib/election-plan/load-fundraising-operating-system";
import { loadCountyPlaybookMarkdown } from "@/lib/election-plan/load-county-playbook-markdown";
import { loadFieldEntriesForLocation } from "@/lib/election-plan/field-entry/load-field-entries";

type Props = { params: Promise<{ countySlug: string }> };

export const dynamic = "force-dynamic";

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
    title: `${county.county} County | County intelligence`,
    description: `County intelligence drilldown — VCI, vote targets, cities, leadership, fundraising, field activity, demographics, and election history for ${county.county} County`,
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
  const [fieldEntrySummary, operator, countyIntel] = await Promise.all([
    loadFieldEntriesForLocation({ countySlug: county.slug }),
    loadCurrentElectionPlanOperator(),
    loadCountyWorkbenchV3(county),
  ]);

  const fosCountyRollup = getFosCountyRollup(county.slug);
  const v4Ops = buildCountyWorkbenchV4OperationalView(strikeTeam, fieldEntrySummary);
  const playbookMarkdown = loadCountyPlaybookMarkdown(county.playbookPath);

  return (
    <>
      <div className="ep-classification">Internal · County intelligence · {county.county} County</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-6xl">
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
            fieldEntrySummary={fieldEntrySummary}
            operatorInitials={operator?.initials ?? null}
            fosCountyRollup={fosCountyRollup}
            countyIntel={countyIntel}
            v4Ops={v4Ops}
            playbookMarkdown={playbookMarkdown}
          />
        </div>
      </div>
    </>
  );
}
