import { Phase13BuildMasterPlanPanel } from "@/components/election-plan/Phase13BuildMasterPlanPanel";

export const metadata = {
  title: "Phase 13 Build Plan | Forward Motion",
  description: "Sub-phases to complete the Forward Motion Activation System.",
  robots: { index: false, follow: false },
};

export default function Phase13BuildMasterPlanPage() {
  return (
    <>
      <div className="ep-classification">Internal · Phase 13 · Build master plan</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <Phase13BuildMasterPlanPanel />
        </div>
      </div>
    </>
  );
}
