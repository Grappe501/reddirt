import { CityStrategyList } from "@/components/election-plan/CityStrategyList";
import { LocationBriefWeekRollupPanel } from "@/components/election-plan/LocationBriefWeekRollupPanel";
import { computeBriefCompletionRollup } from "@/lib/election-plan/location-calendar-binding";
import { priorityCitiesCombinedTarget } from "@/lib/election-plan/electionPlanData";
import { loadElectionPlanSnapshot } from "@/lib/election-plan/electionPlanSnapshot";

export const metadata = {
  title: "Priority Cities | Kelly Grappe Victory Plan",
  description: "100 ranked priority cities — each opens a location brief board with field narrative.",
  robots: { index: false, follow: false },
};

export default function PriorityCitiesPage() {
  const data = loadElectionPlanSnapshot();
  const rollup = computeBriefCompletionRollup(data.cities, data);
  return (
    <>
      <div className="ep-classification">Internal · Priority cities · Location briefs</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <LocationBriefWeekRollupPanel rollup={rollup} cities={data.cities} data={data} />
          <CityStrategyList cities={data.cities} combinedTargetVotes={priorityCitiesCombinedTarget(data)} standalone />
        </div>
      </div>
    </>
  );
}
