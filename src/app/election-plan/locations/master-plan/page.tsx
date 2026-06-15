import { LocationBriefMasterPlanPanel } from "@/components/election-plan/LocationBriefMasterPlanPanel";

export const metadata = {
  title: "Location Brief Master Plan | Kelly Grappe Victory Plan",
  description: "Phased plan to finish city location briefs and county workbench integration.",
  robots: { index: false, follow: false },
};

export default function LocationBriefMasterPlanPage() {
  return (
    <>
      <div className="ep-classification">Internal · Location brief · Master plan</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <LocationBriefMasterPlanPanel />
        </div>
      </div>
    </>
  );
}
