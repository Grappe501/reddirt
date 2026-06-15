import { CampaignResponsibilityMatrixPanel } from "@/components/election-plan/Phase187BOwnershipPanels";

export const metadata = {
  title: "Responsibility Matrix | Election Plan",
  robots: { index: false, follow: false },
};

export default function ResponsibilityMatrixPage() {
  return (
    <>
      <div className="ep-classification">Internal · Phase 18.7B</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <CampaignResponsibilityMatrixPanel />
        </div>
      </div>
    </>
  );
}
