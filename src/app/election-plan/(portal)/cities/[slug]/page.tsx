import { notFound } from "next/navigation";

import { CityLocationBriefPanel } from "@/components/election-plan/CityLocationBriefPanel";
import { getCityLocationBrief } from "@/lib/election-plan/load-city-location-brief";
import { getCitiesInCounty, getCountyByName } from "@/lib/election-plan/load-county";
import { getCountyStrikeTeamByName } from "@/lib/election-plan/load-county-strike-team";
import { buildLocationCalendarBinding } from "@/lib/election-plan/location-calendar-binding";
import { fieldEventsForLocation } from "@/lib/election-plan/location-calendar-integration";
import { loadElectionPlanSnapshot } from "@/lib/election-plan/electionPlanSnapshot";
import { loadCurrentElectionPlanOperator } from "@/lib/election-plan/auth/load-current-operator";
import { loadFieldEntriesForLocation } from "@/lib/election-plan/field-entry/load-field-entries";
import { loadLocationFundraisingForCity } from "@/lib/election-plan/load-location-fundraising";
import { getCityIntelligenceProfile } from "@/lib/election-plan/load-city-intelligence-profile";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  const data = loadElectionPlanSnapshot();
  return data.cities.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const data = loadElectionPlanSnapshot();
  const brief = getCityLocationBrief(slug, data.cities);
  if (!brief) return { title: "City not found" };
  return {
    title: `${brief.name} | Location Brief`,
    description: brief.briefBoard.slice(0, 160),
    robots: { index: false, follow: false },
  };
}

export default async function CityLocationBriefPage({ params }: Props) {
  const { slug } = await params;

  const data = loadElectionPlanSnapshot();
  const brief = getCityLocationBrief(slug, data.cities);
  if (!brief) notFound();

  const countyKpi = getCountyByName(data, brief.county);
  const countySlug = countyKpi?.slug ?? brief.county.toLowerCase().replace(/\s+/g, "-");
  const strikeTeam = getCountyStrikeTeamByName(brief.county);
  const siblingCities = getCitiesInCounty(data.cities, brief.county);
  const fieldEvents = fieldEventsForLocation(data.executiveCalendar.entries, {
    countyName: brief.county,
    cityName: brief.name,
    referenceDate: data.executiveCalendar.referenceDate,
    limit: 6,
  });
  const calendarBinding = buildLocationCalendarBinding(data, {
    cityName: brief.name,
    countyName: brief.county,
    referenceDate: data.executiveCalendar.referenceDate,
  });
  const [fieldEntrySummary, operator, locationFundraising] = await Promise.all([
    loadFieldEntriesForLocation({ countySlug, citySlug: brief.slug }),
    loadCurrentElectionPlanOperator(),
    loadLocationFundraisingForCity(brief.slug),
  ]);

  const cityIntelligence = getCityIntelligenceProfile(brief.slug);

  return (
    <>
      <div className="ep-classification">Internal · Location brief · {brief.name}</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <CityLocationBriefPanel
            brief={brief}
            countyKpi={countyKpi}
            countySlug={countySlug}
            strikeTeam={strikeTeam}
            fieldEvents={fieldEvents}
            siblingCities={siblingCities}
            referenceDate={data.executiveCalendar.referenceDate}
            calendarBinding={calendarBinding}
            fieldEntrySummary={fieldEntrySummary}
            operatorInitials={operator?.initials ?? null}
            locationFundraising={locationFundraising}
            cityIntelligence={cityIntelligence ?? null}
          />
        </div>
      </div>
    </>
  );
}
