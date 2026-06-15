import { notFound } from "next/navigation";

import { LanesCountyAreasPanel } from "@/components/election-plan/LanesCountyAreasPanel";
import { buildLanesDrillDown, getLanesCountyInCluster } from "@/lib/election-plan/load-lanes-drill-down";
import { loadElectionPlanSnapshot } from "@/lib/election-plan/electionPlanSnapshot";

type Props = { params: Promise<{ clusterId: string; countySlug: string }> };

export function generateStaticParams() {
  const data = loadElectionPlanSnapshot();
  return buildLanesDrillDown(data).clusters.flatMap((cluster) =>
    cluster.counties.map((county) => ({ clusterId: cluster.id, countySlug: county.slug })),
  );
}

export async function generateMetadata({ params }: Props) {
  const { clusterId, countySlug } = await params;
  const data = loadElectionPlanSnapshot();
  const result = getLanesCountyInCluster(data, clusterId, countySlug);
  if (!result) return { title: "County not found" };
  return {
    title: `${result.county.county} County · ${result.cluster.name}`,
    description: `Four lane vote projection by city, town, and geographic area — Kelly Grappe victory plan`,
    robots: { index: false, follow: false },
  };
}

export default async function LanesCountyAreasPage({ params }: Props) {
  const { clusterId, countySlug } = await params;
  const data = loadElectionPlanSnapshot();
  const result = getLanesCountyInCluster(data, clusterId, countySlug);
  if (!result) notFound();

  return (
    <>
      <div className="ep-classification">Internal · Four Lanes · {result.county.county} County areas</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <LanesCountyAreasPanel cluster={result.cluster} county={result.county} />
        </div>
      </div>
    </>
  );
}
