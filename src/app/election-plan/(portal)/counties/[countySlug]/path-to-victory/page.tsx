import { notFound } from "next/navigation";

import { PathToVictoryDrillDownPanel } from "@/components/election-plan/PathToVictoryDrillDownPanel";
import { loadCountyWorkbenchV3 } from "@/lib/election-plan/county-workbench/load-county-workbench-v3";
import { loadElectionPlanSnapshot } from "@/lib/election-plan/electionPlanSnapshot";
import { getCountyBySlug } from "@/lib/election-plan/load-county";
import { buildCountyPathToVictory } from "@/lib/election-plan/path-to-victory-drill-down";

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
    title: `${county.county} County · Path to Victory | Election Plan`,
    description: `Lane-by-lane vote math, registration, house parties, fundraising, coalition focus, and volunteer priorities for ${county.county} County`,
    robots: { index: false, follow: false },
  };
}

export default async function CountyPathToVictoryPage({ params }: Props) {
  const { countySlug } = await params;
  const data = loadElectionPlanSnapshot();
  const county = getCountyBySlug(data, countySlug);
  if (!county) notFound();

  const countyIntel = await loadCountyWorkbenchV3(county).catch(() => null);
  const view = buildCountyPathToVictory(county.slug, {
    narrative: countyIntel?.campaignReasoning.pathToVictory ?? null,
    engagementThisWeek: countyIntel?.campaignReasoning.engagementPlan ?? [],
  });

  if (!view) notFound();

  return (
    <>
      <div className="ep-classification">Internal · Path to Victory · {county.county} County</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <PathToVictoryDrillDownPanel view={view} />
        </div>
      </div>
    </>
  );
}
