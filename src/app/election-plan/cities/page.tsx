import { CityStrategyList } from "@/components/election-plan/CityStrategyList";
import { loadElectionPlanSnapshot } from "@/lib/election-plan/electionPlanSnapshot";

export const metadata = {
  title: "Priority Cities | Kelly Grappe Victory Plan",
  description: "40 ranked priority cities — each opens a location brief board with field narrative.",
  robots: { index: false, follow: false },
};

export default function PriorityCitiesPage() {
  const data = loadElectionPlanSnapshot();
  return (
    <>
      <div className="ep-classification">Internal · Priority cities · Location briefs</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <CityStrategyList cities={data.cities} combinedTargetVotes={data.top40TargetVotes} standalone />
        </div>
      </div>
    </>
  );
}
