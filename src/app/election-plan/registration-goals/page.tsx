import { RegistrationGoalsPanel } from "@/components/election-plan/RegistrationGoalsPanel";
import { FOUR_LANE_DEFINITIONS } from "@/lib/election-plan/four-lanes-labels";
import { loadElectionPlanSnapshot } from "@/lib/election-plan/electionPlanSnapshot";

export const metadata = {
  title: "County Registration Goals | Kelly Grappe Victory Plan",
  description: `${FOUR_LANE_DEFINITIONS.lane3.fullLabel} goals by county — 50,000 statewide across 75 counties.`,
  robots: { index: false, follow: false },
};

export default function RegistrationGoalsPage() {
  const data = loadElectionPlanSnapshot();
  const statewideGoal = data.warRoom.registrationGoal;

  return (
    <>
      <div className="ep-classification">Internal · {FOUR_LANE_DEFINITIONS.lane3.fullLabel} · 75 counties</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <RegistrationGoalsPanel counties={data.counties} statewideGoal={statewideGoal} standalone />
        </div>
      </div>
    </>
  );
}
