import { notFound } from "next/navigation";

import { PathToVictoryDrillDownPanel } from "@/components/election-plan/PathToVictoryDrillDownPanel";
import { loadElectionPlanSnapshot } from "@/lib/election-plan/electionPlanSnapshot";
import { getCityLocationBrief } from "@/lib/election-plan/load-city-location-brief";
import { buildCityPathToVictory } from "@/lib/election-plan/path-to-victory-drill-down";

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
    title: `${brief.name} · Path to Victory | Election Plan`,
    description: `City lane breakdown, registration, house parties, and volunteer focus for ${brief.name}, ${brief.county} County`,
    robots: { index: false, follow: false },
  };
}

export default async function CityPathToVictoryPage({ params }: Props) {
  const { slug } = await params;
  const data = loadElectionPlanSnapshot();
  const brief = getCityLocationBrief(slug, data.cities);
  if (!brief) notFound();

  const view = buildCityPathToVictory(slug);
  if (!view) notFound();

  return (
    <>
      <div className="ep-classification">
        Internal · Path to Victory · {brief.name} · {brief.county} County
      </div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <PathToVictoryDrillDownPanel view={view} />
        </div>
      </div>
    </>
  );
}
