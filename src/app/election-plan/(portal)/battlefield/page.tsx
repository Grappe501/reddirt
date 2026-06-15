import { BattlefieldOverviewPanel } from "@/components/election-plan/BattlefieldOverviewPanel";
import { loadElectionPlanSnapshot } from "@/lib/election-plan/electionPlanSnapshot";

export const metadata = {
  title: "Arkansas Battlefield | Kelly Grappe Victory Plan",
  description: "Nine geographic clusters · 75 counties · VCI-ranked campaign missions.",
  robots: { index: false, follow: false },
};

export default function BattlefieldOverviewPage() {
  const data = loadElectionPlanSnapshot();

  return (
    <>
      <div className="ep-classification">Internal · Part III · Arkansas Battlefield</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <BattlefieldOverviewPanel clusters={data.execution.clusters} standalone />
        </div>
      </div>
    </>
  );
}
