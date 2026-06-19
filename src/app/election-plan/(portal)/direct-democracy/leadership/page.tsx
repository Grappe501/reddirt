import { ImmersionCountyMissionCard } from "@/components/election-plan/ImmersionCountyMissionCard";
import { DirectDemocracyLeadershipPanel } from "@/components/election-plan/Phase187BOwnershipPanels";
import {
  getImmersionMissionById,
  JACKSONVILLE_DD_MISSION_ID,
} from "@/lib/election-plan/load-immersion-county-missions";

export const metadata = {
  title: "Direct Democracy Leadership | Election Plan",
  robots: { index: false, follow: false },
};

export default function DirectDemocracyLeadershipPage() {
  const jacksonvilleMission = getImmersionMissionById(JACKSONVILLE_DD_MISSION_ID);

  return (
    <>
      <div className="ep-classification">Internal · Phase 18.7B · Ballot Initiative Support</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl space-y-8">
          {jacksonvilleMission ? (
            <ImmersionCountyMissionCard mission={jacksonvilleMission} />
          ) : null}
          <DirectDemocracyLeadershipPanel />
        </div>
      </div>
    </>
  );
}
