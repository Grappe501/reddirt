import { notFound } from "next/navigation";

import { LanesClusterPanel } from "@/components/election-plan/LanesClusterPanel";
import { buildLanesDrillDown, getLanesCluster } from "@/lib/election-plan/load-lanes-drill-down";
import { loadElectionPlanSnapshot } from "@/lib/election-plan/electionPlanSnapshot";

type Props = { params: Promise<{ clusterId: string }> };

export function generateStaticParams() {
  const data = loadElectionPlanSnapshot();
  return buildLanesDrillDown(data).clusters.map((c) => ({ clusterId: c.id }));
}

export async function generateMetadata({ params }: Props) {
  const { clusterId } = await params;
  const data = loadElectionPlanSnapshot();
  const cluster = getLanesCluster(data, clusterId);
  if (!cluster) return { title: "Cluster not found" };
  return {
    title: `${cluster.name} · Four Lanes`,
    description: `Expected lane capture by county — ${cluster.counties.length} counties · Kelly Grappe victory plan`,
    robots: { index: false, follow: false },
  };
}

export default async function LanesClusterPage({ params }: Props) {
  const { clusterId } = await params;
  const data = loadElectionPlanSnapshot();
  const cluster = getLanesCluster(data, clusterId);
  if (!cluster) notFound();

  return (
    <>
      <div className="ep-classification">Internal · Four Lanes · Cluster drill-down</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <LanesClusterPanel cluster={cluster} expectedProjection={data.lanesOverview.expectedProjection} />
        </div>
      </div>
    </>
  );
}
