import { CountyPartiesHubPanel } from "@/components/election-plan/CountyPartyIntelligencePanel";
import { CountyMeetingTrackerPanel } from "@/components/election-plan/CountyMeetingTrackerPanel";

export const metadata = {
  title: "County Party Intelligence | Election Plan",
  robots: { index: false, follow: false },
};

export default function CountyPartiesHubPage() {
  return (
    <>
      <div className="ep-classification">Phase 18.7I · County Party Intelligence · DPA officer list · ArkDems meetings</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <CountyPartiesHubPanel />
          <CountyMeetingTrackerPanel />
        </div>
      </div>
    </>
  );
}
