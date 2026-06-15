import { SearcyCountyTrustPilotPanel } from "@/components/election-plan/Phase187BOwnershipPanels";

export const metadata = {
  title: "Searcy County Trust Project | Election Plan",
  robots: { index: false, follow: false },
};

export default function SearcyTrustPilotPage() {
  return (
    <>
      <div className="ep-classification">Internal · Phase 18.7B · Trust pilot</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <SearcyCountyTrustPilotPanel />
        </div>
      </div>
    </>
  );
}
