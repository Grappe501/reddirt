import { notFound } from "next/navigation";

import { BattlefieldClusterPanel } from "@/components/election-plan/BattlefieldClusterPanel";
import { loadElectionPlanSnapshot } from "@/lib/election-plan/electionPlanSnapshot";

type Props = { params: Promise<{ clusterId: string }> };

export function generateStaticParams() {
  const data = loadElectionPlanSnapshot();
  return data.execution.clusters.map((c) => ({ clusterId: c.id }));
}

export async function generateMetadata({ params }: Props) {
  const { clusterId } = await params;
  const data = loadElectionPlanSnapshot();
  const cluster = data.execution.clusters.find((c) => c.id === clusterId);
  if (!cluster) return { title: "Cluster not found" };
  return {
    title: `${cluster.name} | Arkansas Battlefield`,
    description: `${cluster.counties.length} counties · VCI ${cluster.vci.toLocaleString()} · Kelly Grappe victory plan`,
    robots: { index: false, follow: false },
  };
}

export default async function BattlefieldClusterPage({ params }: Props) {
  const { clusterId } = await params;
  const data = loadElectionPlanSnapshot();
  const cluster = data.execution.clusters.find((c) => c.id === clusterId);
  if (!cluster) notFound();

  return (
    <>
      <div className="ep-classification">Internal · Arkansas Battlefield · Cluster drill-down</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <BattlefieldClusterPanel cluster={cluster} counties={data.counties} />
        </div>
      </div>
    </>
  );
}
