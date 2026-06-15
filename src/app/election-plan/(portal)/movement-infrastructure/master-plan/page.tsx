import { Phase18BuildMasterPlanPanel } from "@/components/election-plan/Phase18BuildMasterPlanPanel";

export const metadata = {
  title: "Phase 18 Build Plan | Movement Infrastructure",
  description: "Statewide Influence & Movement Infrastructure — Arkansas campus network, trust network, direct democracy, story corps.",
  robots: { index: false, follow: false },
};

export default function Phase18MasterPlanPage() {
  return (
    <>
      <div className="ep-classification">Internal · Phase 18 · Build master plan</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <Phase18BuildMasterPlanPanel />
        </div>
      </div>
    </>
  );
}
