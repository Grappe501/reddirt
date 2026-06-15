import { AssignmentsTrackerPanel } from "@/components/election-plan/CampaignAcademyOnboardingPanels";

export const metadata = {
  title: "Assignments | Campaign Academy",
  robots: { index: false, follow: false },
};

export default function AcademyAssignmentsPage() {
  return (
    <>
      <div className="ep-classification">Phase 18.7C · Assignment tracker</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <AssignmentsTrackerPanel />
        </div>
      </div>
    </>
  );
}
