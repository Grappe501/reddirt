import { LanesOverviewPanel } from "@/components/election-plan/LanesOverviewPanel";
import { buildLanesDrillDown } from "@/lib/election-plan/load-lanes-drill-down";
import { loadElectionPlanSnapshot } from "@/lib/election-plan/electionPlanSnapshot";

export const metadata = {
  title: "Vote Projection · Four Lanes | Kelly Grappe Victory Plan",
  description: "Expected scenario breakdown — where projected votes come from across four lanes.",
  robots: { index: false, follow: false },
};

export default function LanesOverviewPage() {
  const data = loadElectionPlanSnapshot();
  const drillDown = buildLanesDrillDown(data);

  return (
    <>
      <div className="ep-classification">Internal · Four Lanes · Scenario engine</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <LanesOverviewPanel
            overview={data.lanesOverview}
            clusterDrillDown={drillDown.clusters}
            standalone
          />
        </div>
      </div>
    </>
  );
}
